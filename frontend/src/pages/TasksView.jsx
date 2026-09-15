import { useState } from "react";
import { User, Circle, PauseCircle, CheckCircle2, AlertCircle } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { TASK_PRIORITY_META, TASK_STATUS_META, metaOptions } from "../data/choices";
import * as api from "../services/api";

const TASK_PRIORITY_OPTIONS = metaOptions(TASK_PRIORITY_META);
const TASK_STATUS_OPTIONS = metaOptions(TASK_STATUS_META);
const TASK_STATUS_ICON = { PENDING: Circle, IN_PROGRESS: PauseCircle, COMPLETED: CheckCircle2, OVERDUE: AlertCircle };
const LINK_TYPES = [
  { value: "none", label: "Nothing (internal)" },
  { value: "lead", label: "A lead" },
  { value: "client", label: "A client" },
  { value: "project", label: "A project" },
];

function NewTaskModal({ onClose, onCreate }) {
  const { users, leads, clients, projects } = useData();
  const [linkType, setLinkType] = useState("none");
  const [linkId, setLinkId] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", assigned_to: "", due_date: "",
    priority: "MEDIUM", is_recurring: false, recurrence_pattern: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const linkOptions = linkType === "lead" ? leads : linkType === "client" ? clients : linkType === "project" ? projects : [];
  const linkLabel = (item) =>
    linkType === "lead" ? item.name : linkType === "client" ? (item.company_name || item.name) : item.name;

  const submit = async () => {
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      assigned_to: form.assigned_to || null,
      lead: linkType === "lead" && linkId ? Number(linkId) : null,
      client: linkType === "client" && linkId ? Number(linkId) : null,
      project: linkType === "project" && linkId ? Number(linkId) : null,
    };
    try {
      await onCreate(payload);
    } catch (err) {
      setError(api.getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create task"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.title || saving} onClick={submit}>
            {saving ? "Creating…" : "Create task"}
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}
      <div className="form-grid">
        <Field label="Task title"><input value={form.title} onChange={set("title")} /></Field>
        <Field label="Assignee">
          <select value={form.assigned_to} onChange={set("assigned_to")}>
            <option value="">Unassigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </Field>
        <Field label="Link to">
          <select value={linkType} onChange={(e) => { setLinkType(e.target.value); setLinkId(""); }}>
            {LINK_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        {linkType !== "none" && (
          <Field label={`Which ${linkType}`}>
            <select value={linkId} onChange={(e) => setLinkId(e.target.value)}>
              <option value="">Select…</option>
              {linkOptions.map((item) => <option key={item.id} value={item.id}>{linkLabel(item)}</option>)}
            </select>
          </Field>
        )}
        <Field label="Due date"><input type="date" value={form.due_date} onChange={set("due_date")} /></Field>
        <Field label="Priority">
          <select value={form.priority} onChange={set("priority")}>
            {TASK_PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Recurring">
          <select value={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.value === "true" })}>
            <option value="false">One-time</option>
            <option value="true">Recurring</option>
          </select>
        </Field>
        {form.is_recurring && (
          <Field label="Recurrence"><input value={form.recurrence_pattern} onChange={set("recurrence_pattern")} placeholder="e.g. weekly" /></Field>
        )}
      </div>
      <Field label="Description"><textarea rows={2} value={form.description} onChange={set("description")} /></Field>
    </Modal>
  );
}

export default function TasksView({ currentUser }) {
  const { tasks, setTasks, users } = useData();
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [mineOnly, setMineOnly] = useState(false);

  const filtered = tasks.filter((t) => {
    const q = query.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q);
    const matchP = priorityFilter === "All" || t.priority === priorityFilter;
    const matchS = statusFilter === "All" || t.status === statusFilter;
    const matchMine = mineOnly
      ? t.assigned_to === currentUser.id
      : assigneeFilter === "All" || String(t.assigned_to) === assigneeFilter;
    return matchQ && matchP && matchS && matchMine;
  });

  const linkedLabel = (t) => {
    if (t.lead) return { type: "Lead", name: t.lead_name };
    if (t.client) return { type: "Client", name: t.client_name };
    if (t.project) return { type: "Project", name: t.project_name };
    return { type: "Internal", name: "—" };
  };

  const handleCreate = async (payload) => {
    const created = await api.createTask(payload);
    setTasks([created, ...tasks]);
    setShowNew(false);
  };

  const cycleStatus = async (task) => {
    const order = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    const idx = order.indexOf(task.status);
    const next = idx === -1 ? "PENDING" : order[(idx + 1) % order.length];
    const prev = tasks;
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    try {
      await api.updateTask(task.id, { status: next });
    } catch {
      setTasks(prev);
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="Task & follow-up management" title="Tasks" action={<PrimaryButton onClick={() => setShowNew(true)}>New task</PrimaryButton>} />

      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search tasks…"
        filters={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {TASK_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All priorities</option>
              {TASK_PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="filter-select" value={assigneeFilter} disabled={mineOnly} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="All">All assignees</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <button className={"filter-toggle" + (mineOnly ? " active" : "")} onClick={() => setMineOnly(!mineOnly)}>
              <User size={13} /> My tasks
            </button>
          </>
        }
        right={<span className="muted-note">{filtered.length} of {tasks.length}</span>}
      />

      <div className="table-card">
        <table>
          <thead><tr><th></th><th>Task</th><th>Linked to</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((t) => {
              const StatusIcon = TASK_STATUS_ICON[t.status] || Circle;
              const link = linkedLabel(t);
              return (
                <tr key={t.id}>
                  <td>
                    <button className="check-btn" onClick={() => cycleStatus(t)}>
                      <StatusIcon size={16} color={t.status === "COMPLETED" ? "#0F9E8F" : t.status === "OVERDUE" ? "#DC4C42" : "#8A93A6"} />
                    </button>
                  </td>
                  <td>
                    <div className={"cell-strong" + (t.status === "COMPLETED" ? " strikethrough" : "")}>{t.title}</div>
                    <div className="cell-id">#{t.id}{t.is_recurring ? ` · Recurring${t.recurrence_pattern ? ` (${t.recurrence_pattern})` : ""}` : ""}</div>
                  </td>
                  <td><span className="tag-chip">{link.type} · {link.name}</span></td>
                  <td>{t.assigned_to ? <Avatar userId={t.assigned_to} size={24} /> : <span className="dim-text">—</span>}</td>
                  <td><Pill code={t.priority} meta={TASK_PRIORITY_META} /></td>
                  <td className="mono-cell">{t.due_date || "—"}</td>
                  <td><Pill code={t.status} meta={TASK_STATUS_META} /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState icon={AlertCircle} text="No tasks match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
