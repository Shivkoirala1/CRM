import { useState } from "react";
import { Building2, Phone, Mail, MapPin, FolderKanban, Calendar, Receipt, Tag, AlertCircle } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Drawer from "../components/common/Drawer";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { PAYMENT_STATUS_META, PROJECT_STATUS_META, SERVICE_SUGGESTIONS, metaOptions } from "../data/choices";
import * as api from "../services/api";

const PAYMENT_STATUS_OPTIONS = metaOptions(PAYMENT_STATUS_META);

function NewClientModal({ onClose, onCreate }) {
  const { users } = useData();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", company_name: "",
    services: "", assigned_employee: "", payment_status: "PENDING", renewal_date: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onCreate({ ...form, assigned_employee: form.assigned_employee || null, renewal_date: form.renewal_date || null });
    } catch (err) {
      setError(api.getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create client"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.name || saving} onClick={submit}>
            {saving ? "Creating…" : "Create client"}
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}
      <div className="form-grid">
        <Field label="Contact name"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Company"><input value={form.company_name} onChange={set("company_name")} /></Field>
        <Field label="Phone"><input value={form.phone} onChange={set("phone")} /></Field>
        <Field label="Email"><input value={form.email} onChange={set("email")} /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} /></Field>
        <Field label="Services">
          <input list="service-suggestions" value={form.services} onChange={set("services")} placeholder="e.g. Web Development, SEO" />
        </Field>
        <Field label="Assigned employee">
          <select value={form.assigned_employee} onChange={set("assigned_employee")}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </Field>
        <Field label="Payment status">
          <select value={form.payment_status} onChange={set("payment_status")}>
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Renewal date"><input type="date" value={form.renewal_date} onChange={set("renewal_date")} /></Field>
      </div>
      <Field label="Notes"><textarea rows={2} value={form.notes} onChange={set("notes")} /></Field>
      <datalist id="service-suggestions">
        {SERVICE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
      </datalist>
    </Modal>
  );
}

function ClientDrawer({ client, onClose }) {
  const { projects, invoices } = useData();
  const relatedProjects = projects.filter((p) => p.client === client.id);
  const relatedInvoices = invoices.filter((i) => i.client === client.id);
  const servicesList = (client.services || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <Drawer title={client.company_name || client.name} subtitle={client.name} tag={<div className="eyebrow">Client #{client.id}</div>} onClose={onClose}>
      <div className="drawer-status-row">
        <Pill code={client.payment_status} meta={PAYMENT_STATUS_META} />
        <span className="dim-text">Renews {client.renewal_date || "—"}</span>
      </div>

      <div className="detail-grid">
        <div><span className="detail-k"><Phone size={13} /> Phone</span><span className="detail-v">{client.phone || "—"}</span></div>
        <div><span className="detail-k"><Mail size={13} /> Email</span><span className="detail-v">{client.email || "—"}</span></div>
        <div><span className="detail-k"><MapPin size={13} /> Address</span><span className="detail-v">{client.address || "—"}</span></div>
        <div><span className="detail-k"><Building2 size={13} /> Services</span><span className="detail-v">{servicesList.join(", ") || "—"}</span></div>
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><FolderKanban size={13} /> Projects ({relatedProjects.length})</div>
        {relatedProjects.length === 0 && <p className="notes-text">No projects yet.</p>}
        {relatedProjects.map((p) => (
          <div key={p.id} className="mini-row">
            <span>{p.name}</span>
            <Pill code={p.status} meta={PROJECT_STATUS_META} />
          </div>
        ))}
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title"><Receipt size={13} /> Payment history ({relatedInvoices.length})</div>
        {relatedInvoices.length === 0 && <p className="notes-text">No invoices yet.</p>}
        {relatedInvoices.map((i) => (
          <div key={i.id} className="mini-row">
            <span className="mono-cell">{i.invoice_number} — ₹{Number(i.amount).toLocaleString("en-IN")}</span>
            <Pill code={i.payment_status} meta={PAYMENT_STATUS_META} />
          </div>
        ))}
      </div>

      <div className="drawer-block">
        <div className="drawer-block-title">Notes</div>
        <p className="notes-text">{client.notes || "No notes yet."}</p>
      </div>
    </Drawer>
  );
}

export default function ClientsView() {
  const { clients, setClients, projects } = useData();
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState(null);

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q || (c.company_name || "").toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q) || String(c.id).includes(q);
    const matchPayment = paymentFilter === "All" || c.payment_status === paymentFilter;
    const matchService = serviceFilter === "All" || (c.services || "").toLowerCase().includes(serviceFilter.toLowerCase());
    return matchQ && matchPayment && matchService;
  });

  const handleCreate = async (payload) => {
    const created = await api.createClient(payload);
    setClients([created, ...clients]);
    setShowNew(false);
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
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="All">All services</option>
              {SERVICE_SUGGESTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </>
        }
        right={<span className="muted-note">{filtered.length} of {clients.length}</span>}
      />

      <div className="card-grid">
        {filtered.map((c) => {
          const projectCount = projects.filter((p) => p.client === c.id).length;
          return (
            <div key={c.id} className="client-card" onClick={() => setActive(c)}>
              <div className="client-card-top">
                <div className="client-avatar"><Building2 size={16} /></div>
                <Pill code={c.payment_status} meta={PAYMENT_STATUS_META} />
              </div>
              <div className="client-card-name">{c.company_name || c.name}</div>
              <div className="client-card-contact">{c.name}</div>
              <div className="client-card-services">
                {(c.services || "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="tag-chip"><Tag size={11} />{s}</span>
                ))}
              </div>
              <div className="client-card-foot">
                <span><FolderKanban size={12} /> {projectCount} projects</span>
                <span><Calendar size={12} /> renews {c.renewal_date || "—"}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon={AlertCircle} text="No clients match your search." />}
      </div>

      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
      {active && <ClientDrawer client={active} onClose={() => setActive(null)} />}
    </div>
  );
}
