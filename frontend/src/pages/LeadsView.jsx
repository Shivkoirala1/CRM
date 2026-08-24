import { useMemo, useState } from "react";
import { Target, Phone, Mail, MapPin, Briefcase, DollarSign, User, Tag, History, Circle } from "lucide-react";
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

function NewLeadModal({ onClose, onCreate }) {
  const { users } = useData();
  const assignableUsers = users.filter((u) => u.role !== "Accountant");
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", address: "",
    service: SERVICES[0], budget: "", source: LEAD_SOURCES[0], owner: "u4", notes: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal
      title="Create lead"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.name} onClick={() => onCreate(form)}>Create lead</button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Name"><input value={form.name} onChange={set("name")} placeholder="Contact name" /></Field>
        <Field label="Company"><input value={form.company} onChange={set("company")} placeholder="Company name" /></Field>
        <Field label="Phone"><input value={form.phone} onChange={set("phone")} placeholder="+91 …" /></Field>
        <Field label="Email"><input value={form.email} onChange={set("email")} placeholder="name@company.com" /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} placeholder="City, state" /></Field>
        <Field label="Service interested in">
          <select value={form.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Budget range"><input value={form.budget} onChange={set("budget")} placeholder="₹ …" /></Field>
        <Field label="Lead source">
          <select value={form.source} onChange={set("source")}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Assigned employee">
          <select value={form.owner} onChange={set("owner")}>{assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        </Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Context, requirements…" /></Field>
    </Modal>
  );
}

function LeadDrawer({ lead, onClose }) {
  const { users } = useData();
  return (
    <Drawer title={lead.name} subtitle={lead.company} tag={<div className="eyebrow">{lead.id}</div>} onClose={onClose}>
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
            <button key={s} className={"chip" + (s === lead.status ? " chip-active" : "")}>{s}</button>
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
            <tr><th>Lead</th><th>Company</th><th>Service</th><th>Source</th><th>Owner</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} onClick={() => setActive(l)}>
                <td><div className="cell-strong">{l.name}</div><div className="cell-id">{l.id}</div></td>
                <td>{l.company}</td>
                <td>{l.service}</td>
                <td><span className="tag-chip"><Tag size={11} />{l.source}</span></td>
                <td><Avatar userId={l.owner} size={24} /></td>
                <td><Pill label={l.status} /></td>
                <td className="mono-cell">{l.createdAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState icon={Target} text="No leads match your filters." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewLeadModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
      {active && <LeadDrawer lead={active} onClose={() => setActive(null)} />}
    </div>
  );
}
