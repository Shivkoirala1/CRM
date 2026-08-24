import { Target, AlertCircle, ListChecks, Calendar, FolderKanban, DollarSign, Bell } from "lucide-react";
import { useData } from "../../context/DataContext";

const NOTIF_ICON = { lead: Target, overdue: AlertCircle, task: ListChecks, renewal: Calendar, project: FolderKanban, payment: DollarSign };

export default function NotificationsPanel() {
  const { notifications } = useData();
  return (
    <div className="notif-panel">
      <div className="notif-panel-head">
        <h3>Notifications</h3>
        <button className="link-btn">Mark all read</button>
      </div>
      <div className="notif-list">
        {notifications.map((n) => {
          const Icon = NOTIF_ICON[n.icon] || Bell;
          return (
            <div key={n.id} className={"notif-row" + (n.unread ? " unread" : "")}>
              <Icon size={15} color={n.unread ? "#C8862A" : "#8A93A6"} />
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
