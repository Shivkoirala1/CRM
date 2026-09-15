/** Small on/off switch used in Settings for notification and security toggles. */
export default function ToggleSwitch({ checked, onChange, label, sub }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-row-label">{label}</div>
        {sub && <div className="toggle-row-sub">{sub}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={"toggle-switch" + (checked ? " on" : "")}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
