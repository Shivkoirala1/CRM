import { useState } from "react";
import { Users2, Phone, Mail, MapPin, Building2, FolderKanban, Receipt, Calendar, Tag, Pencil, Archive } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Drawer from "../components/common/Drawer";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { SERVICES, PAYMENT_STATUSES, STATUS_STYLES } from "../data/mockData";
import * as api from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Nepal mobile numbers are exactly 10 digits — no symbols, no spaces.
const PHONE_RE = /^\d{10}$/;

function ClientFormModal({ title, submitLabel, initial, onClose, onSubmit }) {
  const initialServices = initial?.services?.[0] || SERVICES[0];
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", address: "",
    paymentStatus: PAYMENT_STATUSES[0], renewalDate: "", notes: "",
    ...initial,
    services: initialServices,
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
        : "Couldn't save the client. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.name.trim() || saving} onClick={handleSubmit}>{saving ? "Saving…" : submitLabel}</button></>}
    >
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <Field label="Contact name *"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Company"><input value={form.company} onChange={set("company")} /></Field>
        <Field label="Phone (10 digits)">
          <input type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={setPhone} placeholder="98XXXXXXXX" />
        </Field>
        <Field label="Email"><input type="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} /></Field>
        <Field label="Primary service">
          <select value={form.services} onChange={set("services")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Payment status">
          <select value={form.paymentStatus} onChange={set("paymentStatus")}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Renewal date"><input type="date" value={form.renewalDate === "—" ? "" : form.renewalDate} onChange={set("renewalDate")} /></Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={form.notes} onChange={set("notes")} /></Field>
    </Modal>
  );
}

function ClientDrawer({ client, onClose, onStatusChange, onEdit, onArchive }) {
  const { projects, invoices } = useData();
  const [archiving, setArchiving] = useState(false);
  const relatedProjects = projects.filter((p) => client.projects.includes(p.id));
  const relatedInvoices = invoices.filter((i) => client.invoices.includes(i.id));

  const handleArchive = async () => {
    if (!window.confirm(`Archive client "${client.company || client.name}"?`)) return;
    setArchiving(true);
    try {
      await onArchive(client.id);
      onClose();
    } catch {
      window.alert("Couldn't archive this client. Please try again.");
      setArchiving(false);
    }
  };

  return (
    <Drawer title={client.company} subtitle={client.name} tag={<div className="eyebrow">{client.id}</div>} onClose={onClose}>
      <div className="drawer-actions-row">
        <GhostButton icon={Pencil} onClick={() => onEdit(client)}>Edit</GhostButton>
        <GhostButton icon={Archive} onClick={handleArchive}>{archiving ? "Archiving…" : "Archive"}</GhostButton>
      </div>

      <div className="drawer-status-row">
        <Field label="Payment status">
          <select value={client.paymentStatus} onChange={(e) => onStatusChange(client.id, e.target.value)}>
            {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <span className="dim-text">Renews {client.renewalDate}</span>
      </div>

      <div className="detail-grid">
        <div><span className="detail-k"><Phone size={13} /> Phone</span><span className="detail-v">{client.phone}</span></div>
        <div><span className="detail-k"><Mail size={13} /> Email</span><span className="detail-v">{client.email}</span></div>
        <div><span className="detail-k"><MapPin size={13} /> Address</span><span className="detail-v">{client.address}</span></div>
        <div><span className="detail-k"><Building2 size={13} /> Services</span><span className="detail-v">{client.services.join(", ")}</span></div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><FolderKanban size={13} /> Projects ({relatedProjects.length})</div>
        {relatedProjects.length === 0 && <p className="notes-text">No active projects.</p>}
        {relatedProjects.map((p) => (
          <div key={p.id} className="mini-row">
            <span>{p.name}</span>
            <Pill label={p.status} />
          </div>
        ))}
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><Receipt size={13} /> Payment history ({relatedInvoices.length})</div>
        {relatedInvoices.length === 0 && <p className="notes-text">No invoices yet.</p>}
        {relatedInvoices.map((i) => (
          <div key={i.id} className="mini-row">
            <span className="mono-cell">{i.id} — ₹{i.amount.toLocaleString("en-IN")}</span>
            <Pill label={i.status} />
          </div>
        ))}
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Notes</div>
        <p className="notes-text">{client.notes}</p>
      </div>
    </Drawer>
  );
}

export default function ClientsView() {
  const { clients, setClients } = useData();
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q || c.company.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    const matchPayment = paymentFilter === "All" || c.paymentStatus === paymentFilter;
    const matchService = serviceFilter === "All" || c.services.includes(serviceFilter);
    return matchQ && matchPayment && matchService;
  });

  const handleCreate = async (form) => {
    const created = await api.createClient({
      ...form,
      services: [form.services],
      projects: [],
      invoices: [],
      notes: form.notes || "New client — no notes yet.",
    });
    setClients([created, ...clients]);
    setShowNew(false);
  };

  const handleUpdate = async (form) => {
    const updated = await api.updateClient(editing.id, { ...form, services: [form.services] });
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    setEditing(null);
    if (active?.id === updated.id) setActive(updated);
  };

  const handleStatusChange = async (id, paymentStatus) => {
    const client = clients.find((c) => c.id === id);
    const updated = await api.updateClient(id, { ...client, services: client.services, paymentStatus });
    setClients(clients.map((c) => (c.id === id ? updated : c)));
    setActive(updated);
  };

  const handleArchive = async (id) => {
    await api.deleteClient(id);
    setClients(clients.filter((c) => c.id !== id));
  };

  return (
    <div>
      <SectionHeader eyebrow="Contact & client management" title="Clients" action={<PrimaryButton onClick={() => setShowNew(true)}>New client</PrimaryButton>} />
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search clients by name, company, ID…"
        filters={
          <>
            <select className="filter-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="All">All payment statuses</option>
              {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="All">All services</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </>
        }
        right={<span className="muted-note">{filtered.length} of {clients.length}</span>}
      />

      <div className="card-grid">
        {filtered.map((c) => (
          <div key={c.id} className="client-card">
            <div className="client-card-top" onClick={() => setActive(c)}>
              <div className="client-avatar"><Building2 size={16} /></div>
              <Pill label={c.paymentStatus} />
            </div>
            <div onClick={() => setActive(c)}>
              <div className="client-card-name">{c.company}</div>
              <div className="client-card-contact">{c.name}</div>
              <div className="client-card-services">
                {c.services.map((s) => <span key={s} className="tag-chip"><Tag size={11} />{s}</span>)}
              </div>
            </div>
            <div className="client-card-foot">
              <span onClick={() => setActive(c)}><FolderKanban size={12} /> {c.projects.length} projects</span>
              <span onClick={() => setActive(c)}><Calendar size={12} /> renews {c.renewalDate}</span>
              <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditing(c); }}><Pencil size={13} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon={Users2} text="No clients match your search." />}
      </div>

      {showNew && <ClientFormModal title="Create client" submitLabel="Create client" onClose={() => setShowNew(false)} onSubmit={handleCreate} />}
      {editing && (
        <ClientFormModal
          title="Edit client"
          submitLabel="Save changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
      {active && (
        <ClientDrawer
          client={active}
          onClose={() => setActive(null)}
          onStatusChange={handleStatusChange}
          onEdit={(client) => { setActive(null); setEditing(client); }}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
}
