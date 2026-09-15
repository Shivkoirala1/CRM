import { LEAD_SOURCE_META } from "../data/choices";

/** Percentage split of lead sources, optionally scoped to a single lead status code. */
export function computeSourceSplit(leads, statusFilter) {
  const pool = leads.filter((l) => statusFilter === "All" || l.status === statusFilter);
  const counts = {};
  pool.forEach((l) => {
    counts[l.lead_source] = (counts[l.lead_source] || 0) + 1;
  });
  const total = pool.length || 1;
  return Object.entries(counts)
    .map(([code, count]) => ({
      code,
      name: LEAD_SOURCE_META[code]?.label || code,
      value: Math.round((count / total) * 100),
      color: LEAD_SOURCE_META[code]?.color || "#8A93A6",
    }))
    .sort((a, b) => b.value - a.value);
}

/** Count of leads per status code — used for the "leads received" breakdown chart. */
export function computeStatusBreakdown(leads) {
  const order = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
  const counts = {};
  leads.forEach((l) => {
    counts[l.status] = (counts[l.status] || 0) + 1;
  });
  return order.map((code) => ({ code, count: counts[code] || 0 }));
}
