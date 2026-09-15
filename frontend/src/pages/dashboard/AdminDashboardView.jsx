import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Target, TrendingUp, DollarSign, AlertCircle, Receipt, Search, ArrowUpRight, Clock } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";
import Avatar from "../../components/common/Avatar";
import { useData } from "../../context/DataContext";
import { inr } from "../../data/mockData";
import { LEAD_STATUS_META } from "../../data/choices";
import { computeSourceSplit, computeStatusBreakdown } from "../../utils/leads";
import { REVENUE_PERIOD_OPTIONS, computeRevenueByService } from "../../utils/finance";

export default function AdminDashboardView({ currentUser, onNavigate }) {
  const { leads, invoices, tasks, projects, dashboardStats } = useData();

  const [sourceStatusFilter, setSourceStatusFilter] = useState("All");
  const [revenuePeriod, setRevenuePeriod] = useState("This year");
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");

  const totalLeads = dashboardStats?.leads?.total_leads ?? leads.length;
  const conversionRate = dashboardStats?.leads?.conversion_rate ?? 0;
  const totalRevenue = dashboardStats?.revenue?.total_paid ?? invoices.filter((i) => i.payment_status === "PAID").reduce((s, i) => s + Number(i.amount), 0);

  const overdueInvoices = invoices.filter((i) => i.payment_status === "OVERDUE");
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE");

  const statusBreakdown = useMemo(() => computeStatusBreakdown(leads), [leads]);
  const sourceSplitData = useMemo(() => computeSourceSplit(leads, sourceStatusFilter), [leads, sourceStatusFilter]);
  const revenueByServiceData = useMemo(
    () => computeRevenueByService(invoices, projects, revenuePeriod),
    [invoices, projects, revenuePeriod]
  );

  // Lead-details panel — record-level detail directly on the dashboard,
  // filterable the same way the Leads module itself is.
  const leadDetails = useMemo(() => {
    return leads
      .filter((l) => {
        const q = leadQuery.toLowerCase();
        const matchQ = !q || l.name.toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q);
        const matchS = leadStatusFilter === "All" || l.status === leadStatusFilter;
        return matchQ && matchS;
      })
      .slice(0, 6);
  }, [leads, leadQuery, leadStatusFilter]);

  const recentlyUpdated = useMemo(
    () => [...leads].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")).slice(0, 5),
    [leads]
  );

  return (
    <div>
      <SectionHeader eyebrow={`Welcome back, ${currentUser.username}`} title="Dashboard" />

      <div className="stat-grid">
        <StatCard icon={Target} label="Total leads" value={totalLeads} accent="#4C6FEF" />
        <StatCard icon={TrendingUp} label="Conversion rate" value={conversionRate + "%"} accent="#0F9E8F" />
        <StatCard icon={DollarSign} label="Revenue (paid)" value={inr(totalRevenue)} accent="#C8862A" />
        <StatCard icon={AlertCircle} label="Overdue items" value={overdueInvoices.length + overdueTasks.length} accent="#DC4C42" />
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Leads by status</h3>
            <span className="muted-note">All leads</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusBreakdown.map((s) => ({ name: LEAD_STATUS_META[s.code]?.label || s.code, value: s.count }))}>
              <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={12} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#EEF2F8", border: "1px solid #E1E6EF", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#C8862A" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Lead source split</h3>
            <select className="select-sm" value={sourceStatusFilter} onChange={(e) => setSourceStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {Object.entries(LEAD_STATUS_META).map(([code, m]) => <option key={code} value={code}>{m.label}</option>)}
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

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-head">
            <h3>Revenue by service</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select className="select-sm" value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value)}>
                {REVENUE_PERIOD_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {onNavigate && (
                <button className="panel-link-btn" onClick={() => onNavigate("reports")}>
                  Full report <ArrowUpRight size={12} />
                </button>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={revenueByServiceData} margin={{ left: -12 }}>
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
              <div className="attention-row" key={`t-${t.id}`}>
                <AlertCircle size={14} color="#DC4C42" />
                <span className="attention-text">{t.title}</span>
                <Pill code="OVERDUE" meta={{ OVERDUE: { label: "Overdue", bg: "#FCE7E5", fg: "#DC4C42" } }} />
              </div>
            ))}
            {overdueInvoices.map((i) => (
              <div className="attention-row" key={`i-${i.id}`}>
                <Receipt size={14} color="#DC4C42" />
                <span className="attention-text">{i.invoice_number} — {i.client_name} — {inr(i.amount)}</span>
                <Pill code="OVERDUE" meta={{ OVERDUE: { label: "Overdue", bg: "#FCE7E5", fg: "#DC4C42" } }} />
              </div>
            ))}
            {overdueTasks.length + overdueInvoices.length === 0 && <span className="muted-note">Nothing overdue right now.</span>}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-filters">
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>Lead details</h3>
          <div className="panel-filter-row">
            <div className="panel-mini-search">
              <Search size={12} color="#8A93A6" />
              <input value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} placeholder="Search leads…" />
            </div>
            <select className="select-sm" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {Object.entries(LEAD_STATUS_META).map(([code, m]) => <option key={code} value={code}>{m.label}</option>)}
            </select>
            {onNavigate && (
              <button className="panel-link-btn" onClick={() => onNavigate("calendar")}>
                Calendar <ArrowUpRight size={12} />
              </button>
            )}
            {onNavigate && (
              <button className="panel-link-btn" onClick={() => onNavigate("leads")}>
                View all <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="table-card" style={{ marginBottom: 0 }}>
          <table>
            <thead><tr><th>Lead</th><th>Company</th><th>Service</th><th>Owner</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {leadDetails.map((l) => (
                <tr key={l.id} onClick={() => onNavigate && onNavigate("leads")}>
                  <td><div className="cell-strong">{l.name}</div><div className="cell-id">#{l.id}</div></td>
                  <td>{l.company || "—"}</td>
                  <td>{l.service_interested_in || "—"}</td>
                  <td>{l.assigned_employee ? <Avatar userId={l.assigned_employee} size={22} /> : "—"}</td>
                  <td><Pill code={l.status} meta={LEAD_STATUS_META} /></td>
                  <td className="mono-cell">{(l.created_at || "").slice(0, 10)}</td>
                </tr>
              ))}
              {leadDetails.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "#8A93A6" }}>No leads match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-head">
          <h3>Recently updated leads</h3>
          <span className="muted-note">Latest activity on lead records</span>
        </div>
        <div className="activity-list">
          {recentlyUpdated.map((l) => (
            <div className="activity-row" key={l.id}>
              <Clock size={15} color="#8A93A6" />
              <div className="activity-text">
                <b>{l.name}</b> — status {LEAD_STATUS_META[l.status]?.label || l.status}
              </div>
              <span className="activity-time">{(l.updated_at || "").slice(0, 10)}</span>
            </div>
          ))}
          {recentlyUpdated.length === 0 && <span className="muted-note">No leads yet.</span>}
        </div>
      </div>
    </div>
  );
}
