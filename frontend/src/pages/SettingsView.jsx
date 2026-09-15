import { useEffect, useState } from "react";
import { User, ShieldCheck, Bell, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";
import Field from "../components/common/Field";
import Avatar from "../components/common/Avatar";
import ToggleSwitch from "../components/common/ToggleSwitch";
import { NAV_ITEMS } from "../data/mockData";
import { ROLE_META } from "../data/choices";
import * as api from "../services/api";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
];

const DEFAULT_PREFS = {
  emailAlerts: true,
  overdueReminders: true,
  weeklySummary: true,
  taskAssignments: true,
};

function loadPrefs(userId) {
  try {
    const raw = localStorage.getItem(`pit_crm_notif_prefs_${userId}`);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function ProfileTab({ currentUser }) {
  const accessibleSections = NAV_ITEMS.filter((i) => i.roles.includes(currentUser.role));
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <h3>Profile</h3>
        <p>Your account details, as they come from the Django backend.</p>
      </div>
      <div className="settings-profile-row">
        <Avatar userId={currentUser.id} size={56} />
        <div>
          <div className="settings-profile-name">{currentUser.username}</div>
          <div className="settings-profile-role">{ROLE_META[currentUser.role]?.label || currentUser.role}</div>
        </div>
      </div>
      <div className="form-grid">
        <Field label="Username"><input value={currentUser.username} disabled /></Field>
        <Field label="Email"><input value={currentUser.email || "—"} disabled /></Field>
        <Field label="Role"><input value={ROLE_META[currentUser.role]?.label || currentUser.role} disabled /></Field>
        <Field label="Phone"><input value={currentUser.phone || "—"} disabled /></Field>
      </div>
      <div className="settings-section-head" style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 13.5 }}>What your role can access</h3>
      </div>
      <div className="settings-permissions">
        {accessibleSections.map((s) => (
          <span key={s.key} className="tag-chip">{s.label}</span>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    setMessage(null);
    if (!current || !next || !confirm) {
      setMessage({ type: "error", text: "Fill in all three fields." });
      return;
    }
    if (next.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMessage({ type: "error", text: "New password and confirmation don't match." });
      return;
    }
    setSubmitting(true);
    try {
      await api.changeMyPassword(current, next);
      setMessage({ type: "success", text: "Password updated. Use it next time you sign in." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMessage({ type: "error", text: api.getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <h3>Change password</h3>
        <p>Updates your real account on the Django backend — you'll need it next time you log in.</p>
      </div>
      <div className="form-grid">
        <Field label="Current password"><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></Field>
        <div />
        <Field label="New password"><input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
        <Field label="Confirm new password"><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></Field>
      </div>
      <button className="btn-primary" onClick={handleChangePassword} disabled={submitting}>
        <KeyRound size={14} /> {submitting ? "Updating…" : "Update password"}
      </button>
      {message && (
        <div className={message.type === "success" ? "settings-success" : "settings-error"}>
          {message.type === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {message.text}
        </div>
      )}
    </div>
  );
}

function NotificationsTab({ currentUser }) {
  const [prefs, setPrefs] = useState(() => loadPrefs(currentUser.id));

  useEffect(() => {
    localStorage.setItem(`pit_crm_notif_prefs_${currentUser.id}`, JSON.stringify(prefs));
  }, [prefs, currentUser.id]);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <h3>Notification preferences</h3>
        <p>Choose what shows up in your notification bell. These are stored on this device only.</p>
      </div>
      <ToggleSwitch checked={prefs.emailAlerts} onChange={() => toggle("emailAlerts")} label="Email alerts" sub="Get a copy of important updates by email (not yet sent by the backend)." />
      <ToggleSwitch checked={prefs.overdueReminders} onChange={() => toggle("overdueReminders")} label="Overdue reminders" sub="Tasks and invoices that pass their due date." />
      <ToggleSwitch checked={prefs.taskAssignments} onChange={() => toggle("taskAssignments")} label="Task assignments" sub="When a task is assigned to you." />
      <ToggleSwitch checked={prefs.weeklySummary} onChange={() => toggle("weeklySummary")} label="Weekly summary" sub="A digest of activity every Monday morning." />
    </div>
  );
}

export default function SettingsView({ currentUser }) {
  const [tab, setTab] = useState("profile");

  return (
    <div>
      <SectionHeader eyebrow="Your account" title="Settings" />
      <div className="settings-layout">
        <div className="settings-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={"settings-nav-item" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        <div>
          {tab === "profile" && <ProfileTab currentUser={currentUser} />}
          {tab === "security" && <SecurityTab />}
          {tab === "notifications" && <NotificationsTab currentUser={currentUser} />}
        </div>
      </div>
    </div>
  );
}
