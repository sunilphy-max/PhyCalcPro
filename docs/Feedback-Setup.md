# User feedback — setup

The Support page (`/support`) includes a form: **email + message**. Submissions are delivered through one or both channels below.

## Option A — Email (recommended for launch)

Uses [Resend](https://resend.com) (HTTP API, no extra npm package).

**Vercel env vars:**

```bash
RESEND_API_KEY=re_xxxxxxxx
FEEDBACK_NOTIFY_EMAIL=sunilphy@gmail.com
RESEND_FROM_EMAIL=PhyCalcPro <feedback@yourdomain.com>
```

- `FEEDBACK_NOTIFY_EMAIL` — where you receive messages (defaults to `sunilphy@gmail.com`)
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

## Troubleshooting “Feedback is not configured”

This means **both** email and database storage failed. Email-only is enough — you do **not** need Supabase.

1. **Redeploy after adding env vars** — Vercel only picks up new variables on a new deployment.
2. **Exact variable names** (case-sensitive):
   - `RESEND_API_KEY` — your `re_...` key
   - `FEEDBACK_NOTIFY_EMAIL` — your inbox (not `FEEDBACK_NOTIFY`)
   - `RESEND_FROM_EMAIL` — verified sender, e.g. `PhyCalcPro <onboarding@resend.dev>` for testing
3. **Resend test sender** — `onboarding@resend.dev` can only send to the email address on your Resend account until you verify your own domain.
4. **Production sender** — verify `phycalcpro.com` (or your domain) in Resend, then use e.g. `PhyCalcPro <feedback@phycalcpro.com>`.
5. Check **Vercel → Deployments → Functions** logs for `[feedback] Resend error:` lines after a test submit.
