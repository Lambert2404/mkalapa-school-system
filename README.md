# Mkalapa Secondary School Management System

**Student Contribution, Debt & SMS Management System**

A complete school management web application for Mkalapa Secondary School:
manage students, record monthly contributions in an embedded Excel-like
spreadsheet, automatically calculate outstanding debts, generate Swahili SMS
reminders for parents/guardians, and produce reports — all with **no login**
and **no online payments**. "Fedha" (money) is recorded manually by school
staff; nothing in this system processes real payments.

---

## 1. Project Overview

| | |
|---|---|
| **System name** | Mkalapa Secondary School Management System |
| **Purpose** | Track monthly student contributions (Mahindi/maize, Mboga/vegetables, Fedha/cash), detect debts, and notify parents by SMS |
| **Authentication** | None — the app opens directly on the Dashboard |
| **Payments** | None — contributions are recorded manually by staff after being physically submitted |

---

## 2. Features

- **Dashboard** — totals, class-by-class debt breakdown, monthly trend, top debtors, recent activity, all via Recharts
- **Students** — full CRUD, search, filter by class/stream/gender/status, per-student profile with contribution & SMS history
- **Spreadsheet** — an embedded AG Grid spreadsheet: edit submitted amounts inline, debt/status auto-calculate, add/delete rows, CSV/Excel import & export, import validation, downloadable template
- **Contributions** — manual entry form with a live Required/Submitted/Remaining calculation panel and duplicate-record prevention
- **Debts** — list of all students with outstanding contributions, bulk-select, "Send to Selected" / "Send to All Debtors"
- **SMS Management** — auto-generated Swahili debt-reminder & completion messages (only non-zero items are mentioned), custom SMS, full delivery history/log
- **Reports** — monthly, debt, SMS, and completed-students reports with CSV/Excel export
- **Settings** — school info, default monthly requirements (Mahindi/Mboga/Cash), SMS templates. Changing these **never** rewrites historical contribution records.

---

## 3. Architecture

```
React (Vite) Frontend
       |
       | REST API (Axios)
       v
Django REST Framework
       |
       +----------------> PostgreSQL
       |
       v
SMS Service (sms/services/sms_service.py)
       |
       v
SMSProvider (abstract) --> MockSMSProvider (dev) / NextSMSProvider (live)
       |
       v
NextSMS Gateway --> Parent/Guardian Phone
```

- The frontend **never** talks to the SMS gateway directly — everything goes through the Django API.
- The `SMSProvider` abstraction (`sms/providers/base.py`) makes it possible to add another gateway later without touching call sites.
- Debt calculations live in one place (`contributions/calculations.py`) and are reused everywhere; the frontend replicates the same MAX(0, required − submitted) logic client-side purely for instant UI feedback, but the backend is the source of truth on save.

---

## 4. Project Structure

```
mkalapa-school-system/
  backend/
    manage.py
    config/                 # settings, urls, wsgi/asgi
    students/                # Student model, API, phone normalization
    contributions/           # Contribution model, calculation engine, spreadsheet API, debts API
    sms/                     # SMSMessage model, providers/, services/sms_service.py
    reports/                 # reports + dashboard aggregation views
    settings_app/            # SystemSettings singleton, SMSTemplate
    requirements.txt
    .env.example
  frontend/
    src/
      components/            # Sidebar, Navbar, DataTable, Spreadsheet (AG Grid), forms, modals...
      pages/                 # Dashboard, Students, StudentProfile, Spreadsheet, Contributions, Debts, SMSManagement, Reports, Settings
      layouts/MainLayout.jsx
      services/               # api.js + one service per resource
      hooks/useToast.jsx
      utils/format.js
    package.json
    .env.example
  README.md
```

---

## 5. Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

## 6. Backend Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env with your local values
```

## 7. PostgreSQL Setup

```bash
# Create the database and user (adjust as needed)
createdb mkalapa_db
```

Set `DATABASE_URL` in `backend/.env`, e.g.:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mkalapa_db
```

(Or fill in the individual `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` variables instead.)

## 8. Environment Variables

**backend/.env** (see `backend/.env.example` for the full list):

```
DJANGO_SECRET_KEY=change-this
DJANGO_DEBUG=True
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mkalapa_db
CORS_ALLOWED_ORIGINS=http://localhost:5173

SMS_PROVIDER=mock              # mock (safe default) or nextsms
SMS_AUTH_METHOD=bearer         # bearer (recommended) or basic
SMS_ACCESS_TOKEN=
SMS_API_KEY=
SMS_API_SECRET=
SMS_SENDER_ID=MKALAPA
SMS_TEST_MODE=True
```

**frontend/.env**:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Never commit real `.env` files — only the `.env.example` templates are checked in.

## 9. Database Migrations

Migrations are already included in the repository (`*/migrations/0001_initial.py`), so you can go straight to:

```bash
cd backend
python manage.py migrate
```

If you change any models, regenerate with `python manage.py makemigrations`.

## 10. Creating Demo Data

```bash
python manage.py seed_demo_data
```

This creates 12 demo students with realistic Tanzanian names and a September 2026 contribution record each, covering every debt scenario: fully completed, Mahindi-only debt, Mboga-only debt, Cash-only debt, and multiple debts at once.

## 11. Running the Backend

```bash
python manage.py runserver 8000
```

API root: `http://localhost:8000/api/`

## 12. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` — it opens directly on `/dashboard` (no login).

---

## 13. SMS Configuration

By default `SMS_PROVIDER=mock`, which uses `MockSMSProvider` — no real SMS gateway is required to use every feature of the app. It randomly simulates Sent/Failed outcomes so you can test the full debt → SMS → history workflow safely.

To send real messages, set `SMS_PROVIDER=nextsms` and provide real credentials (see below).

## 14. NextSMS Integration

This project integrates with NextSMS's **Messaging Service API V2**
(docs: https://documenter.getpostman.com/view/1679195/2sAYkDP1XN).

- **Base URL:** `https://messaging-service.co.tz`
- **Auth (recommended):** Bearer token — `Authorization: Bearer <SMS_ACCESS_TOKEN>` (found in your NextSMS dashboard under *Customer Info → Customization → API Keys*)
- **Auth (alternative):** Basic auth — base64(`api_key:api_secret`)
- **Test Mode:** `POST /api/sms/v2/test/text/single` — free, dummy responses, no real SMS sent. Great for staging.
- **Live:** `POST /api/sms/v2/text/single`

Set in `backend/.env`:

```
SMS_PROVIDER=nextsms
SMS_AUTH_METHOD=bearer
SMS_ACCESS_TOKEN=your-real-token
SMS_SENDER_ID=MKALAPA SEC
SMS_TEST_MODE=True   # switch to False when ready to send real SMS
```

> **Note:** The public NextSMS documentation page renders its full request/response body schema via JavaScript, which could not be fully machine-read while building this integration. `sms/providers/nextsms.py` implements the documented authentication, endpoints, and the full status-code interpretation table (groups 18/19/20/22) from the docs. Before going fully live, open your NextSMS Postman collection (linked from the same documentation page) and confirm the exact request field names (`from`/`to`/`text`) match your account, adjusting `NextSMSProvider._build_payload` if needed.

All SMS attempts — success or failure — are logged in the `SMSMessage` table with the gateway's raw response, visible in **SMS Management → History**.

## 15. Production Deployment

**Frontend (Netlify or Vercel):**
```bash
cd frontend
npm run build       # outputs to dist/
```
Set the environment variable `VITE_API_BASE_URL` to your deployed backend's URL in the Netlify/Vercel dashboard.

**Backend (Render / Railway / VPS):**
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application
```
Set `DJANGO_DEBUG=False`, a real `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS` (your frontend's deployed URL), and the `SMS_*` variables in your host's environment variable settings — never in code.

**Database:** any managed PostgreSQL instance (Render Postgres, Railway Postgres, RDS, etc.) — just point `DATABASE_URL` at it.

## 16. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `CORS` errors in the browser console | Add your frontend origin to `CORS_ALLOWED_ORIGINS` in backend `.env` |
| "This student already has a contribution record for this month." | Expected behavior (Rule: one record per student/month/year) — edit the existing record from the Spreadsheet or Debts page instead |
| SMS always shows `FAILED` | If `SMS_PROVIDER=mock`, this is expected ~10% of the time (simulated). If `SMS_PROVIDER=nextsms`, check `SMS_ACCESS_TOKEN`/`SMS_API_KEY`, `SMS_TEST_MODE`, and the `error_message`/`gateway_response` columns in SMS history |
| `psycopg2` install fails | Install PostgreSQL client dev headers for your OS, or use the `psycopg2-binary` wheel already pinned in `requirements.txt` |
| Spreadsheet import rejects a file | Check the validation error toast — it names the row and problem (e.g. negative quantity); fix the source file and re-import |
| Settings change didn't update old records | Expected — historical contribution records snapshot their required values at creation time and are never silently rewritten |

---

## Business Rules Reference

1. Default monthly requirements: Mahindi 10 Kg, Mboga 5 Kg, Cash TSh 15,000 (configurable in Settings, applies to future records only)
2. All contributions are entered manually by staff
3. No online payment of any kind
4. No authentication of any kind
5. Debt is never negative — `MAX(0, required − submitted)`
6. Mahindi and Mboga are always in KG
7. Cash is always in TSh
8. Kg and TSh are never combined into one "total debt" number
9. SMS messages only mention items that actually have outstanding debt
10. Zero outstanding contribution = COMPLETED status
11. Changing Settings requirements does not retroactively change historical records
12. SMS gateway credentials live only in backend environment variables, never in frontend code or Git history
