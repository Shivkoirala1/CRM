import { TrendingUp } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, delta, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <Icon size={16} color={accent || "#64748B"} />
      </div>
      <div className="stat-value">{value}</div>
      {delta && (
        <div className="stat-delta" style={{ color: delta.startsWith("-") ? "#DC4C42" : "#0F9E8F" }}>
          <TrendingUp size={12} style={{ marginRight: 4, transform: delta.startsWith("-") ? "scaleY(-1)" : "none" }} />
          {delta}
        </div>
      )}
    </div>
  );
}
