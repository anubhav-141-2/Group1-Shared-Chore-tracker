# Fair Split — Technical Walkthrough & Project Documentation

A technical, file-by-file guide to what has been built in this repository.
No source code is reproduced here; this document explains the structure, responsibilities, and behavior of each part.

---

## 1. Project Overview

**Fair Split** is a full-stack web application that lets a household track shared expenses and chores in one place, and computes a single combined "fairness balance" per member (money owed + chore credit).

**Implemented scope (current state):**
- User registration / login with password hashing and JWT sessions
- Household creation with a shareable invite code, and joining via invite code
- Expense logging with automatic equal split among selected members
- Chore list with point values and a completion/leaderboard system
- Manual settlements between two members (cash paid outside the app)
- Combined fairness balance endpoint with a per-member breakdown
- Admin controls: remove members, regenerate invite code
- Role system: admin vs. member
- Member bans (removed members cannot rejoin a household)
- Chore leaderboard with per-member point totals

**Not yet implemented (from the product brief):** editing/deleting entries with grace period, filtered history by person/date range, weekly email summaries, auto-rotation of chores, receipt photo uploads, real payment integrations (out of scope by design).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite 8 (build/dev server), Oxlint |
| Backend | Python 3, Flask 3, Flask-CORS, PyJWT, bcrypt, mysql-connector-python, python-dotenv |
| Database | MySQL 8 (`fair_split` database) |
| Auth | JWT bearer tokens (HS256) stored in browser `sessionStorage` |
| API style | REST, JSON over HTTP, all routes under `/api` |

---

## 3. Architecture Overview

```
Browser (React SPA)
      │  fetch() → /api/...  (JWT in Authorization header)
      ▼
Vite dev server (port 5173) — proxies /api → backend
      ▼
Flask backend (port 3001)
      │
      ▼
MySQL database `fair_split` (9 tables)
```

- The frontend never talks to MySQL directly; everything goes through the Flask REST API.
- The Vite dev server proxies `/api` requests to `localhost:3001`, so the browser only ever talks to one origin (no CORS issues in dev).
- Auth is stateless on the backend: each request carries a signed JWT; the user id is decoded from the token.

---

## 4. Backend Walkthrough (`backend/`)

### 4.1 `db.py`
- Reads database connection settings from environment variables (`.env` files).
- Defaults: host `localhost`, user `root`, empty password, database `fair_split`, port `3306`.
- Exposes a single `get_connection()` function that returns a new MySQL connection per call; `autocommit` is off, meaning the app explicitly commits transactions.
- Loads `.env` from either `backend/.env` or `backend/db/.env` (whichever exists).

### 4.2 `app.py` (the entire backend)
One file contains the whole API. Key cross-cutting helpers:
- `serialize()` — converts Decimal and datetime values to JSON-friendly types before responses are sent.
- `json_error()` — uniform error response shape: `{ "error": "message" }` with an HTTP status code.
- `get_user_id_from_request()` — extracts and validates the Bearer token, returning the user id or raising a permission error.

**Auth endpoints:**
- `POST /api/auth/register` — validates name/email/password, rejects duplicate emails (409), hashes the password with bcrypt, stores the user, returns a JWT + user object.
- `POST /api/auth/login` — looks up by email, verifies bcrypt hash, returns JWT + user object; uniform "Invalid email or password" error for both unknown email and wrong password (no account enumeration).
- `GET /api/auth/me` — returns the logged-in user plus their current household (if any) with role and invite code. Used by the frontend on every page load to restore the session.

**Household endpoints:**
- `POST /api/households` — creates a household, generates an 8-character uppercase invite code, auto-adds the creator as admin, and seeds the household with 10 default chores (each with a point value, e.g. cleaning the kitchen 100 pts, mop the floor 200 pts).
- `POST /api/households/join` — joins by invite code; rejects invalid codes (404), duplicate membership (409), being in another household already (409), and banned users (403).
- `GET /api/households/<id>/members` — list of members with role, join date, user info.
- `DELETE /api/households/<id>/members/<memberId>` — admin only; cannot remove the admin or yourself; banned target user from rejoining.
- `PUT /api/households/<id>/invite` — admin only; regenerates the invite code.

**Expense endpoints:**
- `GET /api/households/<id>/expenses` — list of non-archived expenses, newest first, each with its per-member share breakdown.
- `POST /api/households/<id>/expenses` — creates an expense; splits the amount equally among selected members (defaults to all current members); rounding remainder is assigned to the first share so shares always sum exactly to the total.
- `PUT /api/households/<id>/expenses/<expenseId>` — payer can edit amount/description/date; when the amount changes, all existing shares are recomputed proportionally with the same rounding rule.
- `DELETE /api/households/<id>/expenses/<expenseId>` — owner or admin; soft-delete via an `archived` flag (history stays auditable).

**Chore endpoints:**
- `GET /api/households/<id>/chores` — list of chores with point values.
- `POST /api/households/<id>/chores` — any member can add a chore with a name and point value.
- `POST /api/households/<id>/chores/<choreId>/complete` — records a completion (who did it, when) and returns the points earned.
- `GET /api/households/<id>/chores/leaderboard` — sums points per member, computes a "net" score (own points vs. fair share = total points ÷ member count) and sorts descending.

**Settlement endpoints:**
- `GET /api/households/<id>/settlements` — payment history with payer/payee names.
- `POST /api/households/<id>/settlements` — logs a cash payment from one member to another (amount + optional date). Any member can log.

**Balance endpoint:**
- `GET /api/households/<id>/balance` — the heart of the app. Computes:
  - **Money balance**: total you paid (as payer) minus your shares of others' expenses.
  - **Net settlements**: what you paid out in cash minus what you received.
  - **Chore credit**: your completed points minus your fair share (total points ÷ member count).
  - **Combined balance**: money balance + net settlements (money side only; chore credit is reported separately).
  - A **per-member breakdown**: for each other member, how much you paid toward them, how much they paid toward you, and their chore completion count.

### 4.3 `requirements.txt`
Pins the exact Python package versions (Flask, CORS, PyJWT, bcrypt, MySQL connector, dotenv).

### 4.4 `db/schema.sql`
The complete database definition, in this order:
- `users` — id, name, unique email, bcrypt password hash, created_at.
- `households` — id, name, unique invite code, created_at.
- `members` — household + user join table with `role` enum (admin/member), unique per (household, user); cascades on delete.
- `expenses` — payer, amount, description, date, `archived` soft-delete flag.
- `expense_shares` — per-member share amounts, unique per (expense, member).
- `chores` — name, points, frequency, weight, optional assignee/due date fields, active flag.
- `chore_completions` — who completed which chore and when.
- `household_bans` — banned (household, user) pairs.
- `settlements` — from/to member, amount, date.

All tables are linked with foreign keys that cascade on household/user deletion, keeping the ledger consistent.

### 4.5 `.env` (created during setup, not in git)
Holds `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `JWT_SECRET`.

---

## 5. Frontend Walkthrough (`frontend/`)

### 5.1 Configuration
- `vite.config.js` — React + Tailwind plugins; dev server on port 5173; proxies `/api` to `http://localhost:3001`.
- `package.json` — scripts: `dev`, `build`, `lint` (Oxlint), `preview`.
- `.oxlintrc.json` — linting rules.

### 5.2 `src/api.js`
The single API client module. One shared `request()` helper:
- Attaches the JWT from `sessionStorage` as a Bearer token.
- Sends/receives JSON.
- Unwraps errors and throws them with the backend's error message.
- Exports grouped objects: `auth`, `households`, `expenses`, `chores`, `settlements`, `balance` — one function per backend endpoint.

### 5.3 `src/context/AuthContext.jsx`
React context that holds the whole session state:
- On mount, reads the token from `sessionStorage` and calls `/auth/me` to restore the user + household.
- Exposes `login`, `register`, `logout`, and `refreshHousehold` (re-fetches household info, e.g. after joining).
- All pages consume this context via `useAuth()`.

### 5.4 `src/App.jsx`
Router setup. All pages are wrapped in a shared `Layout`. Routes:
- Public: `/` (Home), `/login`, `/register`.
- Protected (require a logged-in user): `/household/create`, `/household/join`, `/dashboard`, `/expenses`, `/chores`, `/settlements`, `/settings`.
- `ProtectedRoute` shows a loading state while the session restores, and redirects to `/login` if unauthenticated.
- Unknown paths redirect to `/`.

### 5.5 `src/components/Layout.jsx`
The app shell — shared navigation/header shown on every page (nav links to Dashboard, Expenses, Chores, Settlements, Settings).

### 5.6 Pages (`src/pages/`)
| Page | Purpose |
|---|---|
| `Home.jsx` | Landing/entry screen; routes to login/register, or into the app if already logged in. |
| `Login.jsx` / `Register.jsx` | Auth forms that call the API and store the token in session. |
| `CreateHousehold.jsx` | Creates a household, shows the generated invite code. |
| `JoinHousehold.jsx` | Joins via invite code form. |
| `Dashboard.jsx` | Shows the combined fairness balance, money balance, net settlements, chore credit, and the per-member breakdown table. |
| `Expenses.jsx` | Expense list (date, description, payer, amount, per-person share) + add expense form with split-with selection; edit/delete for owned entries. |
| `Chores.jsx` | Chore list with point values, "complete" buttons, add-chore form, and the leaderboard. |
| `Settlements.jsx` | Settlement history and a form to log a payment between two members. |
| `HouseholdSettings.jsx` | Member list, remove-member (admin), invite code display/regeneration (admin). |

### 5.7 Styling
Tailwind CSS 4 via the Vite plugin; global styles in `src/index.css`.

---

## 6. Key Business Rules Implemented

1. **One household per user (MVP rule)** — enforced server-side on join/create.
2. **Exact split sums** — shares always total the expense amount; rounding remainder goes to the first share.
3. **Soft deletes** — expenses are archived, never hard-deleted, so history stays auditable.
4. **Fair chore score** — chore credit = your points − (total points ÷ member count), so a member who does exactly their share nets zero.
5. **Admin powers** — remove members, regenerate invite codes; any member can add chores, log expenses/settlements, and mark chores done.
6. **Bans** — removed members cannot rejoin that household.
7. **Combined balance** — money balance adjusted by cash settlements; chore credit shown alongside, not blended, so the breakdown stays transparent.

---

## 7. How to Run (summary)

1. **Database**: run `backend/db/schema.sql` against MySQL (creates `fair_split` and all 9 tables).
2. **Backend**: create a virtualenv in `backend/`, install `requirements.txt`, ensure `backend/.env` has the DB credentials, then run `app.py` — serves on port 3001.
3. **Frontend**: `npm install` then `npm run dev` in `frontend/` — serves on port 5173.
4. Open `http://localhost:5173`, register a user, create a household, and the app is usable end to end.

---

## 8. Known Notes & Quirks

- The schema previously contained a redundant migration statement that broke fresh installs; it has been removed.
- The backend runs with Flask's debug mode on (`debug=True`), which is fine for development but should be disabled for production, and `JWT_SECRET` should be a real secret.
- CORS is open (`origins: *`) for API routes — acceptable for dev, restrict before deploying.
- Frontend `npm install` reported 2 high-severity vulnerabilities in the dev dependency tree; no action taken, worth auditing before production.
- Chore frequency/weight/assignee fields exist in the schema but the current API surface uses the simpler `points` model; the full rotation concept from the brief is not yet wired up.
