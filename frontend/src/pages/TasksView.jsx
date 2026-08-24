import { useState } from "react";
import { ListChecks, User, Circle, PauseCircle, CheckCircle2, AlertCircle } from "lucide-react";
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

function NewTaskModal({ onClose, onCreate }) {
  const { users } = useData();
  const assignableUsers = users.filter((u) => u.role !== "Accountant");
  const [form, setForm] = useState({ title: "", type: "Lead", ref: "", assignee: "u4", due: "", priority: "Medium", recurring: false });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal
      title="Create task"
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.title} onClick={() => onCreate(form)}>Create task</button></>}
    >
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
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [mineOnly, setMineOnly] = useState(false);

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

  const cycleStatus = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const order = ["Pending", "In Progress", "Completed"];
    const idx = order.indexOf(task.status);
    const next = idx === -1 ? "Pending" : order[(idx + 1) % order.length];
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: next } : t)));
    api.updateTaskStatus(id, next);
  };

  const handleCreate = async (form) => {
    const created = await api.createTask(form);
    setTasks([created, ...tasks]);
    setShowNew(false);
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
          <thead><tr><th></th><th>Task</th><th>Linked to</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((t) => {
              const StatusIcon = TASK_STATUS_ICON[t.status] || Circle;
              return (
                <tr key={t.id}>
                  <td>
                    <button className="check-btn" onClick={() => cycleStatus(t.id)}>
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
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState icon={ListChecks} text="No tasks match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
