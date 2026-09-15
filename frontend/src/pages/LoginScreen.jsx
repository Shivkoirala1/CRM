import { useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import Field from "../components/common/Field";
import { useData } from "../context/DataContext";
import { getErrorMessage } from "../services/api";

/**
 * Real login form against POST /api/token/ — the backend has no public
 * registration or account-listing endpoint, so unlike the earlier
 * mock-data version there's no "pick a demo user" list here. Accounts
 * are created via the Django admin or `manage.py createsuperuser`.
 */
export default function LoginScreen() {
  const { login } = useData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">PIT</div>
          <div>
            <div className="login-company">Prasad Info Tech</div>
            <div className="login-tag">Client Relationship Console</div>
          </div>
        </div>
        <h1>Sign in to continue</h1>
        <p className="login-copy">Use the username and password your admin set up for you.</p>

        <form onSubmit={handleSubmit}>
          <Field label="Username">
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>

          {error && (
            <div className="login-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button className="btn-primary login-btn" type="submit" disabled={submitting || !username || !password}>
            <ShieldCheck size={16} /> {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="login-foot">Accounts are provisioned by an administrator via the Django admin panel.</div>
      </div>
    </div>
  );
}
