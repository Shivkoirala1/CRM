import { useMemo, useState } from "react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Avatar from "../components/common/Avatar";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { useData } from "../context/DataContext";
import { userById } from "../data/mockData";

export default function AuditView() {
  const { activity, users } = useData();
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return activity.filter((a) => {
      const q = query.toLowerCase();
      const matchQ = !q || a.action.toLowerCase().includes(q);
      const matchUser = userFilter === "All" || a.user === userFilter;
      const day = a.time.slice(0, 10);
      const matchFrom = !dateFrom || day >= dateFrom;
      const matchTo = !dateTo || day <= dateTo;
      return matchQ && matchUser && matchFrom && matchTo;
    });
  }, [activity, query, userFilter, dateFrom, dateTo]);

  return (
    <div>
      <SectionHeader eyebrow="Audit & security" title="Activity log" />

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search actions…"
        filters={
          <>
            <select className="filter-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="All">All team members</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
          </>
        }
        right={<span className="muted-note">{filtered.length} of {activity.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>User</th><th>Action</th><th>Timestamp</th></tr></thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><div className="row-user"><Avatar userId={a.user} size={24} />{userById(users, a.user)?.name}</div></td>
                <td>{a.action}</td>
                <td className="mono-cell">{a.time}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#8A93A6" }}>No activity matches these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
