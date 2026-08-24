import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Wallet, AlertCircle, CheckCircle2, Percent, Download, Search, ArrowUpRight, Calendar, Receipt,
} from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";
import { GhostButton } from "../../components/common/Buttons";
import { useData } from "../../context/DataContext";
import { SERVICES, clientById, inr } from "../../data/mockData";
import { REVENUE_PERIOD_OPTIONS, computeRevenueByService, computePaymentStatusSplit, daysBetween } from "../../utils/finance";

const PAYMENT_COLORS = { Paid: "#0F9E8F", Pending: "#8A93A6", "Partially Paid": "#C8862A", Overdue: "#DC4C42" };
const RENEWAL_WINDOWS = ["Next 30 days", "Next 60 days", "Next 90 days", "All upcoming"];

export default function AccountantDashboardView({ currentUser, onNavigate }) {
  const { invoices, clients, activity } = useData();

  const [revenuePeriod, setRevenuePeriod] = useState("This year");
  const [splitServiceFilter, setSplitServiceFilter] = useState("All");
  const [overdueQuery, setOverdueQuery] = useState("");
  const [renewalWindow, setRenewalWindow] = useState("Next 60 days");

  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const overdueAmount = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const collectionRate = invoices.length
    ? Math.round((totalRevenue / (totalRevenue + outstanding || 1)) * 100)
    : 0;

  const revenueByServiceData = useMemo(
    () => computeRevenueByService(invoices, clients, revenuePeriod),
    [invoices, clients, revenuePeriod]
  );

  const paymentSplitData = useMemo(
    () => computePaymentStatusSplit(invoices, clients, splitServiceFilter).map((d) => ({ ...d, color: PAYMENT_COLORS[d.name] || "#8A93A6" })),
    [invoices, clients, splitServiceFilter]
  );

  const overdueList = useMemo(() => {
    const q = overdueQuery.toLowerCase();
    return invoices
      .filter((i) => i.status === "Overdue")
      .filter((i) => {
        if (!q) return true;
        const client = clientById(clients, i.client);
        return i.id.toLowerCase().includes(q) || client?.company?.toLowerCase().includes(q);
      })
      .map((i) => ({ ...i, daysOverdue: daysBetween(i.due) }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [invoices, clients, overdueQuery]);

  const upcomingRenewals = useMemo(() => {
    const days = renewalWindow === "Next 30 days" ? 30 : renewalWindow === "Next 60 days" ? 60 : renewalWindow === "Next 90 days" ? 90 : Infinity;
    return clients
      .filter((c) => c.renewalDate && c.renewalDate !== "—")
      .map((c) => ({ ...c, daysUntil: -daysBetween(c.renewalDate) }))
      .filter((c) => c.daysUntil >= 0 && c.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [clients, renewalWindow]);

  const recentPayments = activity.filter((a) => /payment/i.test(a.action)).slice(0, 5);

  return (
    <div>
      <SectionHeader
        eyebrow={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        title="Finance dashboard"
        action={<GhostButton icon={Download}>Export report</GhostButton>}
      />

      <div className="scope-banner">
        <Wallet size={15} color="#1E9E64" />
        Accountant view — invoicing, payments and revenue only. Lead and project pipelines aren't shown here.
      </div>

      <div className="stat-grid">
        <StatCard icon={Wallet} label="Total revenue (paid)" value={inr(totalRevenue)} accent="#1E9E64" />
        <StatCard icon={AlertCircle} label="Outstanding" value={inr(outstanding)} accent="#C8862A" />
        <StatCard icon={Receipt} label="Overdue amount" value={inr(overdueAmount)} accent="#DC4C42" />
        <StatCard icon={Percent} label="Collection rate" value={collectionRate + "%"} accent="#0F9E8F" />
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Revenue by service</h3>
            <select className="select-sm" value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value)}>
              {REVENUE_PERIOD_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={revenueByServiceData} margin={{ left: -12 }}>
              <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => inr(v)} contentStyle={{ background: "#EEF2F8", border: "1px solid #E1E6EF", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#1E9E64" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Payment status split</h3>
            <select className="select-sm" value={splitServiceFilter} onChange={(e) => setSplitServiceFilter(e.target.value)}>
              <option value="All">All services</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="pie-row">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={paymentSplitData} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={2}>
                  {paymentSplitData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-col">
              {paymentSplitData.length === 0 && <span className="muted-note">No invoices in this filter.</span>}
              {paymentSplitData.map((d) => (
                <div key={d.name} className="legend-row">
                  <span className="dot" style={{ background: d.color }} />
                  <span className="legend-label">{d.name}</span>
                  <span className="legend-val">{inr(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-filters">
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>Overdue invoices</h3>
          <div className="panel-filter-row">
            <div className="panel-mini-search">
              <Search size={12} color="#8A93A6" />
              <input value={overdueQuery} onChange={(e) => setOverdueQuery(e.target.value)} placeholder="Search invoice or client…" />
            </div>
            {onNavigate && (
              <button className="panel-link-btn" onClick={() => onNavigate("invoices")}>
                View all invoices <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="table-card" style={{ marginBottom: 0 }}>
          <table>
            <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Due date</th><th>Days overdue</th><th>Status</th></tr></thead>
            <tbody>
              {overdueList.map((i) => (
                <tr key={i.id}>
                  <td className="mono-cell cell-strong">{i.id}</td>
                  <td>{clientById(clients, i.client)?.company}</td>
                  <td className="mono-cell">{inr(i.amount)}</td>
                  <td className="mono-cell">{i.due}</td>
                  <td className="mono-cell">{i.daysOverdue} days</td>
                  <td><Pill label={i.status} /></td>
                </tr>
              ))}
              {overdueList.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "#8A93A6" }}>Nothing overdue for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Upcoming renewals</h3>
            <select className="select-sm" value={renewalWindow} onChange={(e) => setRenewalWindow(e.target.value)}>
              {RENEWAL_WINDOWS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            {upcomingRenewals.map((c) => (
              <div className="mini-row" key={c.id}>
                <div className="mini-row-main">
                  <span className="mini-row-title">{c.company}</span>
                  <span className="mini-row-sub">Renews {c.renewalDate} · {c.paymentStatus}</span>
                </div>
                <span className="tag-chip"><Calendar size={11} />{c.daysUntil}d</span>
              </div>
            ))}
            {upcomingRenewals.length === 0 && <span className="muted-note">No renewals in this window.</span>}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Recent payments</h3>
            <span className="muted-note">From the activity log</span>
          </div>
          <div className="activity-list">
            {recentPayments.map((a) => (
              <div className="activity-row" key={a.id}>
                <CheckCircle2 size={16} color="#0F9E8F" />
                <div className="activity-text">{a.action}</div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
            {recentPayments.length === 0 && <span className="muted-note">No recent payment activity.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
