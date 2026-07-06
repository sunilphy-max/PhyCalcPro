# Supabase setup (guest + signed-in history)

PhyCalcPro ships with Supabase integration **disabled by default**. The site works fully in **guest mode** until you add credentials.

Public guide (in-app): `/documentation/supabase`

## Checklist

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Run [`scripts/workspace_schema.sql`](../scripts/workspace_schema.sql) in the SQL Editor.
3. Enable **Email** auth (magic link) and set redirect URLs to `{APP_URL}/account`.
4. Set environment variables (local `.env.local` and Vercel):

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

## Related docs

- [Launch-Plan.md](./Launch-Plan.md) — Phase 3 login while keeping free launch
- [Feedback-Setup.md](./Feedback-Setup.md) — optional `user_feedback` table in `supabase-schema.sql`
