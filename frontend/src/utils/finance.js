/* =========================================================================
   Finance helpers for the Admin dashboard and Invoices view.

   The backend's own /api/dashboard/revenue/ endpoint returns a single
   fixed all-time "revenue by service" aggregate with no period filter,
   so any panel that needs a period selector recomputes from the live
   invoices + projects collections instead (real data, just sliced
   client-side) rather than pretending the backend supports a filter it
   doesn't.
   ========================================================================= */

export const REVENUE_PERIOD_OPTIONS = ["This month", "This quarter", "This year", "All time"];

function periodCutoff(period) {
  const cutoff = new Date();
  if (period === "This month") cutoff.setMonth(cutoff.getMonth() - 1);
  else if (period === "This quarter") cutoff.setMonth(cutoff.getMonth() - 3);
  else if (period === "This year") cutoff.setFullYear(cutoff.getFullYear() - 1);
  else return null; // "All time"
  return cutoff;
}

/**
 * Sum PAID invoice amounts issued within `period`, bucketed by the
 * linked project's service (invoices with no project are bucketed as
 * "Unassigned" — the backend allows a null project on an invoice).
 */
export function computeRevenueByService(invoices, projects, period) {
  const cutoff = periodCutoff(period);
  const buckets = {};
  invoices
    .filter((inv) => inv.payment_status === "PAID")
    .forEach((inv) => {
      if (cutoff && new Date(inv.issue_date) < cutoff) return;
      const project = projects.find((p) => p.id === inv.project);
      const service = project?.service || "Unassigned";
      buckets[service] = (buckets[service] || 0) + Number(inv.amount);
    });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

/** Amount-weighted breakdown of invoices by payment status. */
export function computePaymentStatusSplit(invoices) {
  const buckets = {};
  invoices.forEach((inv) => {
    buckets[inv.payment_status] = (buckets[inv.payment_status] || 0) + Number(inv.amount);
  });
  return Object.entries(buckets).map(([code, value]) => ({ code, value }));
}

export function daysBetween(dateStr, reference = new Date()) {
  const a = reference instanceof Date ? reference : new Date(reference);
  const b = new Date(dateStr);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export const inRange = (dateStr, from, to) => (!from || dateStr >= from) && (!to || dateStr <= to);
