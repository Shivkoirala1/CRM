/**
 * Status/priority chip. `code` is the raw backend enum value (e.g. "NEW",
 * "IN_PROGRESS") and `meta` is one of the *_META maps in data/choices.js
 * that supplies its label + colors. Falls back to showing the code
 * itself if it's not a recognized value.
 */
export default function Pill({ code, meta, fallbackLabel }) {
  const m = meta?.[code];
  const label = m?.label || fallbackLabel || code || "—";
  const bg = m?.bg || "#EEF1F6";
  const fg = m?.fg || "#64748B";
  return (
    <span className="pill" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}
