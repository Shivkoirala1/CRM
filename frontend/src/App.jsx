import { useEffect, useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import { NAV_ITEMS } from "./data/mockData";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import GlobalSearch from "./components/layout/GlobalSearch";

import LoginScreen from "./pages/LoginScreen";
import DashboardView from "./pages/DashboardView";
import LeadsView from "./pages/LeadsView";
import ClientsView from "./pages/ClientsView";
import ProjectsView from "./pages/ProjectsView";
import TasksView from "./pages/TasksView";
import CalendarView from "./pages/CalendarView";
import InvoicesView from "./pages/InvoicesView";
import ReportsView from "./pages/ReportsView";
import AuditView from "./pages/AuditView";
import UsersView from "./pages/UsersView";
import SettingsView from "./pages/SettingsView";

function LoadingScreen({ text }) {
  return (
    <div className="app-loading">
      <div className="app-loading-mark">PIT</div>
      <p>{text}</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="app-error">
      <div className="app-loading-mark">PIT</div>
      <div className="app-error-title">Couldn't load the CRM</div>
      <div className="app-error-detail">{message}</div>
      <button className="btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function AppShell() {
  const { authUser, authLoading, dataLoading, dataError, hasLoadedOnce, logout, reload } = useData();
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (authLoading) return <LoadingScreen text="Checking your session…" />;
  if (!authUser) return <LoginScreen />;
  if (dataLoading && !hasLoadedOnce) return <LoadingScreen text="Loading CRM data…" />;
  if (dataError && !hasLoadedOnce) return <ErrorScreen message={dataError} onRetry={reload} />;

  const allowedKeys = NAV_ITEMS.filter((i) => i.roles.includes(authUser.role)).map((i) => i.key);
  const activeView = allowedKeys.includes(view) ? view : "dashboard";

  return (
    <div className="app-shell">
      <Sidebar view={activeView} setView={setView} role={authUser.role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="app-main">
        <Topbar currentUser={authUser} onOpenSearch={() => setSearchOpen(true)} onOpenSettings={() => setView("settings")} onLogout={logout} />
        <div className="app-content">
          {activeView === "dashboard" && <DashboardView currentUser={authUser} onNavigate={setView} />}
          {activeView === "leads" && <LeadsView role={authUser.role} />}
          {activeView === "clients" && <ClientsView />}
          {activeView === "projects" && <ProjectsView />}
          {activeView === "tasks" && <TasksView role={authUser.role} currentUser={authUser} />}
          {activeView === "calendar" && <CalendarView currentUser={authUser} />}
          {activeView === "invoices" && <InvoicesView />}
          {activeView === "reports" && <ReportsView />}
          {activeView === "audit" && <AuditView />}
          {activeView === "users" && <UsersView />}
          {activeView === "settings" && <SettingsView currentUser={authUser} />}
        </div>
      </div>
      {searchOpen && (
        <GlobalSearch role={authUser.role} onClose={() => setSearchOpen(false)} onNavigate={(v) => setView(v)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="crm-root">
      <DataProvider>
        <AppShell />
      </DataProvider>
    </div>
  );
}
