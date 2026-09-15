import { useMemo } from "react";
import { useData } from "../context/DataContext";

/**
 * There is no notifications endpoint on the backend, so this derives a
 * real (not fabricated) feed from data already loaded: overdue tasks,
 * overdue invoices, and client renewals due within two weeks. Shared by
 * Topbar (unread count) and NotificationsPanel (the list) so both stay
 * in sync off one computation.
 */
export function useNotifications() {
  const { tasks, invoices, clients } = useData();

  return useMemo(() => {
    const items = [];

    tasks
      .filter((t) => t.status === "OVERDUE")
      .forEach((t) =>
        items.push({ id: `task-${t.id}`, kind: "task", text: `Task overdue: ${t.title}`, date: t.due_date })
      );

    invoices
      .filter((i) => i.payment_status === "OVERDUE")
      .forEach((i) =>
        items.push({
          id: `inv-${i.id}`,
          kind: "overdue",
          text: `Invoice ${i.invoice_number} overdue — ${i.client_name || "client"}`,
          date: i.due_date,
        })
      );

    const today = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 14);
    clients
      .filter((c) => c.renewal_date && new Date(c.renewal_date) >= today && new Date(c.renewal_date) <= soon)
      .forEach((c) =>
        items.push({
          id: `renewal-${c.id}`,
          kind: "renewal",
          text: `${c.company_name || c.name} renews on ${c.renewal_date}`,
          date: c.renewal_date,
        })
      );

    return items.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [tasks, invoices, clients]);
}
