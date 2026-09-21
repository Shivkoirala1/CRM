import {
  LayoutDashboard, Target, Users2, FolderKanban, ListChecks, Receipt,
  ShieldCheck, Menu, History,
} from "lucide-react";
import { NAV_ITEMS } from "../../data/mockData";

const ICONS = {
  dashboard: LayoutDashboard,
  leads: Target,
  clients: Users2,
  projects: FolderKanban,
  tasks: ListChecks,
  invoices: Receipt,
  audit: History,
  users: ShieldCheck,
};

export default function Sidebar({ view, setView, role, collapsed, setCollapsed }) {
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));
  return (
    <div className={"sidebar" + (collapsed ? " collapsed" : "")}>
      <div className="sidebar-brand">
        <div className="brand-mark">PIT</div>
        {!collapsed && (
          <div>
            <div className="brand-name">Prasad Info Tech</div>
            <div className="brand-sub">CRM Console</div>
          </div>
        )}
        <button className="icon-btn sidebar-collapse" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={15} />
        </button>
      </div>

      <div className="sidebar-nav">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          return (
            <button
              key={item.key}
              className={"nav-item" + (view === item.key ? " active" : "")}
              onClick={() => setView(item.key)}
            >
              <Icon size={17} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div className="sidebar-role-badge">
          <ShieldCheck size={13} />
          <span>{role}</span>
        </div>
      )}
    </div>
  );
}
