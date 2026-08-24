import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { Target, TrendingUp, DollarSign, AlertCircle, Download, Receipt, Search, ArrowUpRight } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";
import Avatar from "../../components/common/Avatar";
import { GhostButton } from "../../components/common/Buttons";
import { useData } from "../../context/DataContext";
import { LEADS_TREND, LEAD_STATUSES, userById, clientById, inr } from "../../data/mockData";
import { computeSourceSplit } from "../../utils/leads";
import { REVENUE_PERIOD_OPTIONS, computeRevenueByService } from "../../utils/finance";

const TREND_PERIODS = ["Last 3 months", "Last 6 months", "All available"];

export default function AdminDashboardView({ currentUser, onNavigate }) {
  const { leads, invoices, tasks, activity, users, clients } = useData();

  // ---- panel-level filters ----
  const [trendPeriod, setTrendPeriod] = useState("Last 6 months");
  const [sourceStatusFilter, setSourceStatusFilter] = useState("All");
  const [revenuePeriod, setRevenuePeriod] = useState("This year");
  const [activityUserFilter, setActivityUserFilter] = useState("All");
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");

  const totalLeads = leads.length;
  const qualified = leads.filter((l) => l.status === "Qualified").length;
  const conversionRate = totalLeads ? Math.round((qualified / totalLeads) * 100) : 0;
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
  const overdueTasks = tasks.filter((t) => t.status === "Overdue");
  const revenueMonth = invoices.filter((i) => i.issue.startsWith("2026-08")).reduce((s, i) => s + i.amount, 0);

  const leadsTrendData = useMemo(() => {
    const months = trendPeriod === "Last 3 months" ? 3 : trendPeriod === "Last 6 months" ? 6 : LEADS_TREND.length;
    return LEADS_TREND.slice(-months);
  }, [trendPeriod]);

  const sourceSplitData = useMemo(
    () => computeSourceSplit(leads, sourceStatusFilter),
    [leads, sourceStatusFilter]
  );

  const revenueByServiceData = useMemo(
    () => computeRevenueByService(invoices, clients, revenuePeriod),
    [invoices, clients, revenuePeriod]
  );

  const filteredActivity = useMemo(() => {
    const pool = activityUserFilter === "All" ? activity : activity.filter((a) => a.user === activityUserFilter);
    return pool.slice(0, 5);
  }, [activity, activityUserFilter]);

  // Lead-details panel — a compact, filterable view of the same record
  // detail the Leads module shows, surfaced directly on the dashboard.
  const leadDetails = useMemo(() => {
    return leads
      .filter((l) => {
        const q = leadQuery.toLowerCase();
        const matchQ = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
        const matchS = leadStatusFilter === "All" || l.status === leadStatusFilter;
        return matchQ && matchS;
      })
      .slice(0, 6);
  }, [leads, leadQuery, leadStatusFilter]);

  return (
    <div>
      <SectionHeader
        eyebrow={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        title="Dashboard"
        action={<GhostButton icon={Download}>Export report</GhostButton>}
      />

      <div className="stat-grid">
        <StatCard icon={Target} label="Total leads" value={totalLeads} delta="+18% this month" accent="#4C6FEF" />
        <StatCard icon={TrendingUp} label="Conversion rate" value={conversionRate + "%"} delta="+4pts" accent="#0F9E8F" />
        <StatCard icon={DollarSign} label="Revenue — August" value={inr(revenueMonth)} delta="+9% vs Jul" accent="#C8862A" />
        <StatCard icon={AlertCircle} label="Overdue items" value={overdueInvoices.length + overdueTasks.length} delta="-2 vs last week" accent="#DC4C42" />
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Leads received</h3>
            <select className="select-sm" value={trendPeriod} onChange={(e) => setTrendPeriod(e.target.value)}>
              {TREND_PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={leadsTrendData}>
              <CartesianGrid stroke="#E7EBF2" vertical={false} />
              <XAxis dataKey="month" stroke="#8A93A6" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={12} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "#EEF2F8", border: "1px solid #E1E6EF", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="leads" stroke="#C8862A" strokeWidth={2.5} dot={{ r: 3, fill: "#C8862A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Lead source split</h3>
            <select className="select-sm" value={sourceStatusFilter} onChange={(e) => setSourceStatusFilter(e.target.value)}>
              <option>All</option>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="pie-row">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={sourceSplitData} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={2}>
                  {sourceSplitData.map((s, i) => <Cell key={i} fill={s.color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-col">
              {sourceSplitData.length === 0 && <span className="muted-note">No leads in this filter.</span>}
              {sourceSplitData.map((s) => (
                <div key={s.name} className="legend-row">
                  <span className="dot" style={{ background: s.color }} />
                  <span className="legend-label">{s.name}</span>
                  <span className="legend-val">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <CartesianGrid stroke="#E7EBF2" vertical={false} />
              <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => inr(v)} contentStyle={{ background: "#EEF2F8", border: "1px solid #E1E6EF", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#0F9E8F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Needs attention</h3>
            <span className="muted-note">{overdueInvoices.length + overdueTasks.length} items</span>
          </div>
          <div className="attention-list">
            {overdueTasks.map((t) => (
              <div className="attention-row" key={t.id}>
                <AlertCircle size={14} color="#DC4C42" />
                <span className="attention-text">{t.title}</span>
                <Pill label="Overdue" />
              </div>
            ))}
            {overdueInvoices.map((i) => (
              <div className="attention-row" key={i.id}>
                <Receipt size={14} color="#DC4C42" />
                <span className="attention-text">
                  {i.id} — {clientById(clients, i.client)?.company} — {inr(i.amount)}
                </span>
                <Pill label="Overdue" />
              </div>
            ))}
            {overdueTasks.length + overdueInvoices.length === 0 && <span className="muted-note">Nothing overdue right now.</span>}
          </div>
        </div>
      </div>

      {/* Lead details — the record-level detail panel on this dashboard,
          filterable the same way the Leads module itself is. */}
      <div className="panel-card">
        <div className="panel-card-filters">
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>Lead details</h3>
          <div className="panel-filter-row">
            <div className="panel-mini-search">
              <Search size={12} color="#8A93A6" />
              <input value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} placeholder="Search leads…" />
            </div>
            <select className="select-sm" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
              <option>All</option>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {onNavigate && (
              <button className="panel-link-btn" onClick={() => onNavigate("leads")}>
                View all <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="table-card" style={{ marginBottom: 0 }}>
          <table>
            <thead><tr><th>Lead</th><th>Company</th><th>Service</th><th>Source</th><th>Owner</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {leadDetails.map((l) => (
                <tr key={l.id} onClick={() => onNavigate && onNavigate("leads")}>
                  <td><div className="cell-strong">{l.name}</div><div className="cell-id">{l.id}</div></td>
                  <td>{l.company}</td>
                  <td>{l.service}</td>
                  <td>{l.source}</td>
                  <td><Avatar userId={l.owner} size={22} /></td>
                  <td><Pill label={l.status} /></td>
                  <td className="mono-cell">{l.createdAt}</td>
                </tr>
              ))}
              {leadDetails.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#8A93A6" }}>No leads match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-head">
          <h3>Team activity</h3>
          <select className="select-sm" value={activityUserFilter} onChange={(e) => setActivityUserFilter(e.target.value)}>
            <option value="All">All team members</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="activity-list">
          {filteredActivity.map((a) => (
            <div className="activity-row" key={a.id}>
              <Avatar userId={a.user} size={26} />
              <div className="activity-text">
                <b>{userById(users, a.user)?.name}</b> {a.action}
              </div>
              <span className="activity-time">{a.time}</span>
            </div>
          ))}
          {filteredActivity.length === 0 && <span className="muted-note">No activity for this filter.</span>}
        </div>
      </div>
    </div>
  );
}
