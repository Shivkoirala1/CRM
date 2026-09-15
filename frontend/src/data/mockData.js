/* =========================================================================
   Shared reference data for the Prasad Info Tech CRM frontend.

   This used to hold mock seed arrays for a not-yet-built backend. Now
   that the Django REST API is live, all record data (leads, clients,
   projects, tasks, invoices, users) comes from src/services/api.js and
   lives in DataContext — this file only keeps the small bits that are
   genuinely static: the nav/permission matrix and a couple of display
   helpers. See src/data/choices.js for the status/priority/role enums.
   ========================================================================= */

/*
 * Role -> section access matrix, keyed by the backend's actual role
 * codes (accounts.models.User.Role: ADMIN, MANAGER, STAFF — see
 * CHANGES_LOG.md for the "Accountant" role that existed in an earlier,
 * pre-backend version of this frontend and was removed because the
 * backend has no such role).
 *
 * General Staff never gets "clients" or "invoices": those screens carry
 * client contact, payment and billing detail, which is kept out of the
 * staff console entirely (nav, routes, and search results).
 */
export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { key: "leads", label: "Leads", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { key: "clients", label: "Clients", roles: ["ADMIN", "MANAGER"] },
  { key: "projects", label: "Projects", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { key: "tasks", label: "Tasks", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { key: "calendar", label: "Calendar", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { key: "invoices", label: "Invoices", roles: ["ADMIN", "MANAGER"] },
  { key: "reports", label: "Reports", roles: ["ADMIN", "MANAGER"] },
  { key: "audit", label: "Activity log", roles: ["ADMIN"] },
  { key: "users", label: "User access", roles: ["ADMIN"] },
  { key: "settings", label: "Settings", roles: ["ADMIN", "MANAGER", "STAFF"] },
];

export const userById = (users, id) => users.find((u) => u.id === id);
export const clientById = (clients, id) => clients.find((c) => c.id === id);
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Backend users have no stored color/initials — derive both deterministically
// so the same user always renders the same avatar across sessions.
const AVATAR_PALETTE = ["#C8862A", "#0F9E8F", "#4C6FEF", "#DC4C42", "#8B5CF6", "#1E9E64"];

export function avatarColor(user) {
  if (!user) return "#8A93A6";
  const seed = String(user.id ?? user.username ?? "");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function avatarInitials(user) {
  if (!user) return "?";
  const name = user.username || user.email || "?";
  const parts = name.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
