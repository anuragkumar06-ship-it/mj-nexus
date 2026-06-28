# MJ Nexus

**The AI-powered operating system for internship-driven teams — built for MJ Marketing Consultancy.**

MJ Nexus manages the complete candidate and intern lifecycle — recruitment, AI screening, interviews, onboarding, performance, certification, and analytics — across four distinct, interconnected role dashboards: **Intern, Team Lead, HR, and Management**.

> Premium glassmorphism UI · Brand palette (Deep Navy `#050B3D`, MJ Blue `#1D7FFF`, Sky Blue `#6BC5FF`) · Inter · rich motion.

---

## 🔌 Demo mode vs Live mode

The app **runs fully in demo mode out of the box** (no setup) and **automatically upgrades to live mode** when you add the matching environment variables — no code changes required.

| Capability | Demo (default) | Live (with keys) |
|---|---|---|
| Auth (email, phone OTP, Google, Microsoft) | Role picker, instant entry | **Real Supabase Auth** sessions |
| AI (assistant, candidate scoring, recommendations) | Deterministic offline answers | **Real OpenAI / Gemini** responses |
| File uploads (proof of work) | In-browser preview | **Supabase Storage** |
| Data | Realistic in-memory seed | Supabase Postgres (schema provided) |

The login screen shows a **Demo / Live** badge so you always know which mode is active. Check `/api/ai/health` to confirm what's configured.

## 🚀 Run locally

```bash
npm install
npm run dev          # http://localhost:3000  (demo mode)
npm run build && npm run start   # production build
```
> On Windows PowerShell use `npm.cmd` if `npm` is blocked by execution policy.

---

## 🟢 Go live

### 1) Supabase (database + auth + storage)
1. Create a project at **https://supabase.com** → New project.
2. **SQL Editor → New query** → paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**. This creates all tables, RLS policies, the profile trigger, and the `submissions` storage bucket.
3. **Authentication → Providers**: enable **Email**, **Phone** (add an SMS provider like Twilio for real OTP), **Google**, and **Azure (Microsoft)**.
   - For Google/Microsoft, create an OAuth app in the Google Cloud Console / Microsoft Entra and set the redirect URL to:
     `https://<your-project>.supabase.co/auth/v1/callback`
4. **Project Settings → API**: copy the **Project URL** and **anon public key**.

### 2) AI (OpenAI or Gemini)
- OpenAI key: https://platform.openai.com/api-keys
- or Gemini key: https://aistudio.google.com/app/apikey (set `AI_PROVIDER=gemini`)

### 3) Environment
Copy `.env.example` → `.env.local` and fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_PROVIDER=openai
OPENAI_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Restart `npm run dev` — the login badge flips to **Live** and AI calls hit the real model.

> After a user signs up, set their role in Supabase: `update public.profiles set role='management' where email='you@company.com';` (roles: `intern`, `lead`, `hr`, `management`).

## ▲ Deploy to Vercel
1. Push this repo to GitHub.
2. **vercel.com → New Project → import the repo** (framework auto-detected: Next.js).
3. **Settings → Environment Variables**: add every key from `.env.local` (set `NEXT_PUBLIC_SITE_URL` to your `https://…vercel.app` URL).
4. In Supabase **Auth → URL Configuration**, add your Vercel URL to **Site URL** and **Redirect URLs** (`https://…vercel.app/auth/callback`).
5. **Deploy.** Done.

---

## 🧩 What's inside

- **Roles & dashboards**: Intern (tasks + real file submissions, requests), Team Lead (assign + review submissions, feedback, escalations), HR (recruitment, AI engine, interviews, certificates), Management (people directory drill-down, approvals queue, analytics).
- **AI layer**: `src/lib/ai.ts` + `src/app/api/ai/*` (assistant, candidate scoring, recommendation letters) with OpenAI/Gemini and graceful fallbacks.
- **Auth**: `src/lib/supabase/*`, `src/app/auth/callback`, multi-method login.
- **Tech**: Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Recharts · Supabase.

## 🔁 Next step to full persistence
Auth, AI, and storage are wired for live. The app's business data (tasks, approvals, etc.) currently uses an in-memory store (`src/components/app/store.tsx`) seeded from `src/lib/org.ts`. To persist everything, swap those reads/writes for Supabase queries against the tables in `schema.sql` — the schema, RLS, and a storage helper (`src/lib/supabase/storage.ts`) are already in place.

---

© 2026 MJ Marketing Consultancy · MJ Nexus v1.0
