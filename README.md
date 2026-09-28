# Little Steps — Full-Stack Build

A childcare marketplace connecting parents with verified, 24×7-capable daycare centres, crèches,
and babysitters. This is the React/Next.js + Node/Express + MongoDB rebuild.

```
little-steps-fullstack/
├── backend/     Express REST API + MongoDB (Mongoose)
└── frontend/    Next.js + Tailwind CSS
```

## Quickstart (local)

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env    # fill in MONGODB_URI and JWT_SECRET
npm test                 # optional but recommended — real end-to-end test
npm run dev               # starts on http://localhost:5000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev               # starts on http://localhost:3000
```

Open `http://localhost:3000`, register a parent and a center account in two different browser
tabs/sessions, and try the flow: list a centre → request verification → (as admin) approve it →
(as parent) book a slot → (as center) accept it and check the child in/out.

## Tech stack (matches the original spec)
| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT, role-based (parent / center / admin) |
| APIs | REST, documented in `backend/README.md` |

## What's real vs. what's a stub
**Real and tested:**
- Full auth (register/login/JWT), role-gated routes
- Search/filter/browse, capacity-aware booking (server enforces it, not just the UI)
- Two-tier verification (centre **and** individual caregiver), reviewed by a real Admin role —
  centres cannot self-verify
- Check-in/check-out safety log per booking
- Basic subscriptions entity and admin KPI dashboard (registered users, verified centres,
  booking conversion rate, active subscriptions, per-centre utilization)

**Explicitly deferred (Phase 1 scope, as called out in the original spec):**
- Payments
- Maps/location APIs (area is free text; `lat`/`lng` fields exist on the model but aren't wired up)
- Email/SMS notifications

**Not yet done — next steps if you continue this:**
- Deployment isn't live anywhere yet; see each package's README for exact steps (MongoDB Atlas +
  Render/Railway for the backend, Vercel for the frontend)
- No automated frontend tests (backend has a real integration test suite in `backend/smoke-test.js`)
- Passwords/JWT are solid for a prototype but a production launch should add refresh tokens,
  rate limiting on auth routes, and httpOnly cookie storage instead of localStorage for the token
