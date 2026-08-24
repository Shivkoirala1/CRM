import { STATUS_STYLES } from "../../data/mockData";

export default function Pill({ label, styleMap }) {
  const s = (styleMap || STATUS_STYLES)[label] || { bg: "#EEF1F6", fg: "#64748B" };
  return (
    <span className="pill" style={{ background: s.bg, color: s.fg }}>
      {label}
    </span>
  );
}
