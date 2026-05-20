# FUTURE_FS_02 — Client Lead Management System (Mini CRM)

> Task 2 submission for the **Future Interns — Full Stack Web Development** internship.

A small but production-shaped CRM that captures leads from a public contact form, tracks them through a 5-stage pipeline, and lets an authenticated admin add notes and follow-ups. Built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express + JWT auth** on the backend, backed by **MongoDB** with a zero-setup in-memory fallback.

---

## Features

- **Public lead capture** — `POST /api/leads` is open so a portfolio contact form (e.g. FUTURE_FS_01) can feed leads directly into the CRM.
- **JWT-protected admin dashboard** — login flow, persisted session, automatic re-auth on reload.
- **Pipeline statuses** — `new → contacted → qualified → converted` (plus `lost`), with one-click status changes and live stats tiles.
- **Notes & follow-ups** — append-only timeline per lead for call logs, observations, and next steps.
- **Search + filter** — debounced search by name/email/company and filter by status.
- **MongoDB or zero-config** — set `MONGODB_URI` to use Mongo; leave it blank and the server uses an in-memory store that persists to `server/data/crm.json`.
- Rate-limited public endpoint and login endpoint.
- Responsive UI with subtle Framer Motion animations.

## Tech Stack

| Layer    | Tech                                                         |
| -------- | ------------------------------------------------------------ |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Backend  | Node.js, Express 4, JWT (jsonwebtoken), bcryptjs             |
| Database | MongoDB + Mongoose (optional) · JSON-file fallback           |
| Tooling  | express-rate-limit, cors, dotenv, nodemon                    |

## Project Structure

```
FUTURE_FS_02/
├── client/                 # Vite + React + Tailwind admin UI
│   └── src/
│       ├── components/     # Layout, StatusBadge, PageHeader
│       ├── context/        # AuthContext (token + user)
│       ├── lib/api.js      # Typed fetch wrapper
│       └── pages/          # Login, Dashboard, Leads, LeadDetail, NewLead, PublicForm
└── server/                 # Express API
    └── src/
        ├── routes/         # auth.js, leads.js
        ├── middleware/     # auth.js (JWT)
        ├── lib/            # store.js (strategy), store.mongo.js, store.memory.js, bootstrap.js
        ├── scripts/seed.js # Inserts a few sample leads
        └── index.js
```

## Getting Started

### 1. Backend

```bash
cd server
cp .env.example .env       # tweak ADMIN_EMAIL / ADMIN_PASSWORD / MONGODB_URI if you like
npm install
npm run dev                # → http://localhost:5060
```

On first boot, an admin user is seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults `admin@example.com` / `admin12345`).

If `MONGODB_URI` is empty (or fails to connect), the server falls back to an in-memory store that writes JSON to `server/data/crm.json`. Great for evaluators who don't want to spin up Mongo.

Optional: seed sample leads with `npm run seed`.

### 2. Frontend

```bash
cd client
npm install
npm run dev                # → http://localhost:5174
```

The Vite dev server proxies `/api/*` to `http://localhost:5060`. Open `http://localhost:5174/` and sign in with the seeded admin credentials, or visit `http://localhost:5174/contact` for the public lead form.

### 3. Production build

```bash
cd client && npm run build       # outputs dist/
cd ../server && npm start
```

## API

All routes are mounted under `/api`.

### Auth
| Method | Path             | Auth | Body                            |
| ------ | ---------------- | ---- | ------------------------------- |
| POST   | `/auth/login`    | —    | `{ email, password }`           |
| GET    | `/auth/me`       | JWT  | —                               |

### Leads
| Method | Path                   | Auth | Notes                                            |
| ------ | ---------------------- | ---- | ------------------------------------------------ |
| POST   | `/leads`               | —    | Public — used by the portfolio contact form      |
| GET    | `/leads?status=&q=`    | JWT  | Filter by status, search by name/email/company   |
| GET    | `/leads/stats`         | JWT  | Counts per status                                |
| GET    | `/leads/:id`           | JWT  |                                                  |
| PATCH  | `/leads/:id`           | JWT  | Update any of name/email/phone/company/source/status/message |
| DELETE | `/leads/:id`           | JWT  |                                                  |
| POST   | `/leads/:id/notes`     | JWT  | `{ body }` — appends a note                      |

### Health
| GET | `/health` | uptime + active store kind |

## Data Model

```ts
Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: string                                     // e.g. "Portfolio contact form"
  status: 'new'|'contacted'|'qualified'|'converted'|'lost'
  message?: string
  notes: { id, body, createdAt }[]
  createdAt: string
  updatedAt: string
}
```

## Integrating with the FUTURE_FS_01 portfolio

The portfolio contact form can POST directly to this CRM:

```js
await fetch('https://your-crm.example.com/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name, email, message,
    source: 'Portfolio contact form',
  }),
});
```

Set `CLIENT_ORIGIN` in `server/.env` to the portfolio's URL to keep CORS happy.

## Deployment notes

- **Frontend** → Vercel / Netlify (`client/dist`). Set up the API base or proxy.
- **Backend** → Render / Railway / Fly.io. Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`.

## Submission

- Track code: **FS**
- Repository name: `FUTURE_FS_02`
- Submitted via the official Future Interns Task Submission Portal.

## Author

**Edmund Wegasira** — Full Stack Web Development Intern @ Future Interns
