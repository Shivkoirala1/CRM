import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Field from "../components/common/Field";
import { useData } from "../context/DataContext";

export default function LoginScreen() {
  const { login, authError } = useData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    await login(username, password);
    setSubmitting(false);
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
        <p className="login-copy">Enter your CRM credentials to continue.</p>

        <form onSubmit={handleSubmit}>
          <Field label="Username">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              autoFocus
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </Field>

          {authError && <div className="login-error">{authError}</div>}

          <button className="btn-primary login-btn" type="submit" disabled={submitting}>
            <ShieldCheck size={16} /> {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
