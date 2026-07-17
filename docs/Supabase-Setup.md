# Supabase setup (guest + signed-in history)

PhyCalcPro ships with Supabase integration **disabled by default**. The site works fully in **guest mode** until you add credentials.

Public guide (in-app): `/documentation/supabase`

For production Auth/RLS/backups/SMTP steps, see [Auth-Security-Operator-Checklist.md](./Auth-Security-Operator-Checklist.md).

## Checklist

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Apply migrations (preferred) or run SQL in the editor:
   - [`supabase/migrations/`](../supabase/migrations/) or
   - [`scripts/workspace_schema.sql`](../scripts/workspace_schema.sql) + optional [`docs/supabase-schema.sql`](./supabase-schema.sql)
3. Enable **Email** auth (password + magic link), require email confirmation, and set redirect URLs to:
   - `{APP_URL}/auth/callback`
   - `{APP_URL}/account`
   - `{APP_URL}/auth/reset-password`
4. Set environment variables (local `.env.local` and Vercel) — see [`.env.example`](../.env.example):

```bash
NEXT_PUBLIC_SUPABASE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_FREE_LAUNCH=true
```

5. Redeploy or restart `npm run dev`.

## Setup status in the app

| `NEXT_PUBLIC_SUPABASE_ENABLED` | URL + anon key | Result |
|-------------------------------|----------------|--------|
| unset / false | — | Guest mode only; Account shows setup panel |
| `true` | missing | Pending — fix env vars and redeploy |
| `true` | set | Sign-in live on `/account` |

## Auth routes

| Path | Purpose |
|------|---------|
| `/account` | Profile, password, sign-in |
| `/auth/callback` | Email link code exchange |
| `/auth/verify` | Resend verification |
| `/auth/forgot-password` | Request reset |
| `/auth/reset-password` | Set new password after recovery link |
| `/auth/error` | Expired/invalid link messages |
| `/api/health` | Readiness probe |

## Related docs

- [Auth-Security-Operator-Checklist.md](./Auth-Security-Operator-Checklist.md) — production Auth, backups, Sentry, Vercel
- [Launch-Plan.md](./Launch-Plan.md) — Phase 3 login while keeping free launch
- [Feedback-Setup.md](./Feedback-Setup.md) — optional `user_feedback` table
