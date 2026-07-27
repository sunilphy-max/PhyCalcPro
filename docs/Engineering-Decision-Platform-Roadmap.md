# Engineering Decision Platform (EDP) Roadmap

Canonical product ladder for PhyCalcPro as an **Engineering Decision Platform** (not a calculator site).

**Phase naming:** Use **EDP-0 … EDP-7** here. These are distinct from solver/QA phases in `Phase1-Roadmap.md`–`Phase5-Roadmap.md` and from free→login→Pro phases in `Launch-Plan.md`.

**Invariant:** Verified module solvers are the only source of numeric answers. AI may parse briefs, explain, and propose inputs — it never invents results.

**Bets in scope:** LLM AI assistant, interactive 2D engineering, and schematic 3D/CAD visualization + export (SVG/DXF/glTF). Full commercial FEA and full AGMA/ISO manufacturing worksheets remain out of scope unless separately funded.

## North star

A **Design Workspace** = calculator + knowledge + materials + interactive model + report + AI + related modules + saved project.

## Flagship waves

| Wave | Modules |
|------|---------|
| F1 | beams, shafts, bearings |
| F2 | compression-springs, gears, bolts |
| F3 | columns, pressure vessels, materials DB UX |
| Fleet | Remaining registered modules (checklist rollup) |

## Phases

| Phase | Focus | Exit criteria (summary) |
|-------|--------|-------------------------|
| EDP-0 | Contracts, WorkspaceChrome, governance | Contract types + chrome on beams; this doc live |
| EDP-1 | Professional calculator bar | F1 100% scorecard; live solve, diagrams, summary, PDF |
| EDP-2 | In-product knowledge | Knowledge panel on F1/F2 from `docs/modules` |
| EDP-3 | Material database | ≥200 graded entries + selection metadata; one-click bind |
| EDP-4 | Interactive 2D → 3D + CAD export | Drag kit; 3D scene F1; SVG/DXF beams |
| EDP-5 | AI assistant | LLM parse + deterministic solve; grounded explain |
| EDP-6 | Design-review reports | Named PDF sections + project revision history |
| EDP-7 | Learning platform | Teach mode F1; ≥2 learning paths |

## Phase 1 scorecard (F1)

| Module | Live | Diagram | Plots | Summary | PDF | Units | Design modes |
|--------|------|---------|-------|---------|-----|-------|--------------|
| beams | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| shafts | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| bearings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

\*Shafts: optional live preview; full FEM remains Calculate-gated when heavy.

## Non-goals

- Full multi-physics FEA / contact / modal replacement
- Full ISO 6336 / AGMA manufacturing worksheets (unless upgraded)
- Vendor SKU parity for every bearing manufacturer
- LLM-generated numeric results

## Related docs

- [Product-Roadmap-Gaps.md](./Product-Roadmap-Gaps.md) — remaining gaps; CAD now in EDP-4
- [Homogenization-Roadmap.md](./Homogenization-Roadmap.md) — module UI contract
- [validation-master-checklist.md](./validation-master-checklist.md) — engineer sign-off
- [Launch-Plan.md](./Launch-Plan.md) — GTM / monetization phases

## Fleet rollout status

- **Workspace chrome:** enabled for all calculators via `CalculatorLayout` → `ModuleWorkspaceShell` (Knowledge, Materials, Report, AI, Teach; Model where registered).
- **Materials:** centralized catalog + `materialEvents` bus; Materials DB deep-links every catalog-binding module; `?material=` works fleet-wide.
- **Design Summary rail:** use `CalculatorLayout` `summary` prop (beams + bearings pattern).
