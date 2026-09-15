import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ListChecks, FolderKanban } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import { useData } from "../context/DataContext";
import { userById } from "../data/mockData";
import { TASK_PRIORITY_META } from "../data/choices";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const EVENT_COLORS = { Task: "#4C6FEF", Project: "#0F9E8F" };

function toDateStr(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function todayStr() {
  const now = new Date();
  return toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Unifies task due dates and project deadlines into one navigable month
 * view, scoped the same way the dashboards are: General Staff only see
 * their own tasks (assigned_to) and projects (assigned_employees);
 * Admin/Manager see everything.
 */
export default function CalendarView({ currentUser }) {
  const { tasks, projects, users } = useData();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const isStaff = currentUser.role === "STAFF";

  const events = useMemo(() => {
    const out = [];
    const myTasks = isStaff ? tasks.filter((t) => t.assigned_to === currentUser.id) : tasks;
    const myProjects = isStaff ? projects.filter((p) => (p.assigned_employees || []).includes(currentUser.id)) : projects;

    myTasks
      .filter((t) => t.due_date && t.status !== "COMPLETED")
      .forEach((t) => out.push({
        date: t.due_date, kind: "Task", title: t.title,
        sub: `${TASK_PRIORITY_META[t.priority]?.label || t.priority} priority · ${userById(users, t.assigned_to)?.username || "Unassigned"}`,
        id: t.id,
      }));

    myProjects
      .filter((p) => p.deadline && p.status !== "COMPLETED" && p.status !== "CANCELLED")
      .forEach((p) => out.push({
        date: p.deadline, kind: "Project", title: p.name,
        sub: p.status, id: p.id,
      }));

    return out;
  }, [isStaff, tasks, projects, users, currentUser.id]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
  const goNextMonth = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => { const now = new Date(); setCursor(now); setSelectedDate(todayStr()); };

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div>
      <SectionHeader
        eyebrow={isStaff ? "Your deadlines" : "Company-wide deadlines"}
        title="Calendar"
      />

      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={goPrevMonth}><ChevronLeft size={15} /></button>
          <span className="calendar-month-label">{MONTH_NAMES[month]} {year}</span>
          <button className="calendar-nav-btn" onClick={goNextMonth}><ChevronRight size={15} /></button>
          <button className="btn-ghost" onClick={goToday}>Today</button>
        </div>
        <div className="calendar-legend">
          <span className="calendar-legend-item"><span className="calendar-legend-dot" style={{ background: EVENT_COLORS.Task }} /> Task</span>
          <span className="calendar-legend-item"><span className="calendar-legend-dot" style={{ background: EVENT_COLORS.Project }} /> Project</span>
        </div>
      </div>

      <div className="panel-card">
        <div className="calendar-grid">
          {WEEKDAYS.map((w) => <div key={w} className="calendar-weekday">{w}</div>)}
          {cells.map((d, idx) => {
            if (d === null) return <div key={idx} className="calendar-cell empty" />;
            const dateStr = toDateStr(year, month, d);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr();
            const isSelected = dateStr === selectedDate;
            return (
              <div
                key={idx}
                className={"calendar-cell" + (isToday ? " today" : "") + (isSelected ? " selected" : "")}
                onClick={() => setSelectedDate(dateStr)}
              >
                <span className="calendar-day-num">{d}</span>
                <div className="calendar-event-list">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span
                      key={i}
                      className="calendar-event-pill"
                      style={{ background: EVENT_COLORS[e.kind] + "1E", color: EVENT_COLORS[e.kind] }}
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && <span className="calendar-event-more">+{dayEvents.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel-card calendar-agenda">
        <div className="calendar-agenda-head">
          <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14.5 }}>
            {selectedDate ? `Agenda — ${selectedDate}` : "Select a day to see its agenda"}
          </h3>
          <span className="muted-note">{selectedEvents.length} item{selectedEvents.length === 1 ? "" : "s"}</span>
        </div>
        {selectedEvents.map((e, i) => {
          const Icon = e.kind === "Task" ? ListChecks : FolderKanban;
          return (
            <div key={i} className="calendar-agenda-row">
              <span className="calendar-agenda-dot" style={{ background: EVENT_COLORS[e.kind] }} />
              <Icon size={14} color={EVENT_COLORS[e.kind]} />
              <div className="calendar-agenda-main">
                <div className="calendar-agenda-title">{e.title}</div>
                <div className="calendar-agenda-sub">{e.kind} · {e.sub}</div>
              </div>
            </div>
          );
        })}
        {selectedDate && selectedEvents.length === 0 && (
          <span className="muted-note">Nothing due on this day.</span>
        )}
      </div>
    </div>
  );
}
