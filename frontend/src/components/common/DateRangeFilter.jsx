/**
 * Compact "from — to" date pair used in list-view toolbars and dashboard
 * panel headers wherever records can be filtered by date.
 */
export default function DateRangeFilter({ from, to, onFromChange, onToChange, label }) {
  return (
    <div className="date-range">
      {label && <span className="date-range-label">{label}</span>}
      <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      <span>–</span>
      <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
    </div>
  );
}
