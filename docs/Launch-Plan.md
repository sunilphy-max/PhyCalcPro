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

## Phase 3 — Login (later)

Keep `NEXT_PUBLIC_FREE_LAUNCH=true`. Re-add Account to the navbar; simplify account page to sign-in + saved projects only.

## Phase 4 — Pro (later)

Unset or set `NEXT_PUBLIC_FREE_LAUNCH=false` on Production. Configure `STRIPE_*` env vars. Restore Pricing nav, PlanBadge, and Pro gating in selectors/export.

No solver changes required — only env, UI, and Stripe.
