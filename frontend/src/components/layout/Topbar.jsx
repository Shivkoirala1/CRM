import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import Avatar from "../common/Avatar";
import NotificationsPanel from "./NotificationsPanel";
import { useData } from "../../context/DataContext";

export default function Topbar({ currentUser, onOpenSearch, onLogout }) {
  const { notifications } = useData();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="topbar">
      <button className="search-trigger" onClick={onOpenSearch}>
        <Search size={14} color="#8A93A6" />
        <span>Search leads, clients, projects…</span>
        <kbd>⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      <div className="topbar-right">
        <div className="notif-wrap">
          <button className="icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell size={17} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {notifOpen && <NotificationsPanel />}
        </div>

        <div className="user-wrap">
          <button className="user-trigger" onClick={() => setUserMenu(!userMenu)}>
            <Avatar userId={currentUser.id} size={30} />
            <div className="user-trigger-meta">
              <div className="user-trigger-name">{currentUser.name}</div>
              <div className="user-trigger-role">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} color="#8A93A6" />
          </button>
          {userMenu && (
            <div className="user-menu">
              <button className="user-menu-row" onClick={onLogout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
