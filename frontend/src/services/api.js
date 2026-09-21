/* =========================================================================
   API service layer — talks to the real Django REST backend.

   Every function returns data already translated into the shape the UI
   components expect (see adapters.js). Errors are NOT swallowed with mock
   data anymore — they're thrown so the caller (DataContext) can decide
   what to do, and so real problems show up in the console instead of
   silently showing fake data.
   ========================================================================= */

import axiosClient, { tokenStorage } from "./axiosClient";
import {
  adaptUser, adaptLead, toBackendLead, adaptClient, toBackendClient,
  adaptProject, toBackendProject, adaptTask, toBackendTask, taskStatusToBackend,
  adaptInvoice, toBackendInvoice, adaptNotification, adaptActivity,
} from "./adapters";

// Every real response is wrapped as { success, message, data, errors }.
// unwrap() pulls out the actual payload; unwrapList() also defaults to [].
const unwrap = (res) => res.data.data;
const unwrapList = (res) => res.data.data || [];

/* ---------------------------- Auth ------------------------------------ */
// POST /token/  { username, password } -> { access, refresh }
// Then GET /me/ to get the profile (role, etc.) for the logged-in user.
export async function login(username, password) {
  const { data } = await axiosClient.post("/token/", { username, password });
  tokenStorage.set(data.access, data.refresh);
  const me = await axiosClient.get("/me/");
  return adaptUser(unwrap(me));
}

export function logout() {
  tokenStorage.clear();
}

export function isAuthenticated() {
  return !!tokenStorage.getAccess();
}

export async function fetchCurrentUser() {
  const res = await axiosClient.get("/me/");
  return adaptUser(unwrap(res));
}

/* ---------------------------- Leads ------------------------------------ */
export const getLeads = async () => unwrapList(await axiosClient.get("/leads/")).map(adaptLead);
export const createLead = async (form) =>
  adaptLead(unwrap(await axiosClient.post("/leads/", toBackendLead(form))));
export const updateLead = async (id, form) =>
  adaptLead(unwrap(await axiosClient.patch(`/leads/${id}/`, toBackendLead(form))));
export const deleteLead = async (id) => axiosClient.delete(`/leads/${id}/`);

/* ---------------------------- Clients ----------------------------------- */
export const getClients = async () => unwrapList(await axiosClient.get("/clients/")).map(adaptClient);
export const createClient = async (form) =>
  adaptClient(unwrap(await axiosClient.post("/clients/", toBackendClient(form))));
export const updateClient = async (id, form) =>
  adaptClient(unwrap(await axiosClient.patch(`/clients/${id}/`, toBackendClient(form))));
export const deleteClient = async (id) => axiosClient.delete(`/clients/${id}/`);

/* ---------------------------- Projects ---------------------------------- */
export const getProjects = async () => unwrapList(await axiosClient.get("/projects/")).map(adaptProject);
export const createProject = async (form) =>
  adaptProject(unwrap(await axiosClient.post("/projects/", toBackendProject(form))));
export const updateProject = async (id, form) =>
  adaptProject(unwrap(await axiosClient.patch(`/projects/${id}/`, toBackendProject(form))));
export const deleteProject = async (id) => axiosClient.delete(`/projects/${id}/`);
export const assignProjectEmployees = async (id, employeeIds) =>
  adaptProject(unwrap(await axiosClient.post(`/projects/${id}/assign-employees/`, {
    employee_ids: employeeIds.map(Number),
  })));

/* ---------------------------- Tasks ------------------------------------- */
export const getTasks = async () => unwrapList(await axiosClient.get("/tasks/")).map(adaptTask);
export const createTask = async (form) =>
  adaptTask(unwrap(await axiosClient.post("/tasks/", toBackendTask(form))));
export const updateTask = async (id, form) =>
  adaptTask(unwrap(await axiosClient.patch(`/tasks/${id}/`, toBackendTask(form))));
export const updateTaskStatus = async (id, status) =>
  adaptTask(unwrap(await axiosClient.patch(`/tasks/${id}/`, { status: taskStatusToBackend(status) })));
export const deleteTask = async (id) => axiosClient.delete(`/tasks/${id}/`);

/* ---------------------------- Invoices ----------------------------------- */
export const getInvoices = async () => unwrapList(await axiosClient.get("/invoices/")).map(adaptInvoice);
export const createInvoice = async (form) =>
  adaptInvoice(unwrap(await axiosClient.post("/invoices/", toBackendInvoice(form))));
export const updateInvoice = async (id, form) =>
  adaptInvoice(unwrap(await axiosClient.patch(`/invoices/${id}/`, toBackendInvoice(form))));
export const deleteInvoice = async (id) => axiosClient.delete(`/invoices/${id}/`);

/* ---------------------------- Notifications / activity / users ---------- */
export async function getNotifications() {
  const res = await axiosClient.get("/notifications/");
  const payload = unwrap(res) || { notifications: [] };
  return (payload.notifications || []).map(adaptNotification);
}

export async function markNotificationRead(id) {
  const res = await axiosClient.patch(`/notifications/${id}/`, { is_read: true });
  return adaptNotification(unwrap(res));
}

export async function markAllNotificationsRead() {
  await axiosClient.post("/notifications/mark-all-read/");
}

// Requires the /audit-logs/ endpoint — see the backend note in chat for
// the two small files that expose it. Falls back to an empty list (rather
// than crashing the page) if it isn't there yet.
export async function getActivity() {
  try {
    const res = await axiosClient.get("/audit-logs/");
    return unwrapList(res).map(adaptActivity);
  } catch (err) {
    console.warn("GET /audit-logs/ not available yet:", err.message);
    return [];
  }
}

// Requires the /users/ endpoint — see the backend note in chat.
export async function getUsers() {
  try {
    const res = await axiosClient.get("/users/");
    return unwrapList(res).map(adaptUser);
  } catch (err) {
    console.warn("GET /users/ not available yet:", err.message);
    return [];
  }
}

/* ---------------------------- File downloads ----------------------------- */
// Protected endpoints need the Authorization header, so a plain <a href>
// link won't work — the browser wouldn't attach the JWT. Instead we fetch
// the file as a blob (axiosClient already attaches the token), then
// trigger a save using a throwaway link element.
function triggerBrowserDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportLeadsExcel() {
  const res = await axiosClient.get("/dashboard/export/leads/excel/", { responseType: "blob" });
  triggerBrowserDownload(res.data, "leads_report.xlsx");
}

export async function exportLeadsPdf() {
  const res = await axiosClient.get("/dashboard/export/leads/pdf/", { responseType: "blob" });
  triggerBrowserDownload(res.data, "leads_report.pdf");
}
