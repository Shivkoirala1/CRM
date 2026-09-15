import { useMemo, useState } from "react";
import { Phone, Mail, MapPin, Briefcase, DollarSign, User, History, Circle, AlertCircle } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Drawer from "../components/common/Drawer";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { userById } from "../data/mockData";
import { LEAD_SOURCE_META, LEAD_STATUS_META, SERVICE_SUGGESTIONS, metaOptions } from "../data/choices";
import * as api from "../services/api";

const LEAD_STATUS_OPTIONS = metaOptions(LEAD_STATUS_META);
const LEAD_SOURCE_OPTIONS = metaOptions(LEAD_SOURCE_META);

function NewLeadModal({ onClose, onCreate }) {
  const { users } = useData();
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", address: "",
    service_interested_in: "", budget_range: "", lead_source: "OTHER",
    assigned_employee: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onCreate({ ...form, assigned_employee: form.assigned_employee || null });
    } catch (err) {
      setError(api.getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create lead"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.name || saving} onClick={submit}>
            {saving ? "Creating…" : "Create lead"}
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}
      <div className="form-grid">
        <Field label="Name"><input value={form.name} onChange={set("name")} placeholder="Contact name" /></Field>
        <Field label="Company"><input value={form.company} onChange={set("company")} placeholder="Company name" /></Field>
        <Field label="Phone"><input value={form.phone} onChange={set("phone")} placeholder="+91 …" /></Field>
        <Field label="Email"><input value={form.email} onChange={set("email")} placeholder="name@company.com" /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} placeholder="City, state" /></Field>
        <Field label="Service interested in">
          <input list="service-suggestions" value={form.service_interested_in} onChange={set("service_interested_in")} placeholder="e.g. Web Development" />
        </Field>
        <Field label="Budget range"><input value={form.budget_range} onChange={set("budget_range")} placeholder="₹ …" /></Field>
        <Field label="Lead source">
          <select value={form.lead_source} onChange={set("lead_source")}>
            {LEAD_SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Assigned employee">
          <select value={form.assigned_employee} onChange={set("assigned_employee")}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Context, requirements…" /></Field>
      <datalist id="service-suggestions">
        {SERVICE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
      </datalist>
    </Modal>
  );
}

function LeadDrawer({ lead, onClose, onUpdateStatus }) {
  return (
    <Drawer title={lead.name} subtitle={lead.company} tag={<div className="eyebrow">Lead #{lead.id}</div>} onClose={onClose}>
      <div className="drawer-status-row">
        <Pill code={lead.status} meta={LEAD_STATUS_META} />
        <span className="dim-text">Source: {LEAD_SOURCE_META[lead.lead_source]?.label || lead.lead_source}</span>
      </div>

      <div className="detail-grid">
        <div><span className="detail-k"><Phone size={13} /> Phone</span><span className="detail-v">{lead.phone || "—"}</span></div>
        <div><span className="detail-k"><Mail size={13} /> Email</span><span className="detail-v">{lead.email || "—"}</span></div>
        <div><span className="detail-k"><MapPin size={13} /> Address</span><span className="detail-v">{lead.address || "—"}</span></div>
        <div><span className="detail-k"><Briefcase size={13} /> Service</span><span className="detail-v">{lead.service_interested_in || "—"}</span></div>
        <div><span className="detail-k"><DollarSign size={13} /> Budget</span><span className="detail-v">{lead.budget_range || "—"}</span></div>
        <div><span className="detail-k"><User size={13} /> Owner</span><span className="detail-v">{lead.assigned_employee_name || "Unassigned"}</span></div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Notes</div>
        <p className="notes-text">{lead.notes || "No notes yet."}</p>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Status</div>
        <div className="chip-row">
          {LEAD_STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={"chip" + (o.value === lead.status ? " chip-active" : "")}
              onClick={() => onUpdateStatus(lead.id, o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><History size={13} /> Timeline</div>
        <div className="mini-timeline">
          <div className="mini-tl-row"><Circle size={7} color="#0F9E8F" /><span>Created {(lead.created_at || "").slice(0, 10)}</span></div>
          <div className="mini-tl-row"><Circle size={7} color="#4C6FEF" /><span>Last updated {(lead.updated_at || "").slice(0, 10)}</span></div>
        </div>
      </div>
    </Drawer>
  );
}

export default function LeadsView() {
  const { leads, setLeads, users } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState(null);
  const [listError, setListError] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = query.toLowerCase();
      const matchQ = !q || (l.name || "").toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q) || String(l.id).includes(q);
      const matchS = statusFilter === "All" || l.status === statusFilter;
      const matchSource = sourceFilter === "All" || l.lead_source === sourceFilter;
      const matchOwner = ownerFilter === "All" || String(l.assigned_employee) === ownerFilter;
      const created = (l.created_at || "").slice(0, 10);
      const matchFrom = !dateFrom || created >= dateFrom;
      const matchTo = !dateTo || created <= dateTo;
      return matchQ && matchS && matchSource && matchOwner && matchFrom && matchTo;
    });
  }, [leads, query, statusFilter, sourceFilter, ownerFilter, dateFrom, dateTo]);

  const handleCreate = async (payload) => {
    const created = await api.createLead(payload);
    setLeads([created, ...leads]);
    setShowNew(false);
  };

  const handleUpdateStatus = async (id, status) => {
    const prev = leads;
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    setActive((a) => (a && a.id === id ? { ...a, status } : a));
    try {
      await api.updateLead(id, { status });
    } catch (err) {
      setLeads(prev);
      setListError(api.getErrorMessage(err));
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="Lead management" title="Leads" action={<PrimaryButton onClick={() => setShowNew(true)}>New lead</PrimaryButton>} />

      {listError && <div className="login-error" style={{ marginBottom: 12 }}>{listError}</div>}

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search leads by name, company, ID…"
        filters={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {LEAD_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="All">All sources</option>
              {LEAD_SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="All">All owners</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} label="Created" />
          </>
        }
        right={<span className="muted-note">{filtered.length} of {leads.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead>
            <tr><th>Lead</th><th>Company</th><th>Service</th><th>Source</th><th>Owner</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} onClick={() => setActive(l)}>
                <td><div className="cell-strong">{l.name}</div><div className="cell-id">#{l.id}</div></td>
                <td>{l.company || "—"}</td>
                <td>{l.service_interested_in || "—"}</td>
                <td>{LEAD_SOURCE_META[l.lead_source]?.label || l.lead_source}</td>
                <td>{l.assigned_employee ? <Avatar userId={l.assigned_employee} size={24} /> : <span className="dim-text">—</span>}</td>
                <td><Pill code={l.status} meta={LEAD_STATUS_META} /></td>
                <td className="mono-cell">{(l.created_at || "").slice(0, 10)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState icon={AlertCircle} text="No leads match your filters." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewLeadModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
      {active && <LeadDrawer lead={active} onClose={() => setActive(null)} onUpdateStatus={handleUpdateStatus} />}
    </div>
  );
}
