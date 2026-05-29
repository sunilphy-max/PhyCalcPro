# Phase 3 — Site, support, and monetization

Phase 3 makes PhyCalcPro a **professional public product** with clear pricing, legal pages, and optional **Stripe** revenue (donations + Pro license).

## What ships in this phase

| Area | Deliverable |
|------|-------------|
| **Marketing** | `/pricing`, `/support`, `/documentation` |
| **Legal** | `/legal/terms`, `/legal/privacy` |
| **Billing** | Stripe Checkout (donation one-time, Pro subscription) |
| **Entitlements** | Free vs Pro feature gates |
| **Activation** | `/billing/success` verifies Checkout session server-side |

## Plans

| Plan | Price (configurable) | Includes |
|------|----------------------|----------|
| **Free** | $0 | All modules, **Indicative** design code, CSV export |
| **Supporter** | One-time donation | Thank-you badge; same features as Free (configurable later) |
| **Pro** | Monthly subscription | **US / EU / ISO** design codes, **PDF export** with engineering checks |

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `STRIPE_SECRET_KEY` — Stripe secret key (test or live)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — for future Elements (optional today)
- `STRIPE_WEBHOOK_SECRET` — webhook signing secret
- `STRIPE_PRICE_PRO_MONTHLY` — Price ID for Pro subscription
- `STRIPE_PRICE_DONATION` — Price ID for one-time donation
- `LICENSE_SIGNING_SECRET` — HMAC secret for entitlement tokens (32+ random bytes)
- `NEXT_PUBLIC_APP_URL` — e.g. `https://phycalcpro.com` or `http://localhost:3000`
- `NEXT_PUBLIC_DEV_ENTITLEMENT` — `pro` \| `supporter` \| unset (local dev only)

## Stripe setup (test mode)

1. Create products/prices in [Stripe Dashboard](https://dashboard.stripe.com/test/products).
2. Add webhook endpoint: `{APP_URL}/api/billing/webhook` — events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Run locally: `stripe listen --forward-to localhost:3000/api/billing/webhook`

## Entitlement model (MVP)

After successful Checkout, the client calls `/api/billing/activate` with `session_id`. The server confirms with Stripe and returns a **signed entitlement** stored in `localStorage`.

This is suitable for solo launch; **Phase 3.1** can link entitlements to Supabase auth accounts.

## Feature gates (code)

- `DesignCodeSelector` — US / EU / ISO require Pro
- `ResultExportControls` — PDF export requires Pro
- Engineering checks for code standards still run in-app when Pro is active

## Do not claim before verification

Pricing page copy states that **code-aligned checks are β** until your verification workbook sign-off (Phase 0 / Phase 1).
