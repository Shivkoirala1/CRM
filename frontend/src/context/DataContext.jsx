import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

const DataContext = createContext(null);

/**
 * Owns auth state (JWT session) and every CRM collection, all backed by
 * the real Django API — see src/services/api.js for the endpoints. On
 * mount it tries to restore a session from a stored access token; once
 * signed in, it loads all collections and the two dashboard aggregate
 * endpoints once, and exposes setters so views can update local state
 * from what the backend returns on create/update rather than refetching
 * everything.
 */
export function DataProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [u, l, c, p, t, i] = await Promise.all([
        api.getUsers(),
        api.getLeads(),
        api.getClients(),
        api.getProjects(),
        api.getTasks(),
        api.getInvoices(),
      ]);
      setUsers(u);
      setLeads(l);
      setClients(c);
      setProjects(p);
      setTasks(t);
      setInvoices(i);
      // Dashboard aggregates are non-fatal — the dashboards fall back to
      // computing what they can from the collections above if this fails.
      try {
        const [stats, revenue] = await Promise.all([api.getDashboardStats(), api.getRevenueReport()]);
        setDashboardStats(stats);
        setRevenueReport(revenue);
      } catch {
        setDashboardStats(null);
        setRevenueReport(null);
      }
    } catch (err) {
      setDataError(api.getErrorMessage(err));
    } finally {
      setDataLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  // Restore session from a stored token on first load.
  useEffect(() => {
    (async () => {
      if (api.hasToken()) {
        try {
          const me = await api.getMe();
          setAuthUser(me);
        } catch {
          api.clearTokens();
        }
      }
      setAuthLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (authUser) loadAll();
  }, [authUser, loadAll]);

  const login = useCallback(async (username, password) => {
    const me = await api.login(username, password); // throws ApiError on bad credentials
    setAuthUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setAuthUser(null);
    setUsers([]);
    setLeads([]);
    setClients([]);
    setProjects([]);
    setTasks([]);
    setInvoices([]);
    setDashboardStats(null);
    setRevenueReport(null);
    setHasLoadedOnce(false);
  }, []);

  const value = {
    authUser,
    authLoading,
    login,
    logout,
    users,
    setUsers,
    leads,
    setLeads,
    clients,
    setClients,
    projects,
    setProjects,
    tasks,
    setTasks,
    invoices,
    setInvoices,
    dashboardStats,
    revenueReport,
    dataLoading,
    dataError,
    hasLoadedOnce,
    reload: loadAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}

export const useUsers = () => useData().users;
