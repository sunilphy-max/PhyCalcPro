# Free launch → login → Pro

## Phase 1 — Free launch (current)

Set on **Vercel Production** (and locally in `.env.local`):

```bash
NEXT_PUBLIC_FREE_LAUNCH=true
```

Effects:

- `allFeaturesUnlocked()` — US / EU / ISO design standards and PDF export for every visitor
- `isMonetizationEnabled()` is false — navbar hides Pricing and Account; PlanBadge and Pro upsells hidden
- `/pricing` redirects to `/products`
- Stripe billing API routes stay deployed but are not linked from the UI

Do **not** use `NEXT_PUBLIC_VALIDATION_MODE=true` on public production (shows a testing banner).

## Phase 3 — Login (current)

Keep `NEXT_PUBLIC_FREE_LAUNCH=true`. Account and Projects show guest vs cloud sign-in UX.

1. Deploy as-is — guests use session history; no Supabase keys required yet.
2. When ready, follow [Supabase-Setup.md](./Supabase-Setup.md) and set env vars on Vercel.
3. In-app guide: `/documentation/supabase`

Effects once Supabase is configured:

- Email magic-link sign-in on `/account`
- Saved projects and calculation history sync to cloud for signed-in users
- Guests unchanged (session-only until tab closes)

## Phase 4 — Pro (later)

Unset or set `NEXT_PUBLIC_FREE_LAUNCH=false` on Production. Configure `STRIPE_*` env vars. Restore Pricing nav, PlanBadge, and Pro gating in selectors/export.

No solver changes required — only env, UI, and Stripe.
