import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

const DataContext = createContext(null);

/**
 * Holds auth state (currentUser) plus all CRM collections, loaded from the
 * real API once someone is logged in. Nothing is fetched before login,
 * since every endpoint requires a valid token.
 */
export function DataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enrich clients with the project/invoice ids that reference them —
  // the Client API doesn't return these arrays directly, so ClientsView's
  // existing `client.projects.includes(...)` checks are backed by this.
  const enrichClients = useCallback((clientsList, projectsList, invoicesList) => {
    return clientsList.map((c) => ({
      ...c,
      projects: projectsList.filter((p) => p.client === c.id).map((p) => p.id),
      invoices: invoicesList.filter((i) => i.client === c.id).map((i) => i.id),
    }));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
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
      setClients(enrichClients(c, p, i));
      setProjects(p);
      setTasks(t);
      setInvoices(i);
      setNotifications(n);
      setActivity(a);
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    } finally {
      setLoading(false);
    }
  }, [enrichClients]);

  // On first mount, if a token is already stored, try to restore the
  // session by fetching the current user before loading any CRM data.
  useEffect(() => {
    (async () => {
      if (api.isAuthenticated()) {
        try {
          const me = await api.fetchCurrentUser();
          setCurrentUser(me);
        } catch {
          api.logout();
        }
      }
      setAuthChecked(true);
    })();
  }, []);

  useEffect(() => {
    if (currentUser) loadAll();
  }, [currentUser, loadAll]);

  const login = useCallback(async (username, password) => {
    setAuthError("");
    try {
      const user = await api.login(username, password);
      setCurrentUser(user);
      return true;
    } catch (err) {
      setAuthError(
        err.response?.data?.errors?.detail ||
        err.response?.data?.message ||
        "Invalid username or password."
      );
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
    setUsers([]); setLeads([]); setClients([]); setProjects([]);
    setTasks([]); setInvoices([]); setNotifications([]); setActivity([]);
  }, []);

  const value = {
    currentUser, authChecked, authError, login, logout,
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
