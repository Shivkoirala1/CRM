import { useState } from "react";
import { Briefcase, Clock } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Avatar from "../components/common/Avatar";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { PROJECT_STATUS_META, SERVICE_SUGGESTIONS, metaOptions } from "../data/choices";
import * as api from "../services/api";

const PROJECT_STATUS_OPTIONS = metaOptions(PROJECT_STATUS_META);

function NewProjectModal({ onClose, onCreate }) {
  const { clients } = useData();
  const [form, setForm] = useState({
    name: "", client: clients[0]?.id || "", service: "", description: "",
    scope_of_work: "", start_date: "", deadline: "", status: "NOT_STARTED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onCreate({ ...form, client: Number(form.client) });
    } catch (err) {
      setError(api.getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Create project"
      onClose={onClose}
      width={560}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button className="btn-primary" disabled={!form.name || !form.client || saving} onClick={submit}>
            {saving ? "Creating…" : "Create project"}
          </button>
        </>
      }
    >
      {error && <div className="login-error">{error}</div>}
      {clients.length === 0 && <div className="login-error">Create a client first — a project must belong to one.</div>}
      <div className="form-grid">
        <Field label="Project name"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Client">
          <select value={form.client} onChange={set("client")}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
          </select>
        </Field>
        <Field label="Service">
          <input list="service-suggestions" value={form.service} onChange={set("service")} placeholder="e.g. Web Development" />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set("status")}>
            {PROJECT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Start date"><input type="date" value={form.start_date} onChange={set("start_date")} /></Field>
        <Field label="Deadline"><input type="date" value={form.deadline} onChange={set("deadline")} /></Field>
      </div>
      <Field label="Description"><textarea rows={2} value={form.description} onChange={set("description")} /></Field>
      <Field label="Scope of work"><textarea rows={2} value={form.scope_of_work} onChange={set("scope_of_work")} /></Field>
      <datalist id="service-suggestions">
        {SERVICE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
      </datalist>
    </Modal>
  );
}

export default function ProjectsView() {
  const { projects, setProjects, users } = useData();
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);

  const grouped = PROJECT_STATUS_OPTIONS.map((opt) => ({
    status: opt.value,
    label: opt.label,
    items: projects.filter((p) => {
      const matchStatus = p.status === opt.value;
      const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
      const matchService = serviceFilter === "All" || p.service === serviceFilter;
      const matchTeam = teamFilter === "All" || (p.assigned_employees || []).includes(Number(teamFilter));
      return matchStatus && matchQ && matchService && matchTeam;
    }),
  }));

  const handleCreate = async (payload) => {
    const created = await api.createProject(payload);
    setProjects([created, ...projects]);
    setShowNew(false);
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
              {SERVICE_SUGGESTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option value="All">Everyone</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </>
        }
        right={<span className="muted-note">{projects.length} total</span>}
      />

      <div className="board">
        {grouped.map((col) => (
          <div key={col.status} className="board-col">
            <div className="board-col-head">
              <span>{col.label}</span>
              <span className="board-count">{col.items.length}</span>
            </div>
            <div className="board-col-body">
              {col.items.map((p) => (
                <div key={p.id} className="board-card">
                  <div className="board-card-id">#{p.id} · {p.client_name}</div>
                  <div className="board-card-title">{p.name}</div>
                  <div className="board-card-service"><Briefcase size={12} /> {p.service || "—"}</div>
                  <div className="board-card-foot">
                    <div className="team-stack">
                      {(p.assigned_employees || []).map((uid) => <Avatar key={uid} userId={uid} size={22} />)}
                    </div>
                    <span className="board-card-date"><Clock size={11} /> {p.deadline || "No deadline"}</span>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <div className="board-empty">No projects</div>}
            </div>
          </div>
        ))}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </div>
  );
}
