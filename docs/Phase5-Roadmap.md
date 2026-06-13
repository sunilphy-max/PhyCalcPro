# Phase 5 — Production launch & accounts

Phases 0–4 built standards traceability, code checks (pilots), monetization, and QA gates. Phase 5 makes the product **deployable and operable** for real users.

## Goals

| Goal | Deliverable | Status |
|------|-------------|--------|
| CI on every push | GitHub Actions: verify + lint + build | Recommended (see Phase 4) |
| Code-aligned flagship modules | Phase 1 waves 1–3 remediation | **Done** (2026-06) |
| Optional user accounts | Supabase auth + `/account` | Scaffolded |
| Project persistence | Local save + `/projects` dashboard | **Done** |
| Cross-calculator workflows | Gear → shaft → bearing handoff | **Done** |
| Structured engineering reports | PDF with checks, formulas, charts | **Done** |
| Subscription self-service | Stripe Customer Portal | Planned |
| Public trust framing | `/trust` — disclaimers & certification path | Shipped |
| Cloud entitlement backup | API to store signed license per user | Optional Supabase |

## Code checks delivered (2026 remediation)

| Module | US / EU / ISO |
|--------|----------------|
| **Beams** | AISC 360 Ch. F/G; EN 1993-1-1 §6.2 (flexure, shear, LTB screening) |
| **Columns** | AISC 360 Ch. E/E3; EN 1993-1-1 §6.3 inelastic |
| **Gears** | ISO 6336 bending + contact worksheet |
| **Bearings** | ISO 281 life with catalog ratings |
| **Springs** | EN 13906-1 shear + buckling |
| **Bolts** | VDI 2230-1 single-bolt worksheet |
| **Combined loading** | Von Mises utilization vs yield (β) |
| **Welds** | Throat stress utilization vs AWS/EN-style allowables (β) |
| **Fatigue** | Basquin + Marin; Goodman / Gerber / Morrow |

## Accounts & projects

If `NEXT_PUBLIC_SUPABASE_ENABLED=true` and URL/keys are set:

- Sign in on `/account` (email magic link)
- Save Pro license token to your profile (service role on server)
- Optional cloud sync for saved projects via `/api/workspaces/models`

Without Supabase, the app works with browser-local projects (`/projects`) and local license storage.

## Operations checklist

1. Set env vars from `.env.example` on Vercel/host (`NEXT_PUBLIC_FREE_LAUNCH=true` for free launch).
2. `npm test` and `npm run test:verification` green in CI.
3. Stripe live mode + webhook URL (when monetization enabled).
4. Promote modules to **certified** only after your workbook sign-off (`/status`).
5. Do not claim full code compliance in marketing until certified.

## What remains on the product roadmap

See [Product-Roadmap-Gaps.md](./Product-Roadmap-Gaps.md) and [Modules-Technical-Reference.md](./Modules-Technical-Reference.md) §13:

- Full multi-bolt VDI 2230 system FEA
- Gear scuffing / micropitting (ISO 6336-20/22)
- Shaft DIN 743 / AGMA fatigue as formal code checks
- CAD/SVG/DXF export for geometry modules
- Design-alternative comparison with weight/cost scoring
