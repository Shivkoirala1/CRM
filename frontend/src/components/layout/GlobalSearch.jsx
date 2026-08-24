import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronRight, Command } from "lucide-react";
import { useData } from "../../context/DataContext";
import { NAV_ITEMS } from "../../data/mockData";

export default function GlobalSearch({ role, onClose, onNavigate }) {
  const { leads, clients, projects, tasks, invoices } = useData();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // A result is only ever shown if the signed-in role has that section in
  // its nav — this is what keeps client/invoice detail out of General
  // Staff search results (and keeps Accountant search to what they can
  // actually open), using the same permission matrix as the sidebar.
  const canSee = (view) => NAV_ITEMS.find((n) => n.key === view)?.roles.includes(role);

  const results = useMemo(() => {
    if (!q) return [];
    const query = q.toLowerCase();
    const out = [];
    if (canSee("leads")) leads.forEach((l) => (l.name + l.company + l.id).toLowerCase().includes(query) && out.push({ kind: "Lead", label: l.name, sub: l.company, id: l.id, view: "leads" }));
    if (canSee("clients")) clients.forEach((c) => (c.name + c.company + c.id).toLowerCase().includes(query) && out.push({ kind: "Client", label: c.company, sub: c.name, id: c.id, view: "clients" }));
    if (canSee("projects")) projects.forEach((p) => (p.name + p.id).toLowerCase().includes(query) && out.push({ kind: "Project", label: p.name, sub: p.id, id: p.id, view: "projects" }));
    if (canSee("tasks")) tasks.forEach((t) => (t.title + t.id).toLowerCase().includes(query) && out.push({ kind: "Task", label: t.title, sub: t.id, id: t.id, view: "tasks" }));
    if (canSee("invoices")) invoices.forEach((i) => (i.id + i.items).toLowerCase().includes(query) && out.push({ kind: "Invoice", label: i.id, sub: i.items, id: i.id, view: "invoices" }));
    return out.slice(0, 8);
  }, [q, leads, clients, projects, tasks, invoices, role]);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="search-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-panel-input">
          <Search size={16} color="#8A93A6" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads, clients, projects, tasks, invoices…" />
          <kbd>Esc</kbd>
        </div>
        <div className="search-results">
          {q && results.length === 0 && <div className="search-empty">No matches for “{q}”.</div>}
          {results.map((r, idx) => (
            <button
              key={idx}
              className="search-result-row"
              onClick={() => {
                onNavigate(r.view);
                onClose();
              }}
            >
              <span className="search-kind">{r.kind}</span>
              <span className="search-label">{r.label}</span>
              <span className="search-sub">{r.sub}</span>
              <ChevronRight size={14} color="#8A93A6" />
            </button>
          ))}
          {!q && (
            <div className="search-hint">
              <Command size={13} /> Try “Deshpande”, “LD-103”, or “invoice”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
