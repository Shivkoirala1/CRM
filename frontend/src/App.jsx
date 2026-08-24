import { useEffect, useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import { NAV_ITEMS, userById } from "./data/mockData";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import GlobalSearch from "./components/layout/GlobalSearch";

import LoginScreen from "./pages/LoginScreen";
import DashboardView from "./pages/DashboardView";
import LeadsView from "./pages/LeadsView";
import ClientsView from "./pages/ClientsView";
import ProjectsView from "./pages/ProjectsView";
import TasksView from "./pages/TasksView";
import InvoicesView from "./pages/InvoicesView";
import AuditView from "./pages/AuditView";
import UsersView from "./pages/UsersView";

function AppShell() {
  const { users, loading } = useData();
  const [userId, setUserId] = useState(null);
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

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-mark">PIT</div>
        <p>Loading CRM console…</p>
      </div>
    );
  }

  const currentUser = userId ? userById(users, userId) : null;

  if (!currentUser) {
    return <LoginScreen onLogin={(id) => setUserId(id)} />;
  }

  const allowedKeys = NAV_ITEMS.filter((i) => i.roles.includes(currentUser.role)).map((i) => i.key);
  const activeView = allowedKeys.includes(view) ? view : "dashboard";

  return (
    <div className="app-shell">
      <Sidebar view={activeView} setView={setView} role={currentUser.role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="app-main">
        <Topbar
          currentUser={currentUser}
          onSwitchUser={(id) => setUserId(id)}
          onOpenSearch={() => setSearchOpen(true)}
          onLogout={() => setUserId(null)}
        />
        <div className="app-content">
          {activeView === "dashboard" && <DashboardView currentUser={currentUser} onNavigate={setView} />}
          {activeView === "leads" && <LeadsView role={currentUser.role} />}
          {activeView === "clients" && <ClientsView />}
          {activeView === "projects" && <ProjectsView />}
          {activeView === "tasks" && <TasksView role={currentUser.role} currentUser={currentUser} />}
          {activeView === "invoices" && <InvoicesView />}
          {activeView === "audit" && <AuditView />}
          {activeView === "users" && <UsersView />}
        </div>
      </div>
      {searchOpen && (
        <GlobalSearch role={currentUser.role} onClose={() => setSearchOpen(false)} onNavigate={(v) => setView(v)} />
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
