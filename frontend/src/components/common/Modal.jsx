import { X } from "lucide-react";

export default function Modal({ title, onClose, children, footer, width = 520 }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-panel" style={{ width }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
