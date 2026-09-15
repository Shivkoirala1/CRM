import { History } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";

// The backend has no audit-log model or endpoint yet (only leads, clients,
// projects, tasks, invoices, and dashboard aggregates are exposed). This
// page is kept in the nav for Admins so it's ready to wire up once that
// exists, rather than showing fabricated activity as if it were real.
export default function AuditView() {
  return (
    <div>
      <SectionHeader eyebrow="Audit & security" title="Activity log" />
      <div className="table-card" style={{ padding: "8px 0" }}>
        <EmptyState
          icon={History}
          text="The backend doesn't expose an activity/audit trail yet — this page will populate once that endpoint exists."
        />
      </div>
    </div>
  );
}
