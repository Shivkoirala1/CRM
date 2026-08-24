import AdminDashboardView from "./dashboard/AdminDashboardView";
import AccountantDashboardView from "./dashboard/AccountantDashboardView";
import StaffDashboardView from "./dashboard/StaffDashboardView";

/**
 * Role-based dashboard router. Admin/CEO and Manager share the full
 * org-wide dashboard; Accountant and General Staff get dashboards scoped
 * to what their role actually needs (see the two components for why).
 */
export default function DashboardView({ currentUser, onNavigate }) {
  if (currentUser.role === "Accountant") {
    return <AccountantDashboardView currentUser={currentUser} onNavigate={onNavigate} />;
  }
  if (currentUser.role === "General Staff") {
    return <StaffDashboardView currentUser={currentUser} onNavigate={onNavigate} />;
  }
  return <AdminDashboardView currentUser={currentUser} onNavigate={onNavigate} />;
}
