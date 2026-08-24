import { useState } from "react";
import { Receipt, AlertCircle, CheckCircle2, Download } from "lucide-react";
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

function NewInvoiceModal({ onClose, onCreate }) {
  const { clients } = useData();
  const [form, setForm] = useState({ client: clients[0]?.id || "", items: "", amount: "", issue: "", due: "", status: "Pending" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal
      title="Create invoice"
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.items || !form.amount} onClick={() => onCreate({ ...form, amount: Number(form.amount) })}>Create invoice</button></>}
    >
      <div className="form-grid">
        <Field label="Client">
          <select value={form.client} onChange={set("client")}>{clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select>
        </Field>
        <Field label="Amount (₹)"><input type="number" value={form.amount} onChange={set("amount")} /></Field>
        <Field label="Issue date"><input type="date" value={form.issue} onChange={set("issue")} /></Field>
        <Field label="Due date"><input type="date" value={form.due} onChange={set("due")} /></Field>
        <Field label="Payment status">
          <select value={form.status} onChange={set("status")}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <Field label="Items / services"><textarea rows={2} value={form.items} onChange={set("items")} /></Field>
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

  return (
    <div>
      <SectionHeader eyebrow="Invoice & payment management" title="Invoices" action={<PrimaryButton onClick={() => setShowNew(true)}>New invoice</PrimaryButton>} />

      <div className="stat-grid stat-grid-3">
        <StatCard icon={Receipt} label="Total invoices" value={invoices.length} accent="#4C6FEF" />
        <StatCard icon={AlertCircle} label="Outstanding" value={inr(totalOutstanding)} accent="#DC4C42" />
        <StatCard icon={CheckCircle2} label="Paid this month" value={invoices.filter((i) => i.status === "Paid").length} accent="#0F9E8F" />
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
        right={<GhostButton icon={Download}>Export CSV</GhostButton>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th>Invoice</th><th>Client</th><th>Items</th><th>Amount</th><th>Issue date</th><th>Due date</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((i) => {
              const client = clientById(clients, i.client);
              return (
                <tr key={i.id}>
                  <td className="mono-cell cell-strong">{i.id}</td>
                  <td>{client?.company}</td>
                  <td>{i.items}</td>
                  <td className="mono-cell">{inr(i.amount)}</td>
                  <td className="mono-cell">{i.issue}</td>
                  <td className="mono-cell">{i.due}</td>
                  <td><Pill label={i.status} /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState icon={Receipt} text="No invoices match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewInvoiceModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
