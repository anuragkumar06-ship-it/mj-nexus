# 🚀 Go Live — 100% Free, Step by Step

This guide takes MJ Nexus from your laptop to a **live website on the internet**, using only **free** services. Follow the parts in order. Total time: ~20–40 minutes.

> **What's free vs not — read this first**
> - ✅ **Hosting** (Vercel) — free
> - ✅ **AI** — use **Google Gemini** (free tier). ❌ *Don't* use OpenAI — it costs money.
> - ✅ **Login: Email, Google, Microsoft** — free.  ❌ *Skip* **Phone/SMS login** — it needs a paid SMS service.
> - ✅ **Database + accounts** (Supabase) — free tier.
>
> Following this guide, **you will not pay anything.**

---

## ⭐ Part 1 — Put the code on GitHub (free)

1. Create a free account at **https://github.com** (skip if you have one).
2. Click the **+** (top right) → **New repository**. Name it `mj-nexus`, keep it **Public** or **Private**, click **Create repository**.
3. On your computer, open a terminal in the `mj-nexus` folder and run (replace `YOUR-NAME`):
   ```bash
   git add .
   git commit -m "MJ Nexus"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/mj-nexus.git
   git push -u origin main
   ```
   > If git asks you to log in, use your GitHub username + a **Personal Access Token** (GitHub → Settings → Developer settings → Tokens). Or install **GitHub Desktop** (free) and "Add" → "Publish" the folder — no commands needed.

✅ Your code is now on GitHub.

---

## ⭐ Part 2 — Deploy to the internet with Vercel (free) — *this makes it LIVE*

1. Go to **https://vercel.com** → **Sign up** → **Continue with GitHub** (free "Hobby" plan).
2. Click **Add New… → Project**.
3. Find your **`mj-nexus`** repo → **Import**.
4. Leave everything default (Vercel auto-detects Next.js) → click **Deploy**.
5. Wait ~1 minute. You'll get a live URL like **`https://mj-nexus-xxxx.vercel.app`** 🎉

✅ **It's live!** Open the URL — the landing page, all 4 role dashboards, the AI assistant, certificates, charts, and animations all work, and **your data is saved in your browser** (nothing resets on refresh). At this point login is in **Demo mode** (pick a role and enter).

> Every time you `git push`, Vercel re-deploys automatically.

---

## ⭐ Part 3 — Turn on real AI for free (Google Gemini)

1. Go to **https://aistudio.google.com/app/apikey** → sign in with a Google account → **Create API key** → copy it.
2. In **Vercel** → your project → **Settings → Environment Variables**. Add these two:
   | Name | Value |
   |---|---|
   | `AI_PROVIDER` | `gemini` |
   | `GEMINI_API_KEY` | *(paste your key)* |
3. Go to **Deployments → ⋯ (latest) → Redeploy**.

✅ The **Ask AI** assistant and the certificate **AI rewrite** now use a real AI model. Verify by visiting `https://your-url.vercel.app/api/ai/health` — it should say `"ai":{"configured":true}`.

---

## ⭐ Part 4 (optional) — Real accounts + shared database (Supabase, free)

This gives you **real email logins** and a **shared database** (data visible across devices/users). Skip it if browser-saved data is enough.

1. Create a free project at **https://supabase.com** → **New project** (pick a strong DB password, any region). Wait ~2 min for it to start.
2. **SQL Editor → New query** → open the file **`supabase/schema.sql`** from this project, copy ALL of it, paste, and click **Run**. (Creates tables, security rules, and the file-upload bucket.)
3. **Authentication → Sign In / Providers**:
   - **Email**: turn ON. *(Tip: under "Email" settings you can turn OFF "Confirm email" so sign-ups are instant.)*
   - **Google / Microsoft**: optional — see Part 4b below. **Leave Phone OFF** (it needs paid SMS).
4. **Project Settings → API** → copy **Project URL** and **anon public** key.
5. In **Vercel → Settings → Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | *(your Project URL)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your anon public key)* |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-url.vercel.app` |
6. **Redeploy** (Deployments → ⋯ → Redeploy).
7. In **Supabase → Authentication → URL Configuration**: set **Site URL** to your Vercel URL, and add `https://your-url.vercel.app/auth/callback` to **Redirect URLs**.

✅ The login screen now shows a green **Live** badge. Create an account with email + password and sign in for real.

### Set your role (after first sign-up)
New accounts start as `intern`. To make yourself **management** (or hr/lead): Supabase → **SQL Editor** → run:
```sql
update public.profiles set role = 'management' where email = 'you@example.com';
```
(roles: `intern`, `lead`, `hr`, `management`)

### Part 4b (optional) — Google / Microsoft sign-in (free, more steps)
- **Google**: Google Cloud Console → APIs & Services → Credentials → Create **OAuth client ID** (Web). Add the redirect URL shown in Supabase (Authentication → Providers → Google). Paste the Client ID + Secret into Supabase. Free.
- **Microsoft**: Azure Portal → Microsoft Entra ID → App registrations → New. Add the redirect URL from Supabase (Providers → Azure). Paste Application (client) ID + secret into Supabase. Free.

---

## 💸 Cost check
| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | **Free** |
| Google Gemini | Free tier | **Free** |
| Supabase | Free | **Free** |
| Google/Microsoft OAuth | — | **Free** |
| Phone/SMS login | *skipped* | (would be paid) |

**Total: ₹0 / $0.**

## 🆘 Troubleshooting
- **AI still says demo** → check `/api/ai/health`; make sure `AI_PROVIDER=gemini` + `GEMINI_API_KEY` are set in Vercel and you **redeployed**.
- **Login still shows "Demo"** → the two `NEXT_PUBLIC_SUPABASE_*` vars must be set in Vercel, then redeploy.
- **OAuth redirect error** → the Redirect URL in Supabase must exactly match `https://your-url.vercel.app/auth/callback`.
- **Build fails on Vercel** → it builds locally with `npm run build`; make sure all files were pushed to GitHub.
