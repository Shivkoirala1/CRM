# Prasad Info Tech — CRM Frontend

Frontend-only React app for the Prasad Info Tech CRM console, built for the
**MERN stack** (this package is the "R" — React — piece; Express, MongoDB,
and Node.js are not included).

## Stack

- **React 18** + **Vite** (dev server / build tool)
- **React Router** is installed and ready if you want to move from the
  current single-page view-switching model to real routes
- **Recharts** for the dashboard charts
- **lucide-react** for icons
- **Axios** as the API client, pointed at a placeholder Express backend

## Getting started

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build locally
```

## Project structure

```
src/
  main.jsx              # app entry point
  App.jsx                # shell: routing between login + main app views
  context/
    DataContext.jsx      # loads all CRM data once and shares it via context
  services/
    axiosClient.js       # shared axios instance (reads VITE_API_BASE_URL)
    api.js                # one function per REST endpoint (leads, clients, ...)
  data/
    mockData.js           # seed/mock data + shared constants & style maps
  components/
    common/                # Pill, Avatar, Modal, Drawer, buttons, etc.
    layout/                # Sidebar, Topbar, GlobalSearch, NotificationsPanel
  pages/
    LoginScreen.jsx
    DashboardView.jsx
    LeadsView.jsx
    ClientsView.jsx
    ProjectsView.jsx
    TasksView.jsx
    InvoicesView.jsx
    AuditView.jsx
    UsersView.jsx
  styles/
    global.css             # all app styling (design tokens in the header comment)
```

## Connecting the real backend

Every data-fetching/mutating call goes through `src/services/api.js`. Each
function there is commented with the REST endpoint it expects
(e.g. `GET /api/leads`, `POST /api/leads`, `PATCH /api/tasks/:id`). Right
now those calls fail silently and fall back to the mock data in
`src/data/mockData.js`, so the UI works standalone with no backend running.

To connect a real Express + MongoDB API:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your API's
   base URL (e.g. `http://localhost:5000/api`).
2. Build out matching Express routes for `/auth`, `/leads`, `/clients`,
   `/projects`, `/tasks`, `/invoices`, `/notifications`, `/activity`, and
   `/users`.
3. Once those routes respond, `src/services/api.js` will start returning
   live data automatically — no frontend changes required.
4. `src/services/axiosClient.js` already attaches a bearer token from
   `localStorage` (`pit_crm_token`) to every request, ready for real auth.

## Notes

- Role-based navigation (Admin/CEO, Manager, General Staff) is preserved
  from the original prototype — the sidebar and route guard in `App.jsx`
  filter `NAV_ITEMS` by the logged-in user's role.
- All mock data lives in one place (`src/data/mockData.js`) so it's easy to
  see exactly what shape the backend models need to match.
- No local/session storage is used for app data — everything lives in
  React context for the session, matching the original prototype's
  in-memory behavior.
