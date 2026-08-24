import { useMemo, useState } from "react";
import { ListChecks, Target, FolderKanban, AlertCircle, ArrowUpRight, Users } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";
import { useData } from "../../context/DataContext";
import { TASK_STATUSES, TASK_PRIORITIES, LEAD_STATUSES, PRIORITY_STYLES } from "../../data/mockData";

/**
 * General Staff never see client records, invoices, or revenue — this
 * dashboard is scoped entirely to the signed-in staff member's own leads,
 * tasks and projects and pulls nothing from the clients/invoices
 * collections.
 */
export default function StaffDashboardView({ currentUser, onNavigate }) {
  const { leads, tasks, projects } = useData();

  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [focusWindow, setFocusWindow] = useState("Today");

  const myTasksAll = tasks.filter((t) => t.assignee === currentUser.id);
  const myLeadsAll = leads.filter((l) => l.owner === currentUser.id);
  const myProjects = projects.filter((p) => p.team.includes(currentUser.id));

  const openTasks = myTasksAll.filter((t) => t.status !== "Completed");
  const overdueTasks = myTasksAll.filter((t) => t.status === "Overdue");

  const myTasksFiltered = useMemo(
    () => myTasksAll.filter((t) => taskStatusFilter === "All" || t.status === taskStatusFilter),
    [myTasksAll, taskStatusFilter]
  );

  const myLeadsFiltered = useMemo(
    () => myLeadsAll.filter((l) => leadStatusFilter === "All" || l.status === leadStatusFilter),
    [myLeadsAll, leadStatusFilter]
  );

  const focusTasks = useMemo(() => {
    const REFERENCE = "2026-08-21";
    const horizonDays = focusWindow === "Today" ? 0 : 7;
    const ref = new Date(REFERENCE);
    return myTasksAll
      .filter((t) => t.status !== "Completed")
      .filter((t) => {
        const due = new Date(t.due);
        const diff = Math.round((due - ref) / (1000 * 60 * 60 * 24));
        return diff <= horizonDays;
      })
      .sort((a, b) => a.due.localeCompare(b.due));
  }, [myTasksAll, focusWindow]);

  return (
    <div>
      <SectionHeader eyebrow={`Welcome back, ${currentUser.name.split(" ")[0]}`} title="My dashboard" />

      <div className="scope-banner">
        <Users size={15} color="#4C6FEF" />
        Staff view — your own leads, tasks and projects. Client records, invoices and revenue aren't part of this console.
      </div>

      <div className="stat-grid">
        <StatCard icon={ListChecks} label="My open tasks" value={openTasks.length} accent="#4C6FEF" />
        <StatCard icon={AlertCircle} label="My overdue tasks" value={overdueTasks.length} accent="#DC4C42" />
        <StatCard icon={Target} label="My assigned leads" value={myLeadsAll.length} accent="#C8862A" />
        <StatCard icon={FolderKanban} label="My active projects" value={myProjects.length} accent="#0F9E8F" />
      </div>

      <div className="panel-card">
        <div className="panel-card-filters">
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>Today's focus</h3>
          <div className="panel-filter-row">
            <select className="select-sm" value={focusWindow} onChange={(e) => setFocusWindow(e.target.value)}>
              <option>Today</option>
              <option>This week</option>
            </select>
            {onNavigate && (
              <button className="panel-link-btn" onClick={() => onNavigate("tasks")}>
                View all tasks <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
        <div>
          {focusTasks.map((t) => (
            <div className="mini-row" key={t.id}>
              <div className="mini-row-main">
                <span className="mini-row-title">{t.title}</span>
                <span className="mini-row-sub">Due {t.due} · {t.type} · {t.ref}</span>
              </div>
              <Pill label={t.priority} styleMap={PRIORITY_STYLES} />
            </div>
          ))}
          {focusTasks.length === 0 && <span className="muted-note">Nothing due in this window — you're all caught up.</span>}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel-card">
          <div className="panel-card-filters">
            <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>My tasks</h3>
            <select className="select-sm" value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)}>
              <option>All</option>
              {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            {myTasksFiltered.slice(0, 6).map((t) => (
              <div className="mini-row" key={t.id}>
                <div className="mini-row-main">
                  <span className="mini-row-title">{t.title}</span>
                  <span className="mini-row-sub">Due {t.due}</span>
                </div>
                <Pill label={t.status} />
              </div>
            ))}
            {myTasksFiltered.length === 0 && <span className="muted-note">No tasks in this filter.</span>}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card-filters">
            <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>My leads</h3>
            <select className="select-sm" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
              <option>All</option>
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            {myLeadsFiltered.slice(0, 6).map((l) => (
              <div className="mini-row" key={l.id}>
                <div className="mini-row-main">
                  <span className="mini-row-title">{l.name}</span>
                  <span className="mini-row-sub">{l.company} · {l.service}</span>
                </div>
                <Pill label={l.status} />
              </div>
            ))}
            {myLeadsFiltered.length === 0 && <span className="muted-note">No leads in this filter.</span>}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-head">
          <h3>My projects</h3>
          <span className="muted-note">{myProjects.length} assigned</span>
        </div>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {myProjects.map((p) => (
            <div key={p.id} className="board-card" style={{ cursor: "default" }}>
              <div className="board-card-id">{p.id}</div>
              <div className="board-card-title">{p.name}</div>
              <div className="board-card-service">{p.service}</div>
              <div className="board-card-foot">
                <Pill label={p.status} />
                <span className="board-card-date">Due {p.deadline}</span>
              </div>
            </div>
          ))}
          {myProjects.length === 0 && <span className="muted-note">You aren't assigned to any projects yet.</span>}
        </div>
      </div>
    </div>
  );
}
