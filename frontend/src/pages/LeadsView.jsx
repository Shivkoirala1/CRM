import { useMemo, useState } from "react";
import { Target, Phone, Mail, MapPin, Briefcase, DollarSign, User, Tag, History, Circle, Pencil, Archive } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Drawer from "../components/common/Drawer";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { useData } from "../context/DataContext";
import { SERVICES, LEAD_SOURCES, LEAD_STATUSES, userById } from "../data/mockData";
import * as api from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Nepal mobile numbers are exactly 10 digits — no symbols, no spaces.
const PHONE_RE = /^\d{10}$/;

function LeadFormModal({ title, submitLabel, initial, onClose, onSubmit }) {
  const { users } = useData();
  const assignableUsers = users.filter((u) => u.role !== "Accountant");
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", address: "",
    service: SERVICES[0], budget: "", source: LEAD_SOURCES[0],
    owner: assignableUsers[0]?.id || "", notes: "", status: LEAD_STATUSES[0],
    ...initial,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPhone = (e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) });

  const validate = () => {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!form.phone.trim() && !form.email.trim()) return "Enter at least a phone number or an email address.";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return "Enter a valid email address.";
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) return "Phone number must be exactly 10 digits.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const message = backendErrors
        ? Object.values(backendErrors).flat().join(" ")
        : "Couldn't save the lead. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.name.trim() || saving} onClick={handleSubmit}>
            {saving ? "Saving…" : submitLabel}
          </button>
        </>
      }
    >
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <Field label="Name *"><input value={form.name} onChange={set("name")} placeholder="Contact name" /></Field>
        <Field label="Company"><input value={form.company} onChange={set("company")} placeholder="Company name" /></Field>
        <Field label="Phone (10 digits)">
          <input type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={setPhone} placeholder="98XXXXXXXX" />
        </Field>
        <Field label="Email"><input type="email" value={form.email} onChange={set("email")} placeholder="name@company.com" /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} placeholder="City, state" /></Field>
        <Field label="Service interested in">
          <select value={form.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Budget range"><input value={form.budget} onChange={set("budget")} placeholder="Rs …" /></Field>
        <Field label="Lead source">
          <select value={form.source} onChange={set("source")}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Assigned employee">
          <select value={form.owner} onChange={set("owner")}>{assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set("status")}>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Context, requirements…" /></Field>
    </Modal>
  );
}

function LeadDrawer({ lead, onClose, onStatusChange, onEdit, onArchive }) {
  const { users } = useData();
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    if (!window.confirm(`Archive lead "${lead.name}"? This can be undone by a Manager/Admin later.`)) return;
    setArchiving(true);
    try {
      await onArchive(lead.id);
      onClose();
    } catch {
      window.alert("Couldn't archive this lead. Please try again.");
      setArchiving(false);
    }
  };

  return (
    <Drawer title={lead.name} subtitle={lead.company} tag={<div className="eyebrow">{lead.id}</div>} onClose={onClose}>
      <div className="drawer-actions-row">
        <GhostButton icon={Pencil} onClick={() => onEdit(lead)}>Edit</GhostButton>
        <GhostButton icon={Archive} onClick={handleArchive}>{archiving ? "Archiving…" : "Archive"}</GhostButton>
      </div>

      <div className="drawer-status-row">
        <Pill label={lead.status} />
        <span className="dim-text">Source: {lead.source}</span>
      </div>

      <div className="detail-grid">
        <div><span className="detail-k"><Phone size={13} /> Phone</span><span className="detail-v">{lead.phone}</span></div>
        <div><span className="detail-k"><Mail size={13} /> Email</span><span className="detail-v">{lead.email}</span></div>
        <div><span className="detail-k"><MapPin size={13} /> Address</span><span className="detail-v">{lead.address}</span></div>
        <div><span className="detail-k"><Briefcase size={13} /> Service</span><span className="detail-v">{lead.service}</span></div>
        <div><span className="detail-k"><DollarSign size={13} /> Budget</span><span className="detail-v">{lead.budget}</span></div>
        <div><span className="detail-k"><User size={13} /> Owner</span><span className="detail-v">{userById(users, lead.owner)?.name}</span></div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Notes</div>
        <p className="notes-text">{lead.notes}</p>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Status</div>
        <div className="chip-row">
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              className={"chip" + (s === lead.status ? " chip-active" : "")}
              onClick={() => onStatusChange(lead.id, s)}
              disabled={s === lead.status}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><History size={13} /> History</div>
        <div className="mini-timeline">
          <div className="mini-tl-row"><Circle size={7} color="#0F9E8F" /><span>Lead created — {lead.createdAt}</span></div>
          <div className="mini-tl-row"><Circle size={7} color="#4C6FEF" /><span>Assigned to {userById(users, lead.owner)?.name}</span></div>
          <div className="mini-tl-row"><Circle size={7} color="#8A93A6" /><span>Status set to {lead.status}</span></div>
        </div>
      </div>
    </Drawer>
  );
}

export default function LeadsView() {
  const { leads, users, setLeads } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);

  const assignableUsers = users.filter((u) => u.role !== "Accountant");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = query.toLowerCase();
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
      const matchS = statusFilter === "All" || l.status === statusFilter;
      const matchSource = sourceFilter === "All" || l.source === sourceFilter;
      const matchOwner = ownerFilter === "All" || l.owner === ownerFilter;
      const matchFrom = !dateFrom || l.createdAt >= dateFrom;
      const matchTo = !dateTo || l.createdAt <= dateTo;
      return matchQ && matchS && matchSource && matchOwner && matchFrom && matchTo;
    });
  }, [leads, query, statusFilter, sourceFilter, ownerFilter, dateFrom, dateTo]);

  const handleCreate = async (form) => {
    const created = await api.createLead({ ...form, createdAt: new Date().toISOString().slice(0, 10), status: "New" });
    setLeads([created, ...leads]);
    setShowNew(false);
  };

  const handleUpdate = async (form) => {
    const updated = await api.updateLead(editing.id, form);
    setLeads(leads.map((l) => (l.id === updated.id ? updated : l)));
    setEditing(null);
    if (active?.id === updated.id) setActive(updated);
  };

  const handleStatusChange = async (id, status) => {
    const lead = leads.find((l) => l.id === id);
    const updated = await api.updateLead(id, { ...lead, status });
    setLeads(leads.map((l) => (l.id === id ? updated : l)));
    setActive(updated);
  };

  const handleArchive = async (id) => {
    await api.deleteLead(id);
    setLeads(leads.filter((l) => l.id !== id));
  };

  return (
    <div>
      <SectionHeader eyebrow="Lead management" title="Leads" action={<PrimaryButton onClick={() => setShowNew(true)}>New lead</PrimaryButton>} />

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search leads by name, company, ID…"
        filters={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="All">All sources</option>
              {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
              <option value="All">All owners</option>
              {assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} label="Created" />
          </>
        }
        right={<span className="muted-note">{filtered.length} of {leads.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead>
            <tr><th>Lead</th><th>Company</th><th>Service</th><th>Source</th><th>Owner</th><th>Status</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td onClick={() => setActive(l)}><div className="cell-strong">{l.name}</div><div className="cell-id">{l.id}</div></td>
                <td onClick={() => setActive(l)}>{l.company}</td>
                <td onClick={() => setActive(l)}>{l.service}</td>
                <td onClick={() => setActive(l)}><span className="tag-chip"><Tag size={11} />{l.source}</span></td>
                <td onClick={() => setActive(l)}><Avatar userId={l.owner} size={24} /></td>
                <td onClick={() => setActive(l)}><Pill label={l.status} /></td>
                <td className="mono-cell" onClick={() => setActive(l)}>{l.createdAt}</td>
                <td>
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(l)}><Pencil size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8}><EmptyState icon={Target} text="No leads match your filters." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && <LeadFormModal title="Create lead" submitLabel="Create lead" onClose={() => setShowNew(false)} onSubmit={handleCreate} />}
      {editing && (
        <LeadFormModal
          title="Edit lead"
          submitLabel="Save changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
      {active && (
        <LeadDrawer
          lead={active}
          onClose={() => setActive(null)}
          onStatusChange={handleStatusChange}
          onEdit={(lead) => { setActive(null); setEditing(lead); }}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
}
