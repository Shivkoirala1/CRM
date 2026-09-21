import { useState } from "react";
import { ShieldCheck, MoreHorizontal } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Avatar from "../components/common/Avatar";
import Pill from "../components/common/Pill";
import { PrimaryButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { ROLES } from "../data/mockData";

export default function UsersView() {
  const { users } = useData();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <div>
      <SectionHeader eyebrow="Audit & security" title="User access" action={<PrimaryButton>Invite user</PrimaryButton>} />

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search users…"
        filters={
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All roles</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        }
        right={<span className="muted-note">{filtered.length} of {users.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Two-factor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td><div className="row-user"><Avatar userId={u.id} size={26} />{u.name}</div></td>
                <td><span className="tag-chip"><ShieldCheck size={11} />{u.role}</span></td>
                <td>{u.id === "u1" || u.id === "u2" ? <Pill label="Paid" /> : <span className="dim-text">Not enabled</span>}</td>
                <td><Pill label="Active" /></td>
                <td><button className="icon-btn"><MoreHorizontal size={16} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#8A93A6" }}>No users match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
