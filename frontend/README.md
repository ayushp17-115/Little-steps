# Little Steps — Frontend (Next.js + Tailwind CSS)

## What's here
Next.js 16 (App Router) + Tailwind CSS v4. Consumes the backend REST API via `lib/api.js`.
Auth (JWT) is stored client-side via `lib/AuthContext.js` and sent as a Bearer token.

Pages:
- `/` — landing page
- `/login`, `/register` — parent or center accounts (admin accounts aren't self-registrable)
- `/browse` — search + filter centres (service, age group, 24×7, verified)
- `/centers/[id]` — centre detail + capacity-aware booking form
- `/my-bookings` — parent's requests with live status + check-in/out timestamps
- `/center/dashboard` — center owner: list centres, request verification, manage caregivers
- `/center/requests` — center owner: accept/decline requests, check children in/out
- `/admin/queue` — admin: approve/reject centre & caregiver verification requests
- `/admin/overview` — admin: platform KPIs and per-centre utilization

## 1. Install
```bash
cd frontend
npm install
```

## 2. Configure
Copy `.env.local.example` to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Point this at your deployed backend URL in production.

## 3. Run
```bash
npm run dev
```
Visit `http://localhost:3000`. Make sure the backend (see `../backend/README.md`) is running first.

## 4. Build & lint (already verified clean)
```bash
npm run build   # production build — passes with 0 errors
npm run lint    # 0 errors, a handful of intentional/false-positive warnings only
```

## Deployment (Vercel)
1. Push this `frontend/` folder to a GitHub repo (or the monorepo root, setting Vercel's
   "Root Directory" to `frontend`).
2. Import the repo in Vercel.
3. Add the environment variable `NEXT_PUBLIC_API_URL` pointing at your deployed backend
   (e.g. `https://little-steps-api.onrender.com/api`).
4. Deploy — Vercel auto-detects Next.js.

## What's intentionally out of scope (Phase 1)
- Maps/location picker — area is a free-text field for now
- Payments UI (backend has no payment routes either, per the spec's "future phase")
- Push/email notifications on status changes — status updates are pull-based (refresh the page)
