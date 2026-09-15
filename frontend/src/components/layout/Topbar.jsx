import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import Avatar from "../common/Avatar";
import NotificationsPanel from "./NotificationsPanel";
import { useNotifications } from "../../hooks/useNotifications";
import { ROLE_META } from "../../data/choices";

export default function Topbar({ currentUser, onOpenSearch, onOpenSettings, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const notifications = useNotifications();

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
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          {notifOpen && <NotificationsPanel />}
        </div>

        <div className="user-wrap">
          <button className="user-trigger" onClick={() => setUserMenu(!userMenu)}>
            <Avatar userId={currentUser.id} size={30} />
            <div className="user-trigger-meta">
              <div className="user-trigger-name">{currentUser.username}</div>
              <div className="user-trigger-role">{ROLE_META[currentUser.role]?.label || currentUser.role}</div>
            </div>
            <ChevronDown size={14} color="#8A93A6" />
          </button>
          {userMenu && (
            <div className="user-menu">
              <div className="user-menu-label">{currentUser.email || "Signed in"}</div>
              <div className="user-menu-sep" />
              <button
                className="user-menu-row"
                onClick={() => {
                  onOpenSettings && onOpenSettings();
                  setUserMenu(false);
                }}
              >
                <Settings size={14} /> Settings
              </button>
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
