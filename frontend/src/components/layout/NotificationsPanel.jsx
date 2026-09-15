import { AlertCircle, ListChecks, Calendar, Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const NOTIF_ICON = { task: ListChecks, overdue: AlertCircle, renewal: Calendar };

/**
 * There's no notifications endpoint on the backend — this list is
 * computed live from overdue tasks/invoices and upcoming renewals (see
 * useNotifications), not a fabricated feed.
 */
export default function NotificationsPanel() {
  const notifications = useNotifications();
  return (
    <div className="notif-panel">
      <div className="notif-panel-head">
        <h3>Notifications</h3>
      </div>
      <div className="notif-list">
        {notifications.map((n) => {
          const Icon = NOTIF_ICON[n.kind] || Bell;
          return (
            <div key={n.id} className="notif-row unread">
              <Icon size={15} color="#C8862A" />
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.date}</div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="notif-row">
            <div className="notif-text" style={{ color: "#8A93A6" }}>
              Nothing needs your attention right now.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
