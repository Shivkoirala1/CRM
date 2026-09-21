/* =========================================================================
   Adapter layer.

   The UI components (LeadsView, ClientsView, etc.) were built against the
   field names in src/data/mockData.js. The Django API uses different
   names/casing/enums. Rather than rewrite every page, every function here
   translates one direction: "adaptX" turns a backend record into the shape
   the UI already expects, and "toBackendX" turns a UI form into the shape
   the Django API expects.

   All ids are kept as STRINGS on the frontend side (the UI calls
   .toLowerCase() / .includes() on ids in a few places), and converted back
   to numbers only when sent to the API.
   ========================================================================= */

const ROLE_TO_FE = { ADMIN: "Admin/CEO", MANAGER: "Manager", STAFF: "General Staff" };
const ROLE_TO_BE = { "Admin/CEO": "ADMIN", Manager: "MANAGER", "General Staff": "STAFF" };

export const LEAD_SOURCE_TO_FE = {
  FACEBOOK_ADS: "Facebook Ads", INSTAGRAM_ADS: "Instagram Ads", WEBSITE: "Website",
  REFERRAL: "Referral", WALK_IN: "Walk-in", OTHER: "Other",
};
const LEAD_SOURCE_TO_BE = Object.fromEntries(Object.entries(LEAD_SOURCE_TO_FE).map(([k, v]) => [v, k]));

// Note: backend has an extra "Converted" status the original mock data
// didn't — it's added to LEAD_STATUSES / STATUS_STYLES in mockData.js so
// no lead status is ever lost in translation.
export const LEAD_STATUS_TO_FE = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", CONVERTED: "Converted", LOST: "Lost",
};
const LEAD_STATUS_TO_BE = Object.fromEntries(Object.entries(LEAD_STATUS_TO_FE).map(([k, v]) => [v, k]));

export const PAYMENT_STATUS_TO_FE = {
  PAID: "Paid", PENDING: "Pending", PARTIALLY_PAID: "Partially Paid", OVERDUE: "Overdue",
};
const PAYMENT_STATUS_TO_BE = Object.fromEntries(Object.entries(PAYMENT_STATUS_TO_FE).map(([k, v]) => [v, k]));

export const PROJECT_STATUS_TO_FE = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", ON_HOLD: "On Hold",
  COMPLETED: "Completed", CANCELLED: "Cancelled",
};
const PROJECT_STATUS_TO_BE = Object.fromEntries(Object.entries(PROJECT_STATUS_TO_FE).map(([k, v]) => [v, k]));

export const TASK_PRIORITY_TO_FE = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };
const TASK_PRIORITY_TO_BE = Object.fromEntries(Object.entries(TASK_PRIORITY_TO_FE).map(([k, v]) => [v, k]));

export const TASK_STATUS_TO_FE = {
  PENDING: "Pending", IN_PROGRESS: "In Progress", COMPLETED: "Completed", OVERDUE: "Overdue",
};
const TASK_STATUS_TO_BE = Object.fromEntries(Object.entries(TASK_STATUS_TO_FE).map(([k, v]) => [v, k]));

const NOTIF_TYPE_TO_ICON = {
  LEAD_ASSIGNED: "lead", TASK_ASSIGNED: "task", TASK_DUE_SOON: "task", TASK_OVERDUE: "overdue",
  PAYMENT_DUE: "payment", PAYMENT_OVERDUE: "overdue", RENEWAL_DUE: "renewal", PROJECT_UPDATE: "project",
  TASK_STATUS_CHANGED: "task",
};

const PALETTE = ["#C8862A", "#0F9E8F", "#4C6FEF", "#DC4C42", "#8B5CF6", "#1E9E64", "#E1B12C", "#6C5CE7"];

function deriveInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function deriveColor(id) {
  const n = Array.from(String(id)).reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
}

/* ------------------------------- Users ---------------------------------- */
export function adaptUser(u) {
  const displayName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
  return {
    id: String(u.id),
    name: displayName,
    role: ROLE_TO_FE[u.role] || u.role,
    initials: deriveInitials(displayName),
    color: deriveColor(u.id),
    email: u.email,
    phone: u.phone,
  };
}

/* ------------------------------- Leads ------------------------------------ */
export function adaptLead(l) {
  return {
    id: String(l.id),
    name: l.name,
    company: l.company || "",
    phone: l.phone || "",
    email: l.email || "",
    address: l.address || "",
    service: l.service_interested_in || "",
    budget: l.budget_range || "",
    source: LEAD_SOURCE_TO_FE[l.lead_source] || l.lead_source,
    status: LEAD_STATUS_TO_FE[l.status] || l.status,
    owner: l.assigned_employee ? String(l.assigned_employee) : null,
    notes: l.notes || "",
    createdAt: (l.created_at || "").slice(0, 10),
  };
}

export function toBackendLead(form) {
  return {
    name: form.name,
    company: form.company || null,
    phone: form.phone || null,
    email: form.email || null,
    address: form.address || null,
    service_interested_in: form.service || null,
    budget_range: form.budget || null,
    lead_source: LEAD_SOURCE_TO_BE[form.source] || "OTHER",
    status: LEAD_STATUS_TO_BE[form.status] || "NEW",
    assigned_employee: form.owner ? Number(form.owner) : null,
    notes: form.notes || null,
  };
}

/* ------------------------------ Clients ----------------------------------- */
export function adaptClient(c) {
  return {
    id: String(c.id),
    name: c.name,
    company: c.company_name || "",
    phone: c.phone || "",
    email: c.email || "",
    address: c.address || "",
    services: (c.services || "").split(",").map((s) => s.trim()).filter(Boolean),
    projects: [], // filled in by DataContext once projects are loaded
    invoices: [], // filled in by DataContext once invoices are loaded
    paymentStatus: PAYMENT_STATUS_TO_FE[c.payment_status] || c.payment_status,
    renewalDate: c.renewal_date || "—",
    notes: c.notes || "",
  };
}

export function toBackendClient(form) {
  return {
    name: form.name,
    company_name: form.company || null,
    phone: form.phone || null,
    email: form.email || null,
    address: form.address || null,
    services: Array.isArray(form.services) ? form.services.join(", ") : form.services || null,
    payment_status: PAYMENT_STATUS_TO_BE[form.paymentStatus] || "PENDING",
    renewal_date: form.renewalDate && form.renewalDate !== "—" ? form.renewalDate : null,
    notes: form.notes || null,
  };
}

/* ------------------------------ Projects ---------------------------------- */
export function adaptProject(p) {
  return {
    id: String(p.id),
    name: p.name,
    client: p.client ? String(p.client) : null,
    service: p.service || "",
    description: p.description || "",
    scope: p.scope_of_work || "",
    start: p.start_date || "",
    deadline: p.deadline || "",
    status: PROJECT_STATUS_TO_FE[p.status] || p.status,
    team: (p.assigned_employees || []).map(String),
  };
}

export function toBackendProject(form) {
  return {
    name: form.name,
    client: form.client ? Number(form.client) : null,
    service: form.service || null,
    description: form.description || null,
    scope_of_work: form.scope || null,
    start_date: form.start || null,
    deadline: form.deadline || null,
    status: PROJECT_STATUS_TO_BE[form.status] || "NOT_STARTED",
  };
}

/* -------------------------------- Tasks ------------------------------------ */
export function adaptTask(t) {
  let type = "Internal";
  let ref = "—";
  if (t.lead) { type = "Lead"; ref = t.lead_name || String(t.lead); }
  else if (t.client) { type = "Client"; ref = t.client_name || String(t.client); }
  else if (t.project) { type = "Project"; ref = t.project_name || String(t.project); }

  return {
    id: String(t.id),
    title: t.title,
    type,
    ref,
    assignee: t.assigned_to ? String(t.assigned_to) : null,
    due: t.due_date || "",
    priority: TASK_PRIORITY_TO_FE[t.priority] || t.priority,
    status: TASK_STATUS_TO_FE[t.status] || t.status,
    recurring: !!t.is_recurring,
  };
}

// NOTE: the "New task" form in TasksView collects a task "type" (Lead /
// Client / Project / Internal) but never actually collects *which*
// lead/client/project to link it to (no picker input exists in the form).
// Until that field is added, new tasks are created unlinked (Internal)
// regardless of the type picked — this mirrors what the form can actually
// capture today rather than guessing.
export function toBackendTask(form) {
  const payload = {
    title: form.title,
    due_date: form.due || null,
    priority: TASK_PRIORITY_TO_BE[form.priority] || "MEDIUM",
    assigned_to: form.assignee ? Number(form.assignee) : null,
    is_recurring: !!form.recurring,
  };
  if (form.status) payload.status = TASK_STATUS_TO_BE[form.status] || "PENDING";
  return payload;
}

export function taskStatusToBackend(status) {
  return TASK_STATUS_TO_BE[status] || "PENDING";
}

/* ------------------------------- Invoices ----------------------------------- */
export function adaptInvoice(i) {
  return {
    id: String(i.id),
    client: i.client ? String(i.client) : null,
    project: i.project ? String(i.project) : null,
    items: i.items_services || "",
    amount: Number(i.amount) || 0,
    issue: i.issue_date || "",
    due: i.due_date || "",
    status: PAYMENT_STATUS_TO_FE[i.payment_status] || i.payment_status,
  };
}

// invoice_number isn't collected by the "New invoice" form, so we
// generate a reasonably unique one here. Consider adding a real field to
// the form (or an auto-increment on the backend) later.
export function toBackendInvoice(form) {
  return {
    invoice_number: form.invoice_number || `INV-${Date.now()}`,
    client: form.client ? Number(form.client) : null,
    project: form.project ? Number(form.project) : null,
    items_services: form.items,
    amount: String(form.amount),
    issue_date: form.issue || null,
    due_date: form.due || null,
    payment_status: PAYMENT_STATUS_TO_BE[form.status] || "PENDING",
  };
}

/* ----------------------------- Notifications --------------------------------- */
export function adaptNotification(n) {
  return {
    id: String(n.id),
    icon: NOTIF_TYPE_TO_ICON[n.notification_type] || "task",
    text: n.message,
    time: n.created_at ? new Date(n.created_at).toLocaleString() : "",
    unread: !n.is_read,
  };
}

/* -------------------------------- Audit log ----------------------------------- */
export function adaptActivity(a) {
  return {
    id: String(a.id),
    user: a.user != null ? String(a.user) : null,
    action: a.description || a.action,
    time: a.timestamp ? new Date(a.timestamp).toISOString().slice(0, 16).replace("T", " ") : "",
  };
}
