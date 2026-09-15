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
  // Staff search results, using the same permission matrix as the sidebar.
  const canSee = (view) => NAV_ITEMS.find((n) => n.key === view)?.roles.includes(role);

  const results = useMemo(() => {
    if (!q) return [];
    const query = q.toLowerCase();
    const match = (s) => (s || "").toLowerCase().includes(query);
    const out = [];
    if (canSee("leads"))
      leads.forEach(
        (l) =>
          (match(l.name) || match(l.company) || match(String(l.id))) &&
          out.push({ kind: "Lead", label: l.name, sub: l.company, id: l.id, view: "leads" })
      );
    if (canSee("clients"))
      clients.forEach(
        (c) =>
          (match(c.name) || match(c.company_name) || match(String(c.id))) &&
          out.push({ kind: "Client", label: c.company_name || c.name, sub: c.name, id: c.id, view: "clients" })
      );
    if (canSee("projects"))
      projects.forEach(
        (p) =>
          (match(p.name) || match(String(p.id))) &&
          out.push({ kind: "Project", label: p.name, sub: p.client_name, id: p.id, view: "projects" })
      );
    if (canSee("tasks"))
      tasks.forEach(
        (t) =>
          (match(t.title) || match(String(t.id))) &&
          out.push({ kind: "Task", label: t.title, sub: `#${t.id}`, id: t.id, view: "tasks" })
      );
    if (canSee("invoices"))
      invoices.forEach(
        (i) =>
          (match(i.invoice_number) || match(i.items_services)) &&
          out.push({ kind: "Invoice", label: i.invoice_number, sub: i.client_name, id: i.id, view: "invoices" })
      );
    return out.slice(0, 8);
  }, [q, leads, clients, projects, tasks, invoices, role]);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="search-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-panel-input">
          <Search size={16} color="#8A93A6" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, clients, projects, tasks, invoices…"
          />
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
              <Command size={13} /> Try a client name, lead name, or invoice number.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
