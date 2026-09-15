/* =========================================================================
   Choice/enum metadata mirroring the Django backend's TextChoices exactly.

   The API returns and expects the CODE (left column below), never the
   label — e.g. a lead's status comes back as "NEW", not "New". Every
   value here is copied from the backend model definitions:
     accounts/models.py (Role), leads/models.py (LeadSource, LeadStatus),
     clients/models.py (PaymentStatus), projects/models.py (ProjectStatus),
     tasks/models.py (Priority, Status).
   If the backend adds/renames a choice, update it here to match — this
   file is the single place the frontend encodes that contract.
   ========================================================================= */

export const ROLE_META = {
  ADMIN: { label: "Admin/CEO" },
  MANAGER: { label: "Manager" },
  STAFF: { label: "General Staff" },
};

export const LEAD_SOURCE_META = {
  FACEBOOK_ADS: { label: "Facebook Ads", color: "#4C6FEF" },
  INSTAGRAM_ADS: { label: "Instagram Ads", color: "#8B5CF6" },
  WEBSITE: { label: "Website", color: "#C8862A" },
  REFERRAL: { label: "Referral", color: "#0F9E8F" },
  WALK_IN: { label: "Walk-in", color: "#DC4C42" },
  OTHER: { label: "Other", color: "#8A93A6" },
};

export const LEAD_STATUS_META = {
  NEW: { label: "New", bg: "#E8EDFF", fg: "#4C6FEF" },
  CONTACTED: { label: "Contacted", bg: "#FCEFD9", fg: "#C8862A" },
  QUALIFIED: { label: "Qualified", bg: "#DFF7F1", fg: "#0F9E8F" },
  CONVERTED: { label: "Converted", bg: "#E6F4FF", fg: "#0EA5E9" },
  LOST: { label: "Lost", bg: "#FCE7E5", fg: "#DC4C42" },
};

export const PAYMENT_STATUS_META = {
  PAID: { label: "Paid", bg: "#DFF7F1", fg: "#0F9E8F" },
  PENDING: { label: "Pending", bg: "#EEF1F6", fg: "#64748B" },
  PARTIALLY_PAID: { label: "Partially Paid", bg: "#FCEFD9", fg: "#C8862A" },
  OVERDUE: { label: "Overdue", bg: "#FCE7E5", fg: "#DC4C42" },
};

export const PROJECT_STATUS_META = {
  NOT_STARTED: { label: "Not Started", bg: "#EEF1F6", fg: "#64748B" },
  IN_PROGRESS: { label: "In Progress", bg: "#E8EDFF", fg: "#4C6FEF" },
  ON_HOLD: { label: "On Hold", bg: "#FCEFD9", fg: "#C8862A" },
  COMPLETED: { label: "Completed", bg: "#DFF7F1", fg: "#0F9E8F" },
  CANCELLED: { label: "Cancelled", bg: "#FCE7E5", fg: "#DC4C42" },
};

export const TASK_STATUS_META = {
  PENDING: { label: "Pending", bg: "#EEF1F6", fg: "#64748B" },
  IN_PROGRESS: { label: "In Progress", bg: "#E8EDFF", fg: "#4C6FEF" },
  COMPLETED: { label: "Completed", bg: "#DFF7F1", fg: "#0F9E8F" },
  OVERDUE: { label: "Overdue", bg: "#FCE7E5", fg: "#DC4C42" },
};

export const TASK_PRIORITY_META = {
  LOW: { label: "Low", bg: "#EEF1F6", fg: "#64748B" },
  MEDIUM: { label: "Medium", bg: "#E8EDFF", fg: "#4C6FEF" },
  HIGH: { label: "High", bg: "#FCEFD9", fg: "#C8862A" },
  URGENT: { label: "Urgent", bg: "#FCE7E5", fg: "#DC4C42" },
};

// "service" is a free-text CharField on the backend (Lead.service_interested_in,
// Project.service) — not an enum. These are just <datalist> suggestions so
// existing entries stay consistent; the field never rejects a custom value.
export const SERVICE_SUGGESTIONS = ["Web Development", "Digital Marketing", "Software Development", "SEO", "Mobile App"];

export const metaOptions = (meta) => Object.entries(meta).map(([value, m]) => ({ value, label: m.label }));
export const labelOf = (meta, code) => meta?.[code]?.label || code || "—";
