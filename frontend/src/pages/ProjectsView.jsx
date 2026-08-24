import { useState } from "react";
import { Briefcase, Clock } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Toolbar from "../components/common/Toolbar";
import Modal from "../components/common/Modal";
import Field from "../components/common/Field";
import Avatar from "../components/common/Avatar";
import { PrimaryButton, GhostButton } from "../components/common/Buttons";
import { useData } from "../context/DataContext";
import { SERVICES, PROJECT_STATUSES } from "../data/mockData";
import * as api from "../services/api";

function NewProjectModal({ onClose, onCreate }) {
  const { clients } = useData();
  const [form, setForm] = useState({
    name: "", client: clients[0]?.id || "", service: SERVICES[0],
    description: "", scope: "", start: "", deadline: "", status: "Not Started",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal
      title="Create project"
      onClose={onClose}
      width={560}
      footer={<><GhostButton onClick={onClose}>Cancel</GhostButton><button className="btn-primary" disabled={!form.name} onClick={() => onCreate(form)}>Create project</button></>}
    >
      <div className="form-grid">
        <Field label="Project name"><input value={form.name} onChange={set("name")} /></Field>
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

export default function ProjectsView() {
  const { projects, users, setProjects } = useData();
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);

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
                  <div className="board-card-foot">
                    <div className="team-stack">
                      {p.team.map((t) => <Avatar key={t} userId={t} size={22} />)}
                    </div>
                    <span className="board-card-date"><Clock size={11} /> {p.deadline}</span>
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
