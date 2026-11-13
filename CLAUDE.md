# Kitchen Worktop CRM — project notes for Claude

React 19 + Vite SPA frontend (this repo, `kitchen-worktop-crm`), deployed to Vercel. Its real backend is a separate repo, `kitchen-worktop-crm-api`, deployed on Railway (see "Backend"). This repo also has a small Express mock API in `server/` for local development. Uses react-router-dom for routing, axios for HTTP, jsPDF for quote PDFs.

## Commands

- `npm run dev` — Vite dev server (frontend only, port 5173)
- `npm run server` — mock API on port 5000 (`server/index.js`)
- `npm run dev:all` — frontend + mock API together (uses `concurrently`)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (flat config in `eslint.config.js`; `server/` uses Node globals)
- `npm test` — quote maths tests in `tests/` (Node's built-in test runner, no extra dependencies)

## Layout

- `src/App.jsx`, `src/main.jsx` — app root and routing
- `src/pages/` — route pages: Dashboard, Jobs, LeadDetail, NewLead, Reports, PricingSettings, Login, VerifyEmail, ForgotPassword, ResetPassword
- `src/components/` — shared UI (Navbar, Sidebar, KanbanBoard, JobCalculator, SelectedMaterialField)
- `src/api/` — API modules: `client.js` (shared axios instance: attaches token, handles 401/403), `auth.js` (login, logout, verify, forgot/reset, `errorMessage`), `leads.js`, `pricing.js`
- `src/hooks/usePricing.js` — loads pricing settings from the API
- `src/utils/pricing.js` — quote maths (slab cost, cutting, markup, VAT). Pure functions, no API calls.
- `src/utils/generateQuotePdf.js` — quote PDF export
- `src/constants.js` — statuses and sources
- `server/` — mock API for local dev: `index.js` (routes), `data.js` (in-memory leads), `auth.js` (users, sessions, lockout, verify/reset), `pricing.js` (settings with validation), `mailer.js` (console only), `create-user.js`. Runtime files `server/users.json`, `server/pricing.json` and `server/uploads/` are git-ignored.
- `public/slabs/` — material images (`.webp`)

## Backend (`kitchen-worktop-crm-api`)

- Path: `C:\Users\mimor\OneDrive\Desktop\Projects\kitchen-worktop-crm-api`. Express 5 (CommonJS), Prisma 7 on Postgres (`@prisma/adapter-pg`), bcryptjs, jsonwebtoken, Cloudinary for lead photos.
- Routes: `/api/auth` (login, verify, forgot, reset), `/api/leads`, `/api/pricing`, `/health`.
- Auth helpers live in `src/authUtils.js`; middleware in `src/middleware/`. Session JWTs last 8 hours and carry a `tv` (token version) that a password reset bumps.
- No public sign-up. Create accounts with `"password" | node scripts/create-user.js <email>`.
- Environment variable names: `DATABASE_URL`, `JWT_SECRET` (at least 32 characters; the server refuses to start otherwise), `API_KEY` (website lead form), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL` (base URL for email links), `NODE_ENV`. Never print or commit their values.
- Do not set `NODE_ENV=production` until an email provider is added in `src/mailer.js`. Production refuses to send to the console.
- Migrations: `prisma/migrations/`. Apply with `npx prisma migrate deploy`. Never run migrations or scripts against the production database without asking first.
- Tests: `npm test` runs `tests/` with Node's built-in runner. Route tests use in-memory fakes for Prisma and Cloudinary, so they never touch the database or Cloudinary. Keep it that way.
- Input rules live in `src/validation.js`. Add new lead fields there, or the route will drop them.

## Configuration

- Frontend reads the backend base URL from `import.meta.env.VITE_CRM_API_URL` (set in `.env`, which is git-ignored). Locally it points at the mock API (`http://localhost:5000`); in production it points at the Railway backend. Never hardcode `localhost` in API calls.
- Login needs a real account on whichever API is in use. The mock API has no default user. Create one with `server/create-user.js`, then verify the email using the link printed in the API console.
- Pricing settings are stored by the API (`/api/pricing`). Nothing is hardcoded in the frontend. The calculator and material list show "Failed to load pricing" if the API doesn't serve the route.

## Conventions

- Put API calls in `src/api/`, not directly in components or pages.
- Auth token lives in `localStorage` under the key `token`. Logout clears it locally. On 401/403 from the API, the token is cleared and the user redirected to login.
- API errors use `error` on the real backend and `message` on the mock. Read both with `errorMessage()` from `src/api/auth.js`.
- Lead photo uploads are served from Cloudinary URLs; the mock server stores uploads locally.

## Code navigation

- A `.codegraph/` index exists at the repo root. Use `codegraph explore "<names or question>"` (or the `codegraph_explore` MCP tool) before grep/read when locating or understanding code.

## Git

- Default branch: `main`. Work on feature branches (e.g. `fix/...`, `feat/...`).
- Commit messages: short imperative subject, lowercase start (matches existing history).

# CLAUDE.md

## Project

A CRM to manage leads coming from Kitchenworktopexperts.com

## Lead access (team model)

- Every signed-in staff member can view and edit every lead, photo, activity note and pricing setting. Do not add per-lead ownership or role checks unless the team decides on a different model.
- A lead's `userId` records the staff member who created it, for audit only. It is null for website leads, which arrive through the `x-api-key` route.
- Creator is set on the server from the signed-in user. Requests must never change it.
- Authentication is still required on every route except the website lead POST.

## Mobile firendly 
- App should be mobile firendly 


## Working conventions

- Enforce all permission and visibility rules on the server, never only in the UI.
- Write tests for the order state machine and for message redaction.
- Ask before adding major dependencies or changing the rules above.
- Comment code with brief, concise comments that explain what the code does or why. Skip comments that just restate the code.



## Security
- Act as a senior security engineer. Review the authentication system of the project before a push and keep it secure. Ensure password are securely hashed, sessions expire, email verification in enabled, password reset tokens expire, login attempts are rate limited and authentication secrets are never exposed to the frontend. Refactor any insecure authentication logic. 
- Review all API endpoints and database queries. Every lead, photo, activity and pricing route requires a signed-in user. Lead access is team-wide (see "Lead access" below), so there are no per-lead ownership checks. Still verify that each request targets a real record and that no request can change another user's data (for example, the lead creator).
- configure the application for secure deployment. Enforce HTTPS, ensure secrets are stored securely, restrict direct database access from the public internet, and add logging for authentication attempts, API errors, and unusual traffic patetrns so suspicious behavoir can be detected.
- before each push, scan the entire project for secrets and credentials. Ensure API keys, database service keys, and tokens are are never comitted to the repository. Move all secrets to secure enviroment variables and sure they are only used on the server. 
- Identify every place where user input enters the system including forms, APIs, uploads and query parameters. Add strict validation and sanitation to prevent SQL injection, command injection, script injection, and unsafe file uploads. Reject invalid data and enforce strict input types 