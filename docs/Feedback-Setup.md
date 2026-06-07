# User feedback — setup

The Support page (`/support`) includes a form: **email + message**. Submissions are delivered through one or both channels below.

## Option A — Email (recommended for launch)

Uses [Resend](https://resend.com) (HTTP API, no extra npm package).

**Vercel env vars:**

```bash
RESEND_API_KEY=re_xxxxxxxx
FEEDBACK_NOTIFY_EMAIL=you@yourdomain.com
RESEND_FROM_EMAIL=PhyCalcPro <feedback@yourdomain.com>
```

- `FEEDBACK_NOTIFY_EMAIL` — where you receive messages (defaults to `support@phycalcpro.com`)
- `RESEND_FROM_EMAIL` — must be a verified sender/domain in Resend
- Replies go to the submitter’s email via `reply_to`

## Option B — Supabase table (archive + dashboard)

Run the `user_feedback` block in `docs/supabase-schema.sql`, then set:

```bash
NEXT_PUBLIC_SUPABASE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

View rows in **Supabase → Table Editor → user_feedback**.

## Local development

Without Supabase or Resend, submissions are saved as JSON under `data/feedback/` (gitignored).

## API

`POST /api/feedback` — body: `{ "email", "message", "pageUrl?" }`

Rate limit: one submission per IP per minute.
