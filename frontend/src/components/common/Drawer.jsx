import { X } from "lucide-react";

export default function Drawer({ title, subtitle, onClose, children, tag }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="drawer-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            {tag}
            <h2>{title}</h2>
            {subtitle && <div className="drawer-sub">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}
