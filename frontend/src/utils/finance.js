/* =========================================================================
   Finance helpers shared by the Admin and Accountant dashboards.

   These recompute derived figures (revenue by service, ageing, etc.) from
   the live invoices/clients collections in DataContext rather than a
   static mock aggregate, so the period/service filters on each dashboard
   actually change what's shown instead of being decorative.
   ========================================================================= */

export const REVENUE_PERIOD_OPTIONS = ["This month", "This quarter", "This year", "All time"];

// Mock "today" — keeps ageing/period math stable against the seed data,
// which is dated around August 2026.
export const REFERENCE_DATE = "2026-08-21";

function periodCutoff(period) {
  const cutoff = new Date(REFERENCE_DATE);
  if (period === "This month") cutoff.setMonth(cutoff.getMonth() - 1);
  else if (period === "This quarter") cutoff.setMonth(cutoff.getMonth() - 3);
  else if (period === "This year") cutoff.setFullYear(cutoff.getFullYear() - 1);
  else return null; // "All time"
  return cutoff;
}

/** Sum invoice amounts issued within `period`, bucketed by the client's primary service. */
export function computeRevenueByService(invoices, clients, period) {
  const cutoff = periodCutoff(period);
  const buckets = {};
  invoices.forEach((inv) => {
    if (cutoff && new Date(inv.issue) < cutoff) return;
    const client = clients.find((c) => c.id === inv.client);
    const service = client?.services?.[0] || "Other";
    buckets[service] = (buckets[service] || 0) + inv.amount;
  });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

/** Amount-weighted breakdown of invoices by payment status, filtered by client service. */
export function computePaymentStatusSplit(invoices, clients, serviceFilter) {
  const pool = invoices.filter((inv) => {
    if (serviceFilter === "All") return true;
    const client = clients.find((c) => c.id === inv.client);
    return client?.services?.includes(serviceFilter);
  });
  const buckets = {};
  pool.forEach((inv) => {
    buckets[inv.status] = (buckets[inv.status] || 0) + inv.amount;
  });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

export function daysBetween(dateStr, referenceStr = REFERENCE_DATE) {
  const a = new Date(referenceStr);
  const b = new Date(dateStr);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export const inRange = (dateStr, from, to) =>
  (!from || dateStr >= from) && (!to || dateStr <= to);
