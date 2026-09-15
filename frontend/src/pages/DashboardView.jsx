import AdminDashboardView from "./dashboard/AdminDashboardView";
import StaffDashboardView from "./dashboard/StaffDashboardView";

/**
 * Role-based dashboard router. Admin/CEO and Manager share the full
 * org-wide dashboard; General Staff gets a dashboard scoped to their own
 * leads/tasks/projects only (see StaffDashboardView for why).
 *
 * An earlier, pre-backend version of this frontend also had a separate
 * "Accountant" dashboard — the real backend's accounts.User only defines
 * ADMIN / MANAGER / STAFF roles, so that variant was removed. See
 * CHANGES_LOG.md.
 */
export default function DashboardView({ currentUser, onNavigate }) {
  if (currentUser.role === "STAFF") {
    return <StaffDashboardView currentUser={currentUser} onNavigate={onNavigate} />;
  }
  return <AdminDashboardView currentUser={currentUser} onNavigate={onNavigate} />;
}
