/* =========================================================================
   API service layer — talks to the real Django REST backend.

   Every list/detail endpoint here wraps its response as
   { success, message, data, errors } (see backend/crm/utils.py
   api_response / custom_exception_handler); unwrap() below pulls out
   .data on success and throws an ApiError carrying the backend's own
   message/errors on failure. Auth endpoints (/token/, /token/refresh/)
   are stock SimpleJWT views and return { access, refresh } directly, so
   they're handled separately.
   ========================================================================= */

import axiosClient, { setTokens, clearTokens, hasToken } from "./axiosClient";

export class ApiError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
  }
}

function unwrap(response) {
  const body = response.data;
  if (body && typeof body === "object" && "success" in body) {
    if (!body.success) throw new ApiError(body.message || "Request failed.", body.errors);
    return body.data;
  }
  return body;
}

/** Turns any axios/ApiError into a single readable string for forms/toasts. */
export function getErrorMessage(err) {
  if (err instanceof ApiError) {
    if (err.errors && typeof err.errors === "object") {
      const firstField = Object.keys(err.errors)[0];
      const firstMsg = Array.isArray(err.errors[firstField]) ? err.errors[firstField][0] : err.errors[firstField];
      if (firstField && firstMsg) return `${firstField}: ${firstMsg}`;
    }
    return err.message;
  }
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0];
    const firstMsg = Array.isArray(data.errors[firstField]) ? data.errors[firstField][0] : data.errors[firstField];
    if (firstField && firstMsg) return `${firstField}: ${firstMsg}`;
  }
  if (err?.code === "ECONNABORTED" || err?.message === "Network Error") {
    return "Couldn't reach the server. Is the Django backend running?";
  }
  return err?.message || "Something went wrong.";
}

/* ---------------------------- Auth ------------------------------------- */
export { hasToken, clearTokens };

// POST /api/token/  { username, password } -> { access, refresh }  (unwrapped, stock SimpleJWT)
export async function login(username, password) {
  const { data } = await axiosClient.post("/token/", { username, password });
  setTokens(data);
  return getMe();
}

// GET /api/me/
export const getMe = () => axiosClient.get("/me/").then(unwrap);

// POST /api/me/change-password/ { current_password, new_password }
// ADDED FOR FRONTEND INTEGRATION — see backend CHANGES_LOG.md.
export const changeMyPassword = (currentPassword, newPassword) =>
  axiosClient
    .post("/me/change-password/", { current_password: currentPassword, new_password: newPassword })
    .then(unwrap);

/* ---------------------------- Users -------------------------------------
   GET /api/users/ — added on the backend for this integration; see
   CHANGES_LOG.md. Read-only: there is no create/update/delete-user API,
   accounts are managed via the Django admin.
   ------------------------------------------------------------------------ */
export const getUsers = () => axiosClient.get("/users/").then(unwrap);

/* ---------------------------- Leads -------------------------------------
   GET/POST /api/leads/   GET/PATCH/DELETE /api/leads/:id/
   DELETE archives (is_archived=True) rather than hard-deleting.
   ------------------------------------------------------------------------ */
export const getLeads = () => axiosClient.get("/leads/").then(unwrap);
export const createLead = (payload) => axiosClient.post("/leads/", payload).then(unwrap);
export const updateLead = (id, payload) => axiosClient.patch(`/leads/${id}/`, payload).then(unwrap);
export const archiveLead = (id) => axiosClient.delete(`/leads/${id}/`).then(unwrap);

/* ---------------------------- Clients ------------------------------------ */
export const getClients = () => axiosClient.get("/clients/").then(unwrap);
export const createClient = (payload) => axiosClient.post("/clients/", payload).then(unwrap);
export const updateClient = (id, payload) => axiosClient.patch(`/clients/${id}/`, payload).then(unwrap);
export const archiveClient = (id) => axiosClient.delete(`/clients/${id}/`).then(unwrap);
export const getClientPaymentHistory = (id) => axiosClient.get(`/clients/${id}/payment-history/`).then(unwrap);

/* ---------------------------- Projects ----------------------------------- */
export const getProjects = () => axiosClient.get("/projects/").then(unwrap);
export const createProject = (payload) => axiosClient.post("/projects/", payload).then(unwrap);
export const updateProject = (id, payload) => axiosClient.patch(`/projects/${id}/`, payload).then(unwrap);
export const archiveProject = (id) => axiosClient.delete(`/projects/${id}/`).then(unwrap);
export const assignProjectEmployees = (id, employeeIds) =>
  axiosClient.post(`/projects/${id}/assign-employees/`, { employee_ids: employeeIds }).then(unwrap);

/* ---------------------------- Tasks --------------------------------------
   DELETE hard-deletes (tasks have no is_archived field on the backend).
   ------------------------------------------------------------------------ */
export const getTasks = () => axiosClient.get("/tasks/").then(unwrap);
export const createTask = (payload) => axiosClient.post("/tasks/", payload).then(unwrap);
export const updateTask = (id, payload) => axiosClient.patch(`/tasks/${id}/`, payload).then(unwrap);
export const deleteTask = (id) => axiosClient.delete(`/tasks/${id}/`).then(unwrap);

/* ---------------------------- Invoices ------------------------------------
   invoice_number is required + unique and NOT auto-generated by the
   backend — the frontend must supply one (see suggestInvoiceNumber in
   InvoicesView.jsx).
   ------------------------------------------------------------------------ */
export const getInvoices = () => axiosClient.get("/invoices/").then(unwrap);
export const createInvoice = (payload) => axiosClient.post("/invoices/", payload).then(unwrap);
export const updateInvoice = (id, payload) => axiosClient.patch(`/invoices/${id}/`, payload).then(unwrap);
export const archiveInvoice = (id) => axiosClient.delete(`/invoices/${id}/`).then(unwrap);

/* ---------------------------- Dashboard -----------------------------------
   Both are fixed, non-filterable aggregates from the backend. Panels that
   need a period/status filter (leads trend, revenue by service, etc.)
   recompute client-side from the live leads/invoices/projects collections
   instead — see src/utils/finance.js and src/utils/leads.js.
   ------------------------------------------------------------------------ */
export const getDashboardStats = () => axiosClient.get("/dashboard/stats/").then(unwrap);
export const getRevenueReport = () => axiosClient.get("/dashboard/revenue/").then(unwrap);
