import { useState } from "react";
import { Receipt, AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import StatCard from "../components/common/StatCard";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { useData } from "../context/DataContext";
import { PAYMENT_STATUSES, clientById, inr } from "../data/mockData";
import * as api from "../services/api";

function InvoiceFormModal({ title, submitLabel, initial, onClose, onSubmit }) {
  const { clients, projects } = useData();
  const initialProject = initial?.project ?? "";
  const [form, setForm] = useState({
    client: clients[0]?.id || "", items: "", amount: "", issue: "", due: "", status: "Pending",
    ...initial,
    project: initialProject,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Only show projects that belong to the selected client — an invoice
  // shouldn't be linkable to a project for a different client.
  const clientProjects = projects.filter((p) => p.client === form.client);

  const validate = () => {
    if (!form.client) return "Select a client.";
    if (!form.items.trim()) return "Describe the items/services being billed.";
    if (!form.amount || Number(form.amount) <= 0) return "Enter a valid amount greater than zero.";
    if (form.issue && form.due && form.due < form.issue) return "Due date cannot be before the issue date.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const message = backendErrors
        ? Object.values(backendErrors).flat().join(" ")
        : "Couldn't save the invoice. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.items.trim() || !form.amount || saving} onClick={handleSubmit}>{saving ? "Saving…" : submitLabel}</button></>}
    >
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <Field label="Client">
          <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value, project: "" })}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        </Field>
        <Field label="Project (optional)">
          <select value={form.project} onChange={set("project")}>
            <option value="">No project</option>
            {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Amount (₹)"><input type="number" min="0" value={form.amount} onChange={set("amount")} /></Field>
        <Field label="Payment status">
          <select value={form.status} onChange={set("status")}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Issue date"><input type="date" value={form.issue} onChange={set("issue")} /></Field>
        <Field label="Due date"><input type="date" value={form.due} onChange={set("due")} /></Field>
      </div>
      <Field label="Items / services"><textarea rows={2} value={form.items} onChange={set("items")} /></Field>
    </Modal>
  );
}

export default function InvoicesView() {
  const { invoices, setInvoices, clients, projects } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = invoices.filter((i) => {
    const q = query.toLowerCase();
    const client = clientById(clients, i.client);
    const matchQ = !q || i.id.toLowerCase().includes(q) || (client && client.company.toLowerCase().includes(q));
    const matchS = statusFilter === "All" || i.status === statusFilter;
    const matchClient = clientFilter === "All" || i.client === clientFilter;
    const matchFrom = !dateFrom || i.issue >= dateFrom;
    const matchTo = !dateTo || i.issue <= dateTo;
    return matchQ && matchS && matchClient && matchFrom && matchTo;
  });

  const totalOutstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  const handleCreate = async (form) => {
    const created = await api.createInvoice(form);
    setInvoices([created, ...invoices]);
    setShowNew(false);
  };

  const handleUpdate = async (form) => {
    const updated = await api.updateInvoice(editing.id, form);
    setInvoices(invoices.map((i) => (i.id === updated.id ? updated : i)));
    setEditing(null);
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Archive invoice ${invoice.id}? This cannot be undone.`)) return;
    try {
      await api.deleteInvoice(invoice.id);
      setInvoices(invoices.filter((i) => i.id !== invoice.id));
    } catch (err) {
      const isForbidden = err.response?.status === 403;
      window.alert(isForbidden
        ? "Only a Manager or Admin can archive invoices."
        : "Couldn't archive this invoice. Please try again.");
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="Invoice & payment management" title="Invoices" action={<PrimaryButton onClick={() => setShowNew(true)}>New invoice</PrimaryButton>} />

      <div className="stat-grid stat-grid-3">
        <StatCard icon={Receipt} label="Total invoices" value={invoices.length} accent="#4C6FEF" />
        <StatCard icon={AlertCircle} label="Outstanding" value={inr(totalOutstanding)} accent="#DC4C42" />
        <StatCard icon={CheckCircle2} label="Paid" value={invoices.filter((i) => i.status === "Paid").length} accent="#0F9E8F" />
      </div>

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search invoices by ID or client…"
        filters={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="All">All clients</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
            <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} label="Issued" />
          </>
        }
        right={<span className="muted-note">{filtered.length} of {invoices.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>Invoice</th><th>Client</th><th>Project</th><th>Items</th><th>Amount</th><th>Issue date</th><th>Due date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((i) => {
              const client = clientById(clients, i.client);
              const project = projects.find((p) => p.id === i.project);
              return (
                <tr key={i.id}>
                  <td className="mono-cell cell-strong">{i.id}</td>
                  <td>{client?.company}</td>
                  <td>{project ? project.name : <span className="dim-text">—</span>}</td>
                  <td>{i.items}</td>
                  <td className="mono-cell">{inr(i.amount)}</td>
                  <td className="mono-cell">{i.issue}</td>
                  <td className="mono-cell">{i.due}</td>
                  <td><Pill label={i.status} /></td>
                  <td>
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(i)}><Pencil size={14} /></button>
                    <button className="icon-btn" title="Archive" onClick={() => handleDelete(i)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9}><EmptyState icon={Receipt} text="No invoices match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <InvoiceFormModal title="Create invoice" submitLabel="Create invoice" onClose={() => setShowNew(false)} onSubmit={handleCreate} />}
      {editing && (
        <InvoiceFormModal
          title="Edit invoice"
          submitLabel="Save changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
