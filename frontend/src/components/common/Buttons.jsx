import { Plus } from "lucide-react";

export function PrimaryButton({ children, onClick, icon: Icon = Plus }) {
  return (
    <button className="btn-primary" onClick={onClick}>
      <Icon size={15} />
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon: Icon }) {
  return (
    <button className="btn-ghost" onClick={onClick}>
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
