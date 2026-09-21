import { useState } from "react";
import { Target, AlertCircle, ListChecks, Calendar, FolderKanban, DollarSign, Bell } from "lucide-react";
import { useData } from "../../context/DataContext";
import * as api from "../../services/api";

const NOTIF_ICON = { lead: Target, overdue: AlertCircle, task: ListChecks, renewal: Calendar, project: FolderKanban, payment: DollarSign };

export default function NotificationsPanel() {
  const { notifications, setNotifications } = useData();
  const [marking, setMarking] = useState(false);

  const handleMarkAll = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    } catch {
      window.alert("Couldn't mark all as read. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  const handleRowClick = async (n) => {
    if (!n.unread) return;
    try {
      await api.markNotificationRead(n.id);
      setNotifications(notifications.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    } catch {
      // Non-critical — leave it unread rather than interrupt the user.
    }
  };

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <div className="notif-panel">
      <div className="notif-panel-head">
        <h3>Notifications</h3>
        <button className="link-btn" onClick={handleMarkAll} disabled={!hasUnread || marking}>
          {marking ? "Marking…" : "Mark all read"}
        </button>
      </div>
      <div className="notif-list">
        {notifications.map((n) => {
          const Icon = NOTIF_ICON[n.icon] || Bell;
          return (
            <div
              key={n.id}
              className={"notif-row" + (n.unread ? " unread" : "")}
              onClick={() => handleRowClick(n)}
              style={{ cursor: n.unread ? "pointer" : "default" }}
              title={n.unread ? "Click to mark as read" : ""}
            >
              <Icon size={15} color={n.unread ? "#C8862A" : "#8A93A6"} />
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          );
        })}
        {notifications.length === 0 && <div className="notif-empty">No notifications yet.</div>}
      </div>
    </div>
  );
}
