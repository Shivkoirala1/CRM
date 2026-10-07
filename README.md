# CRM — Prasad Info Tech

A Customer Relationship Management system built in-house for Prasad Info Tech, an IT services company. It replaces scattered spreadsheets and manual tracking with a single platform for managing leads, clients, projects, tasks, billing, and team attendance — with different views and permissions depending on who's logged in.

## Tech Stack

**Backend:** Django REST Framework, PostgreSQL, JWT authentication
**Frontend:** React, Vite

## Modules

- **Leads** — capture and track potential clients from first contact through to conversion, with source tracking and assignment to team members
- **Clients** — a central record for every active client, including services, payment status, and renewal dates
- **Projects** — link work to the right client, assign a team, and track progress through a visual Kanban board
- **Tasks** — follow-ups and to-dos tied to a lead, client, or project, with priorities, due dates, and recurring tasks
- **Invoices** — generate and track invoices per client, with full payment history
- **Dashboard & Reports** — lead conversion rates, revenue breakdowns, and exportable reports (PDF/Excel)
- **Attendance** — employees track their own attendance; managers and supervisors track and manage it for their teams
- **Notifications** — automatic alerts for new assignments, upcoming deadlines, overdue items, and renewals
- **Activity Log** — a full audit trail of logins and key actions taken across the system

## User Roles

| Role | Overview |
|---|---|
| Admin/CEO | Full visibility and control across the entire system |
| Manager | Manages day-to-day operations across leads, clients, projects, and billing |
| Supervisor | Oversees a team of Interns, including their attendance |
| General Staff | Handles assigned day-to-day CRM work |
| Intern | Standard day-to-day access, under a Supervisor |

## Security

- Role-based permissions throughout, so each user only sees and does what their role allows
- Two-factor authentication support
- Full activity logging for accountability

---

This is an internal project built for and used by Prasad Info Tech. Not for external distribution.
