# Milestone 2 operator checklist (Supabase + Vercel)

These steps require dashboard access. Complete them after deploying the code changes in this milestone.

> Practical configuration checklist — not legal advice. Confirm Auth/SMTP/backups against your production risk posture.

## Supabase

1. **Project + keys**
   - Dashboard → Project Settings → API
   - Copy Project URL, `anon` key, and `service_role` key into Vercel (Production + Preview as appropriate)
   - Never expose `service_role` as a `NEXT_PUBLIC_*` variable

2. **Apply schema + RLS**
   - Prefer: `supabase db push` / linked CLI against Production after reviewing
     - [`supabase/migrations/20260717000000_workspace_rls.sql`](../supabase/migrations/20260717000000_workspace_rls.sql)
     - [`supabase/migrations/20260717000001_entitlements_feedback.sql`](../supabase/migrations/20260717000001_entitlements_feedback.sql)
   - Or paste [`scripts/workspace_schema.sql`](../scripts/workspace_schema.sql) and [`docs/supabase-schema.sql`](./supabase-schema.sql) into the SQL Editor
   - Confirm **Authentication → Policies / Security Advisor** shows RLS enabled on `projects`, `models`, `equations`, `runs`, `user_entitlements`

3. **Auth → Email**
   - Enable Email provider
   - Turn **on** “Confirm email” (email verification)
   - Enable password sign-in (default with Email provider)

4. **URL configuration**
   - Site URL: `https://your-production-domain`
   - Redirect URLs allowlist:
     - `https://your-production-domain/auth/callback`
     - `https://your-production-domain/auth/callback?next=/auth/reset-password`
     - `https://your-production-domain/account`
     - `https://your-production-domain/auth/reset-password`
     - Local: `http://localhost:3000/auth/callback` (and the same paths)

5. **SMTP (recommended for production)**
   - Auth → SMTP Settings: configure a verified sender
   - Without custom SMTP, Supabase rate-limits confirmation/reset mail aggressively

6. **Auth abuse controls**
   - Review Auth rate limits for sign-up / sign-in / recovery
   - Enable CAPTCHA (hCaptcha/Turnstile) before public launch if abuse is a concern

7. **Backups**
   - Pro plan or higher: enable **Point-in-Time Recovery** (Database → Backups)
   - Or document a scheduled logical dump + restore drill
   - Run one restore drill in a non-production project before launch

8. **Security Advisor**
   - After migrations, open Advisors and resolve leaked-password / RLS / insecure policy warnings that apply

## Vercel

1. **Environment variables** (separate Production / Preview / Development)
   - From [`.env.example`](../.env.example): set all required `NEXT_PUBLIC_*` and server secrets
   - Confirm `SUPABASE_SERVICE_ROLE_KEY`, `LICENSE_SIGNING_SECRET`, Stripe, and Resend keys are **server-only**
   - Set `NEXT_PUBLIC_APP_URL` to the production origin (no localhost fallback in prod)

2. **Sentry**
   - Create a Sentry project (Next.js)
   - Add `NEXT_PUBLIC_SENTRY_DSN` and optional `SENTRY_DSN` / `SENTRY_AUTH_TOKEN`
   - Redeploy after adding public DSN values

3. **Alerts**
   - Vercel → Observability / Logs: alert on 5xx spikes for `/api/*` and `/auth/*`
   - Sentry: alert on new issues + error-rate thresholds
   - Optional: uptime check against `GET /api/health`

4. **Deployment protection**
   - Protect Preview deployments so untrusted visitors cannot hit shared Preview secrets
   - Redeploy Production after changing build-time public env vars

## Smoke test (desktop + mobile)

After env + redirects are live:

1. Sign up with password → receive verification email → confirm → sign in
2. Magic link sign-in from Account and from the Guest menu
3. Forgot password → open email link → land on `/auth/reset-password` → set password → sign in
4. Profile: change display name and password on `/account`
5. Refresh the page and confirm session persists
6. Sign out → confirm guest mode; sign in as a second user on the same browser and confirm projects do not leak
7. Open `/api/health` and confirm `ok: true`
8. Repeat sign-in / reset on a phone-width viewport

## App env flags for Milestone 2

```bash
NEXT_PUBLIC_SUPABASE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SENTRY_DSN=...   # optional until monitoring is ready
```
