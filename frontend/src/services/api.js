/* =========================================================================
   API service layer.

   Each function targets the REST endpoint the Express/MongoDB backend is
   expected to expose (see the comment above each group). Until that
   backend exists, calls fail silently and resolve with the local mock
   data instead, so the frontend keeps working standalone. Once the real
   API is live, simply remove the fallback (or point VITE_API_BASE_URL at
   it) and these functions will start returning live data automatically.
   ========================================================================= */

import axiosClient from "./axiosClient";
import {
  INITIAL_LEADS, INITIAL_CLIENTS, INITIAL_PROJECTS, INITIAL_TASKS,
  INITIAL_INVOICES, NOTIFICATIONS, ACTIVITY, USERS,
} from "../data/mockData";

async function withFallback(request, fallbackValue) {
  try {
    const { data } = await request();
    return data;
  } catch (err) {
    // Backend not available yet — use local mock data.
    return fallbackValue;
  }
}

/* ---------------------------- Auth ------------------------------------ */
// POST /api/auth/login  { userId, password }
export const login = (userId, password) =>
  withFallback(
    () => axiosClient.post("/auth/login", { userId, password }),
    { user: USERS.find((u) => u.id === userId), token: "mock-token" }
  );

/* ---------------------------- Leads ------------------------------------ */
// GET    /api/leads
// POST   /api/leads
// PATCH  /api/leads/:id
export const getLeads = () => withFallback(() => axiosClient.get("/leads"), INITIAL_LEADS);
export const createLead = (payload) =>
  withFallback(() => axiosClient.post("/leads", payload), { ...payload, id: `LD-${Date.now()}` });
export const updateLead = (id, payload) =>
  withFallback(() => axiosClient.patch(`/leads/${id}`, payload), { id, ...payload });

/* ---------------------------- Clients ----------------------------------- */
// GET    /api/clients
// POST   /api/clients
export const getClients = () => withFallback(() => axiosClient.get("/clients"), INITIAL_CLIENTS);
export const createClient = (payload) =>
  withFallback(() => axiosClient.post("/clients", payload), { ...payload, id: `CL-${Date.now()}` });

/* ---------------------------- Projects ---------------------------------- */
// GET    /api/projects
// POST   /api/projects
// PATCH  /api/projects/:id
export const getProjects = () => withFallback(() => axiosClient.get("/projects"), INITIAL_PROJECTS);
export const createProject = (payload) =>
  withFallback(() => axiosClient.post("/projects", payload), { ...payload, id: `PR-${Date.now()}`, team: [] });

/* ---------------------------- Tasks ------------------------------------- */
// GET    /api/tasks
// POST   /api/tasks
// PATCH  /api/tasks/:id
export const getTasks = () => withFallback(() => axiosClient.get("/tasks"), INITIAL_TASKS);
export const createTask = (payload) =>
  withFallback(() => axiosClient.post("/tasks", payload), { ...payload, id: `TK-${Date.now()}`, status: "Pending" });
export const updateTaskStatus = (id, status) =>
  withFallback(() => axiosClient.patch(`/tasks/${id}`, { status }), { id, status });

/* ---------------------------- Invoices ----------------------------------- */
// GET    /api/invoices
// POST   /api/invoices
export const getInvoices = () => withFallback(() => axiosClient.get("/invoices"), INITIAL_INVOICES);
export const createInvoice = (payload) =>
  withFallback(() => axiosClient.post("/invoices", payload), { ...payload, id: `INV-${Date.now()}` });

/* ---------------------------- Notifications / activity / users ---------- */
// GET /api/notifications
// GET /api/activity
// GET /api/users
export const getNotifications = () => withFallback(() => axiosClient.get("/notifications"), NOTIFICATIONS);
export const getActivity = () => withFallback(() => axiosClient.get("/activity"), ACTIVITY);
export const getUsers = () => withFallback(() => axiosClient.get("/users"), USERS);
