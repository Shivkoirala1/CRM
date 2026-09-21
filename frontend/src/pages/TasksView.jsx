import { useState } from "react";
import { ListChecks, User, Circle, PauseCircle, CheckCircle2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Pill from "../components/common/Pill";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { TASK_PRIORITIES, TASK_STATUSES, PRIORITY_STYLES } from "../data/mockData";
import * as api from "../services/api";

function TaskFormModal({ title, submitLabel, initial, showStatus, onClose, onSubmit }) {
  const { users } = useData();
  const assignableUsers = users.filter((u) => u.role !== "Accountant");
  const [form, setForm] = useState({
    title: "", type: "Lead", ref: "", assignee: assignableUsers[0]?.id || "",
    due: "", priority: "Medium", recurring: false, status: "Pending",
    ...initial,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Task title is required."); return; }
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const message = backendErrors
        ? Object.values(backendErrors).flat().join(" ")
        : "Couldn't save the task. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.title.trim() || saving} onClick={handleSubmit}>{saving ? "Saving…" : submitLabel}</button></>}
    >
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <Field label="Task title"><input value={form.title} onChange={set("title")} /></Field>
        <Field label="Associated with">
          <select value={form.type} onChange={set("type")}>{["Lead", "Client", "Project", "Internal"].map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Assignee">
          <select value={form.assignee} onChange={set("assignee")}>{assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        </Field>
        <Field label="Due date"><input type="date" value={form.due} onChange={set("due")} /></Field>
        <Field label="Priority">
          <select value={form.priority} onChange={set("priority")}>{TASK_PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        {showStatus && (
          <Field label="Status">
            <select value={form.status} onChange={set("status")}>{TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        )}
        <Field label="Recurring">
          <select value={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.value === "true" })}>
            <option value="false">One-time</option>
            <option value="true">Recurring</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

const TASK_STATUS_ICON = { Pending: Circle, "In Progress": PauseCircle, Completed: CheckCircle2, Overdue: AlertCircle };

export default function TasksView({ currentUser }) {
  const { tasks, users, setTasks } = useData();
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [mineOnly, setMineOnly] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const assignableUsers = users.filter((u) => u.role !== "Accountant");

  const filtered = tasks.filter((t) => {
    const q = query.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q);
    const matchP = priorityFilter === "All" || t.priority === priorityFilter;
    const matchS = statusFilter === "All" || t.status === statusFilter;
    const matchMine = mineOnly
      ? t.assignee === currentUser.id
      : assigneeFilter === "All" || t.assignee === assigneeFilter;
    return matchQ && matchP && matchS && matchMine;
  });

  // Previously this updated local state optimistically without waiting for
  // (or checking) the API call, so a failed/expired-token request would
  // silently revert on the next refresh with no error shown. Now it waits
  // for the real response and only commits on success.
  const cycleStatus = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const order = ["Pending", "In Progress", "Completed"];
    const idx = order.indexOf(task.status);
    const next = idx === -1 ? "Pending" : order[(idx + 1) % order.length];
    setBusyId(id);
    try {
      const updated = await api.updateTaskStatus(id, next);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } catch {
      window.alert("Couldn't update the task status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (form) => {
    const created = await api.createTask(form);
    setTasks([created, ...tasks]);
    setShowNew(false);
  };

  const handleUpdate = async (form) => {
    const updated = await api.updateTask(editing.id, form);
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    setEditing(null);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteTask(task.id);
      setTasks(tasks.filter((t) => t.id !== task.id));
    } catch {
      window.alert("Couldn't delete this task. Please try again.");
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
              {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All priorities</option>
              {TASK_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select
              className="filter-select"
              value={assigneeFilter}
              disabled={mineOnly}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="All">All assignees</option>
              {assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
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
          <thead><tr><th></th><th>Task</th><th>Linked to</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((t) => {
              const StatusIcon = TASK_STATUS_ICON[t.status] || Circle;
              return (
                <tr key={t.id}>
                  <td>
                    <button className="check-btn" disabled={busyId === t.id} onClick={() => cycleStatus(t.id)}>
                      <StatusIcon size={16} color={t.status === "Completed" ? "#0F9E8F" : t.status === "Overdue" ? "#DC4C42" : "#8A93A6"} />
                    </button>
                  </td>
                  <td>
                    <div className={"cell-strong" + (t.status === "Completed" ? " strikethrough" : "")}>{t.title}</div>
                    <div className="cell-id">{t.id}{t.recurring ? " · Recurring" : ""}</div>
                  </td>
                  <td><span className="tag-chip">{t.type} · {t.ref}</span></td>
                  <td><Avatar userId={t.assignee} size={24} /></td>
                  <td><Pill label={t.priority} styleMap={PRIORITY_STYLES} /></td>
                  <td className="mono-cell">{t.due}</td>
                  <td><Pill label={t.status} /></td>
                  <td>
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(t)}><Pencil size={14} /></button>
                    <button className="icon-btn" title="Delete" onClick={() => handleDelete(t)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8}><EmptyState icon={ListChecks} text="No tasks match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <TaskFormModal title="Create task" submitLabel="Create task" onClose={() => setShowNew(false)} onSubmit={handleCreate} />}
      {editing && (
        <TaskFormModal
          title="Edit task"
          submitLabel="Save changes"
          initial={editing}
          showStatus
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
