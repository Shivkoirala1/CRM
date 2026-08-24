import { useState } from "react";
import { Users2, Phone, Mail, MapPin, Building2, FolderKanban, Receipt, Calendar, Tag } from "lucide-react";
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

function NewClientModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", address: "", services: SERVICES[0] });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal
      title="Create client"
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.name} onClick={() => onCreate(form)}>Create client</button></>}
    >
      <div className="form-grid">
        <Field label="Contact name"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Company"><input value={form.company} onChange={set("company")} /></Field>
        <Field label="Phone"><input value={form.phone} onChange={set("phone")} /></Field>
        <Field label="Email"><input value={form.email} onChange={set("email")} /></Field>
        <Field label="Address"><input value={form.address} onChange={set("address")} /></Field>
        <Field label="Primary service">
          <select value={form.services} onChange={set("services")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
    </Modal>
  );
}

function ClientDrawer({ client, onClose }) {
  const { projects, invoices } = useData();
  const relatedProjects = projects.filter((p) => client.projects.includes(p.id));
  const relatedInvoices = invoices.filter((i) => client.invoices.includes(i.id));
  return (
    <Drawer title={client.company} subtitle={client.name} tag={<div className="eyebrow">{client.id}</div>} onClose={onClose}>
      <div className="drawer-status-row">
        <Pill label={client.paymentStatus} styleMap={STATUS_STYLES} />
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
      paymentStatus: "Pending",
      renewalDate: "—",
      notes: "New client — no notes yet.",
    });
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
          <div key={c.id} className="client-card" onClick={() => setActive(c)}>
            <div className="client-card-top">
              <div className="client-avatar"><Building2 size={16} /></div>
              <Pill label={c.paymentStatus} />
            </div>
            <div className="client-card-name">{c.company}</div>
            <div className="client-card-contact">{c.name}</div>
            <div className="client-card-services">
              {c.services.map((s) => <span key={s} className="tag-chip"><Tag size={11} />{s}</span>)}
            </div>
            <div className="client-card-foot">
              <span><FolderKanban size={12} /> {c.projects.length} projects</span>
              <span><Calendar size={12} /> renews {c.renewalDate}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon={Users2} text="No clients match your search." />}
      </div>

      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
      {active && <ClientDrawer client={active} onClose={() => setActive(null)} />}
    </div>
  );
}
