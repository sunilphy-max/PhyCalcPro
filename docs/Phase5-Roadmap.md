# Phase 5 — Production launch & accounts

Phases 0–4 built standards traceability, code checks (pilots), monetization, and QA gates. Phase 5 makes the product **deployable and operable** for real users.

## Goals

| Goal | Deliverable |
|------|-------------|
| CI on every push | GitHub Actions: verify + lint + build |
| More code-aligned modules | Phase 1 **Wave 2**: combined loading, welds |
| Optional user accounts | Supabase auth + `/account` |
| Subscription self-service | Stripe Customer Portal |
| Public trust framing | `/trust` — disclaimers & certification path |
| Cloud entitlement backup | API to store signed license per user (optional Supabase) |

## Wave 2 code checks (this release)

| Module | US / EU / ISO |
|--------|----------------|
| **Combined loading** | Von Mises utilization vs yield (ASD / EN factors) |
| **Welds** | Throat stress utilization vs AWS/EN-style allowables (β) |

## Accounts (optional)

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set:

- Sign in on `/account` (email magic link)
- Save Pro license token to your profile (service role on server)

Without Supabase, the app works as today (browser-local license).

## Operations checklist

1. Set all env vars in `.env.example` on Vercel/host.
2. `npm run test:verification` green in CI.
3. Stripe live mode + webhook URL.
4. Promote modules to **certified** only after your workbook sign-off (`/status`).
5. Do not claim full code compliance in marketing until certified.

## What is still Phase 2 (original roadmap)

New calculator modules (e.g. ASME VIII full vessel rating, LTB, AGMA scuffing math) remain **Phase 2** — separate from Phase 5 operations.
