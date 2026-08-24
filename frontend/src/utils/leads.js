export const SOURCE_COLORS = {
  "Facebook Ads": "#4C6FEF",
  "Instagram Ads": "#8B5CF6",
  Website: "#C8862A",
  Referral: "#0F9E8F",
  "Walk-in": "#DC4C42",
  Other: "#8A93A6",
};

/** Percentage split of lead sources, optionally scoped to a single lead status. */
export function computeSourceSplit(leads, statusFilter) {
  const pool = leads.filter((l) => statusFilter === "All" || l.status === statusFilter);
  const counts = {};
  pool.forEach((l) => {
    counts[l.source] = (counts[l.source] || 0) + 1;
  });
  const total = pool.length || 1;
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: SOURCE_COLORS[name] || "#8A93A6",
    }))
    .sort((a, b) => b.value - a.value);
}
