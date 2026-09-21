import { useState } from "react";
import { Briefcase, Clock, Pencil, Trash2, Users } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Avatar from "../components/common/Avatar";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { SERVICES, PROJECT_STATUSES } from "../data/mockData";
import * as api from "../services/api";

function ProjectFormModal({ title, submitLabel, initial, onClose, onSubmit }) {
  const { clients } = useData();
  const [form, setForm] = useState({
    name: "", client: clients[0]?.id || "", service: SERVICES[0],
    description: "", scope: "", start: "", deadline: "", status: "Not Started",
    ...initial,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (form.name.trim().length < 2) return "Project name must be at least 2 characters.";
    if (!form.client) return "Create a client first — a project must belong to a client.";
    if (form.start && form.deadline && form.deadline < form.start) return "Deadline cannot be before the start date.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const message = backendErrors
        ? Object.values(backendErrors).flat().join(" ")
        : "Couldn't save the project. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      width={560}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.name.trim() || saving} onClick={handleSubmit}>{saving ? "Saving…" : submitLabel}</button></>}
    >
      {error && <div className="form-error">{error}</div>}
      {clients.length === 0 && <div className="form-error">You need at least one client before creating a project.</div>}
      <div className="form-grid">
        <Field label="Project name *"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Client">
          <select value={form.client} onChange={set("client")}>{clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select>
        </Field>
        <Field label="Service">
          <select value={form.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set("status")}>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Start date"><input type="date" value={form.start} onChange={set("start")} /></Field>
        <Field label="Deadline"><input type="date" value={form.deadline} onChange={set("deadline")} /></Field>
      </div>
      <Field label="Description"><textarea rows={2} value={form.description} onChange={set("description")} /></Field>
      <Field label="Scope of work"><textarea rows={2} value={form.scope} onChange={set("scope")} /></Field>
    </Modal>
  );
}

function AssignTeamModal({ project, onClose, onSave }) {
  const { users } = useData();
  const assignableUsers = users.filter((u) => u.role !== "Accountant");
  const [selected, setSelected] = useState(project.team || []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    try {
      await onSave(selected);
    } catch (err) {
      const isForbidden = err.response?.status === 403;
      setError(isForbidden
        ? "Only a Manager or Admin can assign employees to a project."
        : "Couldn't update the team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Assign team — ${project.name}`}
      onClose={onClose}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={saving} onClick={handleSubmit}>{saving ? "Saving…" : "Save team"}</button></>}
    >
      {error && <div className="form-error">{error}</div>}
      <div className="checkbox-list">
        {assignableUsers.map((u) => (
          <label key={u.id} className="checkbox-row">
            <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
            <span>{u.name} <span className="dim-text">({u.role})</span></span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

export default function ProjectsView() {
  const { projects, users, setProjects } = useData();
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState(null);

  const grouped = PROJECT_STATUSES.map((status) => ({
    status,
    items: projects.filter((p) => {
      const matchStatus = p.status === status;
      const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
      const matchService = serviceFilter === "All" || p.service === serviceFilter;
      const matchTeam = teamFilter === "All" || p.team.includes(teamFilter);
      return matchStatus && matchQ && matchService && matchTeam;
    }),
  }));

  const handleCreate = async (form) => {
    const created = await api.createProject(form);
    setProjects([created, ...projects]);
    setShowNew(false);
  };

  const handleUpdate = async (form) => {
    const updated = await api.updateProject(editing.id, form);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  };

  const handleStatusChange = async (project, status) => {
    const updated = await api.updateProject(project.id, { ...project, status });
    setProjects(projects.map((p) => (p.id === project.id ? updated : p)));
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Archive project "${project.name}"?`)) return;
    try {
      await api.deleteProject(project.id);
      setProjects(projects.filter((p) => p.id !== project.id));
    } catch {
      window.alert("Couldn't archive this project. Please try again.");
    }
  };

  const handleAssignTeam = async (employeeIds) => {
    const updated = await api.assignProjectEmployees(assigningTeam.id, employeeIds);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setAssigningTeam(null);
  };

  return (
    <div>
      <SectionHeader eyebrow="Project management" title="Projects" action={<PrimaryButton onClick={() => setShowNew(true)}>New project</PrimaryButton>} />
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search projects…"
        filters={
          <>
            <select className="filter-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="All">All services</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option value="All">Everyone</option>
              {users.filter((u) => u.role !== "Accountant").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </>
        }
        right={<span className="muted-note">{projects.length} total</span>}
      />

      <div className="board">
        {grouped.map((col) => (
          <div key={col.status} className="board-col">
            <div className="board-col-head">
              <span>{col.status}</span>
              <span className="board-count">{col.items.length}</span>
            </div>
            <div className="board-col-body">
              {col.items.map((p) => (
                <div key={p.id} className="board-card">
                  <div className="board-card-id">{p.id}</div>
                  <div className="board-card-title">{p.name}</div>
                  <div className="board-card-service"><Briefcase size={12} /> {p.service}</div>
                  <Field label="Status">
                    <select value={p.status} onChange={(e) => handleStatusChange(p, e.target.value)}>
                      {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <div className="board-card-foot">
                    <div className="team-stack" onClick={() => setAssigningTeam(p)} title="Click to manage team" style={{ cursor: "pointer" }}>
                      {p.team.length === 0 && <span className="dim-text">No team yet</span>}
                      {p.team.map((t) => <Avatar key={t} userId={t} size={22} />)}
                    </div>
                    <span className="board-card-date"><Clock size={11} /> {p.deadline}</span>
                  </div>
                  <div className="board-card-actions">
                    <button className="icon-btn" title="Assign team" onClick={() => setAssigningTeam(p)}><Users size={13} /></button>
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(p)}><Pencil size={13} /></button>
                    <button className="icon-btn" title="Archive" onClick={() => handleDelete(p)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <div className="board-empty">No projects</div>}
            </div>
          </div>
        ))}
      </div>

      {showNew && <ProjectFormModal title="Create project" submitLabel="Create project" onClose={() => setShowNew(false)} onSubmit={handleCreate} />}
      {editing && (
        <ProjectFormModal
          title="Edit project"
          submitLabel="Save changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
      {assigningTeam && (
        <AssignTeamModal
          project={assigningTeam}
          onClose={() => setAssigningTeam(null)}
          onSave={handleAssignTeam}
        />
      )}
    </div>
  );
}
