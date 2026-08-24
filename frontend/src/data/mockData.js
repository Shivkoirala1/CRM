/* =========================================================================
   Mock / seed data for the Prasad Info Tech CRM frontend.

   This module stands in for API responses until the Express + MongoDB
   backend is wired up (see src/services/api.js for the placeholder calls
   that will eventually replace these arrays).
   ========================================================================= */

export const USERS = [
  { id: "u1", name: "Sanika Prasad", role: "Admin/CEO", initials: "SP", color: "#C8862A" },
  { id: "u2", name: "Kaushal Rane", role: "Manager", initials: "KR", color: "#0F9E8F" },
  { id: "u3", name: "Aditi Deshmukh", role: "Manager", initials: "AD", color: "#4C6FEF" },
  { id: "u4", name: "Omkar Bhosale", role: "General Staff", initials: "OB", color: "#DC4C42" },
  { id: "u5", name: "Priya Kulkarni", role: "General Staff", initials: "PK", color: "#8B5CF6" },
  { id: "u6", name: "Rutuja Salvi", role: "Accountant", initials: "RS", color: "#1E9E64" },
];

export const ROLES = ["Admin/CEO", "Manager", "Accountant", "General Staff"];

export const SERVICES = ["Web Development", "Digital Marketing", "Software Development", "SEO", "Mobile App"];
export const LEAD_SOURCES = ["Facebook Ads", "Instagram Ads", "Website", "Referral", "Walk-in", "Other"];
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"];
export const PROJECT_STATUSES = ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];
export const TASK_STATUSES = ["Pending", "In Progress", "Completed", "Overdue"];
export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const PAYMENT_STATUSES = ["Paid", "Pending", "Partially Paid", "Overdue"];

export const INITIAL_LEADS = [
  { id: "LD-101", name: "Rohan Kadam", company: "Kadam Textiles", phone: "+91 98221 04567", email: "rohan@kadamtex.in", address: "Nashik, MH", service: "Web Development", budget: "₹1,50,000 – ₹2,50,000", source: "Website", status: "New", owner: "u4", notes: "Wants a new e-commerce storefront by Diwali.", createdAt: "2026-08-18" },
  { id: "LD-102", name: "Meera Joshi", company: "Joshi Diagnostics", phone: "+91 90212 33410", email: "meera@joshidiag.com", address: "Pune, MH", service: "Digital Marketing", budget: "₹40,000 / mo", source: "Referral", status: "Contacted", owner: "u2", notes: "Referred by Client CL-004. Needs local SEO + Google Ads.", createdAt: "2026-08-14" },
  { id: "LD-103", name: "Farhan Sheikh", company: "Sheikh Logistics", phone: "+91 89561 77821", email: "farhan@sheikhlog.in", address: "Aurangabad, MH", service: "Software Development", budget: "₹6,00,000+", source: "Facebook Ads", status: "Qualified", owner: "u3", notes: "Fleet tracking system, decision expected next week.", createdAt: "2026-08-10" },
  { id: "LD-104", name: "Neha Pawar", company: "Pawar Realty", phone: "+91 97659 12233", email: "neha@pawarrealty.com", address: "Nashik, MH", service: "Website + SEO", budget: "₹80,000", source: "Instagram Ads", status: "Contacted", owner: "u4", notes: "Wants listing portal with map search.", createdAt: "2026-08-09" },
  { id: "LD-105", name: "Vikram Solanki", company: "Solanki Auto Parts", phone: "+91 88886 45120", email: "vikram@solankiauto.in", address: "Nashik, MH", service: "Mobile App", budget: "₹3,00,000", source: "Walk-in", status: "New", owner: "u5", notes: "Dealer-facing inventory app, walked in Monday.", createdAt: "2026-08-17" },
  { id: "LD-106", name: "Ishita Rao", company: "Rao & Co. CA Firm", phone: "+91 99225 66710", email: "ishita@raoca.com", address: "Pune, MH", service: "Digital Marketing", budget: "₹25,000 / mo", source: "Other", status: "Lost", owner: "u2", notes: "Went with an in-house resource. Revisit in 6 months.", createdAt: "2026-07-30" },
  { id: "LD-107", name: "Devendra Naik", company: "Naik Constructions", phone: "+91 91234 87650", email: "devendra@naikcons.in", address: "Nashik, MH", service: "Web Development", budget: "₹1,00,000", source: "Referral", status: "Qualified", owner: "u3", notes: "Portfolio site + lead-capture forms.", createdAt: "2026-08-05" },
  { id: "LD-108", name: "Zoya Ahmed", company: "Ahmed Boutique", phone: "+91 90045 11298", email: "zoya@ahmedboutique.in", address: "Nashik, MH", service: "Software Development", budget: "₹1,80,000", source: "Website", status: "New", owner: "u5", notes: "Custom billing + inventory for two store branches.", createdAt: "2026-08-19" },
];

export const INITIAL_CLIENTS = [
  { id: "CL-001", name: "Anand Deshpande", company: "Deshpande Textiles Pvt. Ltd.", phone: "+91 98220 55123", email: "anand@deshpandetex.com", address: "MIDC, Nashik", services: ["Web Development", "SEO"], projects: ["PR-201"], invoices: ["INV-3001", "INV-3006"], paymentStatus: "Paid", renewalDate: "2027-02-10", notes: "Long-standing client since 2023. Annual SEO retainer." },
  { id: "CL-002", name: "Sunita Kale", company: "Kale Hospital Group", phone: "+91 97663 20981", email: "sunita@kalehospital.in", address: "College Road, Nashik", services: ["Software Development"], projects: ["PR-202"], invoices: ["INV-3002"], paymentStatus: "Partially Paid", renewalDate: "2026-11-05", notes: "Patient management system, phase 2 pending." },
  { id: "CL-003", name: "Rajesh Bhalerao", company: "Bhalerao Motors", phone: "+91 90112 43987", email: "rajesh@bhaleraomotors.com", address: "Gangapur Road, Nashik", services: ["Digital Marketing"], projects: [], invoices: ["INV-3003", "INV-3007"], paymentStatus: "Overdue", renewalDate: "2026-09-01", notes: "Monthly ad-spend retainer, invoice 3007 is 12 days overdue." },
  { id: "CL-004", name: "Pooja Wagh", company: "Wagh Diagnostics", phone: "+91 89757 66201", email: "pooja@waghdiag.com", address: "Panchavati, Nashik", services: ["Web Development", "Digital Marketing"], projects: ["PR-203"], invoices: ["INV-3004"], paymentStatus: "Paid", renewalDate: "2027-01-20", notes: "Referred Meera Joshi (LD-102)." },
  { id: "CL-005", name: "Nikhil Gaikwad", company: "Gaikwad Builders", phone: "+91 90876 12340", email: "nikhil@gaikwadbuilders.in", address: "Indira Nagar, Nashik", services: ["Web Development"], projects: ["PR-204"], invoices: ["INV-3005"], paymentStatus: "Pending", renewalDate: "2026-12-15", notes: "Site nearing launch, awaiting final content." },
  { id: "CL-006", name: "Shraddha More", company: "More Fashion House", phone: "+91 91582 30456", email: "shraddha@morefashion.in", address: "College Road, Nashik", services: ["Mobile App", "Digital Marketing"], projects: ["PR-205"], invoices: [], paymentStatus: "Paid", renewalDate: "2027-03-08", notes: "New retainer signed this quarter." },
];

export const INITIAL_PROJECTS = [
  { id: "PR-201", name: "Deshpande Textiles — Storefront Revamp", client: "CL-001", service: "Web Development", description: "Rebuild storefront on a headless stack with catalogue sync.", scope: "Design, build, migrate 400+ SKUs, SEO handover.", start: "2026-06-01", deadline: "2026-09-15", status: "In Progress", team: ["u4", "u5"] },
  { id: "PR-202", name: "Kale Hospital — Patient Management System", client: "CL-002", service: "Software Development", description: "OPD queueing, records and billing module, phase 2.", scope: "Appointment engine, EHR module, billing integration.", start: "2026-05-10", deadline: "2026-10-30", status: "In Progress", team: ["u3", "u4"] },
  { id: "PR-203", name: "Wagh Diagnostics — Site + Campaign Launch", client: "CL-004", service: "Web Development", description: "New site plus paid-search launch bundle.", scope: "8-page site, GA4 setup, 2-month campaign management.", start: "2026-07-01", deadline: "2026-08-25", status: "On Hold", team: ["u2", "u5"] },
  { id: "PR-204", name: "Gaikwad Builders — Project Showcase Site", client: "CL-005", service: "Web Development", description: "Marketing site for three ongoing residential projects.", scope: "12-page site, 3D gallery, enquiry CRM hook-in.", start: "2026-06-20", deadline: "2026-08-30", status: "In Progress", team: ["u5"] },
  { id: "PR-205", name: "More Fashion — Loyalty App", client: "CL-006", service: "Mobile App", description: "Customer loyalty and order-tracking app.", scope: "iOS + Android, points engine, push notifications.", start: "2026-08-01", deadline: "2026-12-01", status: "Not Started", team: ["u3", "u4", "u5"] },
  { id: "PR-206", name: "Deshpande Textiles — Annual SEO Retainer", client: "CL-001", service: "SEO", description: "Ongoing technical + content SEO retainer.", scope: "Monthly audits, content calendar, backlink outreach.", start: "2026-01-01", deadline: "2026-12-31", status: "Completed", team: ["u2"] },
];

export const INITIAL_TASKS = [
  { id: "TK-301", title: "Send proposal to Farhan Sheikh (LD-103)", type: "Lead", ref: "LD-103", assignee: "u3", due: "2026-08-22", priority: "High", status: "Pending", recurring: false },
  { id: "TK-302", title: "Follow up on overdue invoice INV-3007", type: "Client", ref: "CL-003", assignee: "u2", due: "2026-08-21", priority: "Urgent", status: "Overdue", recurring: false },
  { id: "TK-303", title: "Content review — Wagh Diagnostics site copy", type: "Project", ref: "PR-203", assignee: "u5", due: "2026-08-25", priority: "Medium", status: "In Progress", recurring: false },
  { id: "TK-304", title: "Monthly SEO report — Deshpande Textiles", type: "Project", ref: "PR-206", assignee: "u2", due: "2026-08-31", priority: "Medium", status: "Pending", recurring: true },
  { id: "TK-305", title: "Call Neha Pawar to confirm requirements (LD-104)", type: "Lead", ref: "LD-104", assignee: "u4", due: "2026-08-23", priority: "Medium", status: "Pending", recurring: false },
  { id: "TK-306", title: "QA pass — Gaikwad Builders gallery module", type: "Project", ref: "PR-204", assignee: "u5", due: "2026-08-24", priority: "High", status: "In Progress", recurring: false },
  { id: "TK-307", title: "Kick-off call — More Fashion loyalty app", type: "Project", ref: "PR-205", assignee: "u3", due: "2026-08-26", priority: "High", status: "Pending", recurring: false },
  { id: "TK-308", title: "Renew hosting — Kale Hospital", type: "Client", ref: "CL-002", assignee: "u4", due: "2026-08-20", priority: "Urgent", status: "Overdue", recurring: false },
  { id: "TK-309", title: "Weekly stand-up notes to Sanika", type: "Internal", ref: "—", assignee: "u2", due: "2026-08-22", priority: "Low", status: "Pending", recurring: true },
  { id: "TK-310", title: "Design sign-off — Zoya Ahmed billing UI (LD-108)", type: "Lead", ref: "LD-108", assignee: "u5", due: "2026-08-28", priority: "Low", status: "Completed", recurring: false },
];

export const INITIAL_INVOICES = [
  { id: "INV-3001", client: "CL-001", items: "Storefront Revamp — Milestone 2", amount: 185000, issue: "2026-07-20", due: "2026-08-05", status: "Paid" },
  { id: "INV-3002", client: "CL-002", items: "PMS Phase 2 — Advance", amount: 250000, issue: "2026-08-01", due: "2026-08-20", status: "Partially Paid" },
  { id: "INV-3003", client: "CL-003", items: "Ad spend management — August", amount: 42000, issue: "2026-08-01", due: "2026-08-10", status: "Overdue" },
  { id: "INV-3004", client: "CL-004", items: "Site launch + campaign setup", amount: 96000, issue: "2026-08-05", due: "2026-08-25", status: "Paid" },
  { id: "INV-3005", client: "CL-005", items: "Showcase site — Final milestone", amount: 60000, issue: "2026-08-15", due: "2026-08-30", status: "Pending" },
  { id: "INV-3006", client: "CL-001", items: "Annual SEO retainer — Q3", amount: 75000, issue: "2026-07-01", due: "2026-07-15", status: "Paid" },
  { id: "INV-3007", client: "CL-003", items: "Ad spend management — July", amount: 42000, issue: "2026-07-01", due: "2026-07-10", status: "Overdue" },
];

export const NOTIFICATIONS = [
  { id: "n1", icon: "lead", text: "New lead assigned: Zoya Ahmed (LD-108)", time: "10 min ago", unread: true },
  { id: "n2", icon: "overdue", text: "Invoice INV-3007 is overdue by 42 days", time: "1 hr ago", unread: true },
  { id: "n3", icon: "task", text: "Task \"Renew hosting — Kale Hospital\" is overdue", time: "2 hr ago", unread: true },
  { id: "n4", icon: "renewal", text: "Bhalerao Motors renewal due in 11 days", time: "Yesterday", unread: false },
  { id: "n5", icon: "project", text: "Project status changed: PR-206 marked Completed", time: "Yesterday", unread: false },
  { id: "n6", icon: "payment", text: "Payment received for INV-3004 — ₹96,000", time: "2 days ago", unread: false },
];

export const ACTIVITY = [
  { id: "a1", user: "u2", action: "moved lead LD-103 to Qualified", time: "2026-08-20 4:12 PM" },
  { id: "a2", user: "u4", action: "created task TK-310 for LD-108", time: "2026-08-20 2:40 PM" },
  { id: "a3", user: "u3", action: "updated project PR-205 status to Not Started", time: "2026-08-20 11:05 AM" },
  { id: "a4", user: "u1", action: "granted Manager access to Aditi Deshmukh", time: "2026-08-19 6:20 PM" },
  { id: "a5", user: "u5", action: "uploaded 3 files to project PR-204", time: "2026-08-19 3:15 PM" },
  { id: "a6", user: "u2", action: "recorded partial payment on INV-3002", time: "2026-08-19 1:02 PM" },
  { id: "a7", user: "u4", action: "archived lead LD-096 (duplicate)", time: "2026-08-18 5:40 PM" },
  { id: "a8", user: "u1", action: "exported monthly revenue report (PDF)", time: "2026-08-18 9:30 AM" },
];

export const REVENUE_BY_SERVICE = [
  { name: "Web Dev", value: 341000 },
  { name: "Software", value: 250000 },
  { name: "Digital Mktg", value: 84000 },
  { name: "SEO", value: 75000 },
  { name: "Mobile App", value: 0 },
];

export const LEADS_TREND = [
  { month: "Mar", leads: 14 }, { month: "Apr", leads: 18 }, { month: "May", leads: 16 },
  { month: "Jun", leads: 22 }, { month: "Jul", leads: 19 }, { month: "Aug", leads: 25 },
];

export const SOURCE_SPLIT = [
  { name: "Website", value: 32, color: "#C8862A" },
  { name: "Referral", value: 24, color: "#0F9E8F" },
  { name: "Facebook Ads", value: 18, color: "#4C6FEF" },
  { name: "Instagram Ads", value: 14, color: "#8B5CF6" },
  { name: "Walk-in", value: 8, color: "#DC4C42" },
  { name: "Other", value: 4, color: "#8A93A6" },
];

/*
 * Role → section access matrix.
 *
 * - General Staff never gets "clients" or "invoices": those screens carry
 *   client contact, payment and billing detail, which is deliberately kept
 *   out of the staff console entirely (nav, routes, and search results).
 * - Accountant gets a narrow, finance-shaped slice: Dashboard, Clients
 *   (for billing contacts) and Invoices — no Leads/Projects/Tasks, which
 *   aren't part of the accounting workflow.
 */
export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", roles: ["Admin/CEO", "Manager", "General Staff", "Accountant"] },
  { key: "leads", label: "Leads", roles: ["Admin/CEO", "Manager", "General Staff"] },
  { key: "clients", label: "Clients", roles: ["Admin/CEO", "Manager", "Accountant"] },
  { key: "projects", label: "Projects", roles: ["Admin/CEO", "Manager", "General Staff"] },
  { key: "tasks", label: "Tasks", roles: ["Admin/CEO", "Manager", "General Staff"] },
  { key: "invoices", label: "Invoices", roles: ["Admin/CEO", "Manager", "Accountant"] },
  { key: "audit", label: "Activity log", roles: ["Admin/CEO"] },
  { key: "users", label: "User access", roles: ["Admin/CEO"] },
];

export const STATUS_STYLES = {
  // leads
  New: { bg: "#E8EDFF", fg: "#4C6FEF" },
  Contacted: { bg: "#FCEFD9", fg: "#C8862A" },
  Qualified: { bg: "#DFF7F1", fg: "#0F9E8F" },
  Lost: { bg: "#FCE7E5", fg: "#DC4C42" },
  // projects
  "Not Started": { bg: "#EEF1F6", fg: "#64748B" },
  "In Progress": { bg: "#E8EDFF", fg: "#4C6FEF" },
  "On Hold": { bg: "#FCEFD9", fg: "#C8862A" },
  Completed: { bg: "#DFF7F1", fg: "#0F9E8F" },
  Cancelled: { bg: "#FCE7E5", fg: "#DC4C42" },
  // tasks
  Pending: { bg: "#EEF1F6", fg: "#64748B" },
  Overdue: { bg: "#FCE7E5", fg: "#DC4C42" },
  // payments
  Paid: { bg: "#DFF7F1", fg: "#0F9E8F" },
  "Partially Paid": { bg: "#FCEFD9", fg: "#C8862A" },
  Active: { bg: "#DFF7F1", fg: "#0F9E8F" },
};

export const PRIORITY_STYLES = {
  Low: { bg: "#EEF1F6", fg: "#64748B" },
  Medium: { bg: "#E8EDFF", fg: "#4C6FEF" },
  High: { bg: "#FCEFD9", fg: "#C8862A" },
  Urgent: { bg: "#FCE7E5", fg: "#DC4C42" },
};

export const userById = (users, id) => users.find((u) => u.id === id);
export const clientById = (clients, id) => clients.find((c) => c.id === id);
export const inr = (n) => "₹" + n.toLocaleString("en-IN");
