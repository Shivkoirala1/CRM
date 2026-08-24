import { useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Avatar from "../components/common/Avatar";
import Field from "../components/common/Field";
import { useData } from "../context/DataContext";

export default function LoginScreen({ onLogin }) {
  const { users } = useData();
  const [selected, setSelected] = useState("u1");

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
        <p className="login-copy">Choose your account to preview the console with your role's permissions.</p>
        <div className="login-users">
          {users.map((u) => (
            <button
              key={u.id}
              className={"login-user" + (selected === u.id ? " active" : "")}
              onClick={() => setSelected(u.id)}
            >
              <Avatar userId={u.id} size={34} />
              <div className="login-user-meta">
                <div className="login-user-name">{u.name}</div>
                <div className="login-user-role">{u.role}</div>
              </div>
              {selected === u.id && <CheckCircle2 size={16} color="#C8862A" />}
            </button>
          ))}
        </div>
        <Field label="Password">
          <input type="password" defaultValue="••••••••••" />
        </Field>
        <button className="btn-primary login-btn" onClick={() => onLogin(selected)}>
          <ShieldCheck size={16} /> Log in
        </button>
        <div className="login-foot">Two-factor authentication available under Settings → Security.</div>
      </div>
    </div>
  );
}
