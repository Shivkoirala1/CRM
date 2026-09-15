import { useState } from "react";
import { Receipt, AlertCircle, CheckCircle2, Download } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { inr } from "../data/mockData";
import { PAYMENT_STATUS_META, metaOptions } from "../data/choices";
import * as api from "../services/api";

const PAYMENT_STATUS_OPTIONS = metaOptions(PAYMENT_STATUS_META);

// invoice_number is required + unique on the backend, with no auto-generation
// there — suggest a sequential-looking one from the highest existing number,
// but leave it editable since the backend is the source of truth for uniqueness.
function suggestInvoiceNumber(invoices) {
  const nums = invoices
    .map((i) => parseInt(String(i.invoice_number).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 3000) + 1;
  return `INV-${next}`;
}

function NewInvoiceModal({ onClose, onCreate, invoices }) {
  const { clients, projects } = useData();
  const [form, setForm] = useState({
    invoice_number: suggestInvoiceNumber(invoices),
    client: clients[0]?.id || "",
    project: "",
    items_services: "",
    amount: "",
    issue_date: "",
    due_date: "",
    payment_status: "PENDING",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const clientProjects = projects.filter((p) => String(p.client) === String(form.client));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onCreate({
        ...form,
        client: Number(form.client),
        project: form.project ? Number(form.project) : null,
        amount: Number(form.amount),
      });
    } catch (err) {
      setError(api.getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create invoice"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.invoice_number || !form.client || !form.amount || saving} onClick={submit}>
            {saving ? "Creating…" : "Create invoice"}
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}
      {clients.length === 0 && <div className="login-error">Create a client first — an invoice must belong to one.</div>}
      <div className="form-grid">
        <Field label="Invoice number"><input value={form.invoice_number} onChange={set("invoice_number")} /></Field>
        <Field label="Client">
          <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value, project: "" })}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
          </select>
        </Field>
        <Field label="Project (optional)">
          <select value={form.project} onChange={set("project")}>
            <option value="">None</option>
            {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Amount (₹)"><input type="number" value={form.amount} onChange={set("amount")} /></Field>
        <Field label="Issue date"><input type="date" value={form.issue_date} onChange={set("issue_date")} /></Field>
        <Field label="Due date"><input type="date" value={form.due_date} onChange={set("due_date")} /></Field>
        <Field label="Payment status">
          <select value={form.payment_status} onChange={set("payment_status")}>
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Items / services"><textarea rows={2} value={form.items_services} onChange={set("items_services")} /></Field>
    </Modal>
  );
}

export default function InvoicesView() {
  const { invoices, setInvoices, clients } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showNew, setShowNew] = useState(false);

  const filtered = invoices.filter((i) => {
    const q = query.toLowerCase();
    const matchQ = !q || i.invoice_number.toLowerCase().includes(q) || (i.client_name || "").toLowerCase().includes(q);
    const matchS = statusFilter === "All" || i.payment_status === statusFilter;
    const matchClient = clientFilter === "All" || String(i.client) === clientFilter;
    const matchFrom = !dateFrom || i.issue_date >= dateFrom;
    const matchTo = !dateTo || i.issue_date <= dateTo;
    return matchQ && matchS && matchClient && matchFrom && matchTo;
  });

  const totalOutstanding = invoices.filter((i) => i.payment_status !== "PAID").reduce((s, i) => s + Number(i.amount), 0);

  const handleCreate = async (payload) => {
    const created = await api.createInvoice(payload);
    setInvoices([created, ...invoices]);
    setShowNew(false);
  };

  return (
    <div>
      <SectionHeader eyebrow="Invoice & payment management" title="Invoices" action={<PrimaryButton onClick={() => setShowNew(true)}>New invoice</PrimaryButton>} />

      <div className="stat-grid stat-grid-3">
        <StatCard icon={Receipt} label="Total invoices" value={invoices.length} accent="#4C6FEF" />
        <StatCard icon={AlertCircle} label="Outstanding" value={inr(totalOutstanding)} accent="#DC4C42" />
        <StatCard icon={CheckCircle2} label="Paid" value={invoices.filter((i) => i.payment_status === "PAID").length} accent="#0F9E8F" />
      </div>

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search invoices by number or client…"
        filters={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="All">All clients</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
            </select>
            <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} label="Issued" />
          </>
        }
        right={<GhostButton icon={Download}>Export CSV</GhostButton>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>Invoice</th><th>Client</th><th>Items</th><th>Amount</th><th>Issue date</th><th>Due date</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td className="mono-cell cell-strong">{i.invoice_number}</td>
                <td>{i.client_name}</td>
                <td>{i.items_services}</td>
                <td className="mono-cell">{inr(i.amount)}</td>
                <td className="mono-cell">{i.issue_date}</td>
                <td className="mono-cell">{i.due_date}</td>
                <td><Pill code={i.payment_status} meta={PAYMENT_STATUS_META} /></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState icon={Receipt} text="No invoices match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewInvoiceModal onClose={() => setShowNew(false)} onCreate={handleCreate} invoices={invoices} />}
    </div>
  );
}
