import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Download, Target, TrendingUp, DollarSign, ListChecks, Users } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import StatCard from "../components/common/StatCard";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { inr } from "../data/mockData";
import { ROLE_META } from "../data/choices";
import { inRange } from "../utils/finance";
import { computeSourceSplit } from "../utils/leads";

function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * All figures here are computed client-side from the live leads/invoices/
 * tasks collections, filtered by the chosen date range — the backend's
 * /api/dashboard/* endpoints are fixed, all-time aggregates with no
 * period filter (see utils/finance.js), so a "date range" report has to
 * work from the raw collections instead of pretending the backend
 * supports a filter it doesn't.
 */
export default function ReportsView() {
  const { leads, invoices, tasks, users } = useData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const leadsInRange = useMemo(
    () => leads.filter((l) => inRange((l.created_at || "").slice(0, 10), dateFrom, dateTo)),
    [leads, dateFrom, dateTo]
  );
  const invoicesInRange = useMemo(
    () => invoices.filter((i) => inRange(i.issue_date, dateFrom, dateTo)),
    [invoices, dateFrom, dateTo]
  );
  const tasksInRange = useMemo(
    () => tasks.filter((t) => t.due_date && inRange(t.due_date, dateFrom, dateTo)),
    [tasks, dateFrom, dateTo]
  );

  const revenuePaid = invoicesInRange.filter((i) => i.payment_status === "PAID").reduce((s, i) => s + Number(i.amount), 0);
  const revenueOutstanding = invoicesInRange.filter((i) => i.payment_status !== "PAID").reduce((s, i) => s + Number(i.amount), 0);
  const convertedLeads = leadsInRange.filter((l) => l.status === "CONVERTED").length;
  const tasksCompleted = tasksInRange.filter((t) => t.status === "COMPLETED").length;

  const revenueByService = useMemo(() => {
    // Invoices don't carry service directly — bucket by the linked project's
    // client_name/project_name pairing isn't available here, so fall back
    // to project_name (still meaningful — one project per service line).
    const buckets = {};
    invoicesInRange
      .filter((i) => i.payment_status === "PAID")
      .forEach((i) => {
        const bucket = i.project_name || "No project";
        buckets[bucket] = (buckets[bucket] || 0) + Number(i.amount);
      });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [invoicesInRange]);

  const sourceSplit = useMemo(() => computeSourceSplit(leadsInRange, "All"), [leadsInRange]);

  const teamPerformance = useMemo(() => {
    return users
      .map((u) => ({
        user: u,
        leadsOwned: leadsInRange.filter((l) => l.assigned_employee === u.id).length,
        tasksCompleted: tasksInRange.filter((t) => t.assigned_to === u.id && t.status === "COMPLETED").length,
        tasksOpen: tasksInRange.filter((t) => t.assigned_to === u.id && t.status !== "COMPLETED").length,
      }))
      .filter((row) => row.leadsOwned + row.tasksCompleted + row.tasksOpen > 0);
  }, [users, leadsInRange, tasksInRange]);

  const handleExportInvoices = () => {
    downloadCsv(
      "invoices-report.csv",
      invoicesInRange.map((i) => ({
        Invoice: i.invoice_number,
        Client: i.client_name,
        Project: i.project_name || "",
        Amount: i.amount,
        Issued: i.issue_date,
        Due: i.due_date,
        Status: i.payment_status,
      }))
    );
  };

  const handleExportLeads = () => {
    downloadCsv(
      "leads-report.csv",
      leadsInRange.map((l) => ({
        Lead: l.id,
        Name: l.name,
        Company: l.company || "",
        Service: l.service_interested_in || "",
        Source: l.lead_source,
        Owner: l.assigned_employee_name || "",
        Status: l.status,
        Created: (l.created_at || "").slice(0, 10),
      }))
    );
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Company-wide analytics"
        title="Reports"
        action={<GhostButton icon={Download} onClick={handleExportInvoices}>Export invoices CSV</GhostButton>}
      />

      <div className="report-toolbar">
        <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} label="Date range" />
        <GhostButton icon={Download} onClick={handleExportLeads}>Export leads CSV</GhostButton>
      </div>

      <div className="report-summary-grid">
        <StatCard icon={DollarSign} label="Revenue (paid)" value={inr(revenuePaid)} accent="#1E9E64" />
        <StatCard icon={TrendingUp} label="Outstanding" value={inr(revenueOutstanding)} accent="#C8862A" />
        <StatCard icon={Target} label="Converted leads" value={convertedLeads} accent="#4C6FEF" />
        <StatCard icon={ListChecks} label="Tasks completed" value={tasksCompleted} accent="#0F9E8F" />
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Revenue by project</h3>
            <span className="muted-note">{invoicesInRange.length} invoices in range</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByService} margin={{ left: -12 }}>
              <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => inr(v)} contentStyle={{ background: "#EEF2F8", border: "1px solid #E1E6EF", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#C8862A" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Lead source split</h3>
            <span className="muted-note">{leadsInRange.length} leads in range</span>
          </div>
          <div className="pie-row">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={sourceSplit} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={2}>
                  {sourceSplit.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-col">
              {sourceSplit.length === 0 && <span className="muted-note">No leads in this range.</span>}
              {sourceSplit.map((s) => (
                <div key={s.code} className="legend-row">
                  <span className="dot" style={{ background: s.color }} />
                  <span className="legend-label">{s.name}</span>
                  <span className="legend-val">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-head">
          <h3><Users size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Team performance</h3>
          <span className="muted-note">In selected range</span>
        </div>
        <div className="table-card" style={{ marginBottom: 0 }}>
          <table>
            <thead><tr><th>Team member</th><th>Role</th><th>Leads owned</th><th>Tasks completed</th><th>Tasks open</th></tr></thead>
            <tbody>
              {teamPerformance.map((row) => (
                <tr key={row.user.id}>
                  <td className="cell-strong">{row.user.username}</td>
                  <td><span className="tag-chip">{ROLE_META[row.user.role]?.label || row.user.role}</span></td>
                  <td className="mono-cell">{row.leadsOwned}</td>
                  <td className="mono-cell">{row.tasksCompleted}</td>
                  <td className="mono-cell">{row.tasksOpen}</td>
                </tr>
              ))}
              {teamPerformance.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "#8A93A6" }}>No activity in this range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
