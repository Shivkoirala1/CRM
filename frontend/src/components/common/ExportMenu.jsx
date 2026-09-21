import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { GhostButton } from "./Buttons";
import * as api from "../../services/api";

// Currently exports Leads only — the backend's export endpoints
// (dashboard/export/leads/excel|pdf) cover the Leads module. If/when
// Clients/Projects/Invoices get their own export endpoints, add more
// options here.
export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      setOpen(false);
    } catch {
      setError("Couldn't generate the file. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export-menu-wrap">
      <GhostButton icon={Download} onClick={() => setOpen(!open)}>Export report</GhostButton>
      {open && (
        <div className="export-menu-dropdown">
          <button disabled={busy} onClick={() => run(api.exportLeadsExcel)}>
            <FileSpreadsheet size={14} /> Leads — Excel
          </button>
          <button disabled={busy} onClick={() => run(api.exportLeadsPdf)}>
            <FileText size={14} /> Leads — PDF
          </button>
          {error && <div className="export-menu-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
