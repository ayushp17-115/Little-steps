# Little Steps — Backend (Node.js + Express + MongoDB)

## What's here
- Express REST API (`server.js` + `src/routes/*`)
- Mongoose models: User, Center, Caregiver, Booking, Subscription (`src/models/*`)
- JWT auth with role-based access (parent / center / admin) — `src/middleware/auth.js`
- `smoke-test.js` — a real end-to-end integration test against an in-memory MongoDB

## 1. Install
```bash
cd backend
npm install
```

## 2. Configure
Copy `.env.example` to `.env` and fill in:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/little-steps
JWT_SECRET=some-long-random-string
```
For local development without Atlas, you can also point `MONGODB_URI` at a local `mongod`
(e.g. `mongodb://localhost:27017/little-steps`).

**Getting a free MongoDB Atlas cluster:**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Database Access → add a user with a password
4. Network Access → allow access from anywhere (0.0.0.0/0) for development, or your host's IP for production
5. Connect → "Drivers" → copy the connection string into `MONGODB_URI`

## 3. Run the real end-to-end test (recommended before you build the frontend against it)
```bash
npm test
```
This spins up a real in-memory MongoDB, boots the actual API, and exercises the full flow:
register → list a centre → capacity-checked booking → verification review → check-in/out →
subscriptions → admin KPIs. If this passes, the backend is solid.

> Note: the first run downloads a MongoDB binary (~100MB) — needs a normal internet connection.

## 4. Run the dev server
```bash
npm run dev    # if you add nodemon, or:
node server.js
```
API will be live at `http://localhost:5000/api`. Try: `http://localhost:5000/api/health`

## API summary
| Area | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Centers | `GET /api/centers` (search/filter), `GET /api/centers/:id`, `GET /api/centers/mine`, `POST /api/centers`, `PATCH /api/centers/:id`, `POST /api/centers/:id/request-verification` |
| Caregivers | `GET /api/caregivers?center=`, `POST /api/caregivers` |
| Bookings | `POST /api/bookings` (capacity-checked), `GET /api/bookings/mine`, `GET /api/bookings/for-my-centers`, `PATCH /api/bookings/:id/respond`, `PATCH /api/bookings/:id/check-in`, `PATCH /api/bookings/:id/check-out` |
| Subscriptions | `POST /api/subscriptions`, `GET /api/subscriptions/mine`, `PATCH /api/subscriptions/:id/cancel` |
| Admin | `GET /api/admin/queue`, `PATCH /api/admin/centers/:id/review`, `PATCH /api/admin/caregivers/:id/review`, `GET /api/admin/overview` |

## Creating your first admin account
Public registration can only create `parent` or `center` accounts (on purpose — nobody should be
able to self-register as an admin). To create an admin, register a normal account, then flip its
role directly in the database:
```js
// in a mongo shell or Compass, against your database:
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Deployment
This is a plain Express app — it does **not** run as a Vercel serverless function well without
adaptation (long-lived DB connections don't fit the serverless model cleanly). Recommended:
- **Render** or **Railway**: connect this repo, set the env vars above, it auto-detects `npm start`.
- **AWS Elastic Beanstalk / EC2**: standard Node.js deployment, set the env vars, run `node server.js`
  behind a process manager like PM2.

Add a `start` script to `package.json` if your host expects one:
```json
"scripts": { "start": "node server.js" }
```

## What's intentionally out of scope (Phase 1)
- Payments (per the spec, deferred to a future phase)
- Maps/geocoding — `location.lat/lng` fields exist on Center but nothing populates or queries them yet
- Email/SMS notifications on booking status changes
- Refresh tokens / logout-everywhere (JWT is a simple 7-day bearer token)
