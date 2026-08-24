import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

const DataContext = createContext(null);

/**
 * Loads all CRM collections once (via the API service layer, which falls
 * back to mock data if the backend isn't running yet) and exposes them —
 * plus setters — to the rest of the app through a single context.
 */
export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [u, l, c, p, t, i, n, a] = await Promise.all([
      api.getUsers(),
      api.getLeads(),
      api.getClients(),
      api.getProjects(),
      api.getTasks(),
      api.getInvoices(),
      api.getNotifications(),
      api.getActivity(),
    ]);
    setUsers(u);
    setLeads(l);
    setClients(c);
    setProjects(p);
    setTasks(t);
    setInvoices(i);
    setNotifications(n);
    setActivity(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const value = {
    users, setUsers,
    leads, setLeads,
    clients, setClients,
    projects, setProjects,
    tasks, setTasks,
    invoices, setInvoices,
    notifications, setNotifications,
    activity, setActivity,
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}

export const useUsers = () => useData().users;
