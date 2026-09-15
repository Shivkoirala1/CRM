import { useState } from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import { GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { ROLE_META } from "../data/choices";

// The backend has no create/update/delete-user API — accounts are
// provisioned via the Django admin (manage.py createsuperuser or the
// /admin/ site). This view is intentionally read-only.
function adminUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  return base.replace(/\/api\/?$/, "") + "/admin/";
}

export default function UsersView() {
  const { users } = useData();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    const matchQ = !q || u.username.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <div>
      <SectionHeader
        eyebrow="Audit & security"
        title="User access"
        action={
          <a href={adminUrl()} target="_blank" rel="noreferrer">
            <GhostButton icon={ExternalLink}>Manage in Django admin</GhostButton>
          </a>
        }
      />

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search users…"
        filters={
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All roles</option>
            {Object.entries(ROLE_META).map(([code, m]) => <option key={code} value={code}>{m.label}</option>)}
          </select>
        }
        right={<span className="muted-note">{filtered.length} of {users.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Phone</th></tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td><div className="row-user"><Avatar userId={u.id} size={26} />{u.username}</div></td>
                <td>{u.email || "—"}</td>
                <td><span className="tag-chip"><ShieldCheck size={11} />{ROLE_META[u.role]?.label || u.role}</span></td>
                <td>{u.phone || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "#8A93A6" }}>No users match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
