# PhyCalcPro

Engineering calculator suite for structural, machine, materials, pressure, dynamics, and advanced-systems design screening. Each module runs in the browser with optional cloud project save.

**Disclaimer:** Results are **indicative** unless a module is marked **beta** with implemented code checks. PhyCalcPro does not replace licensed professional review or official code certification.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Product calculators live under `/products/*`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Layout validation + production build |
| `npm test` | Vitest unit and benchmark tests |
| `npm run test:verification` | JSON verification workbook cases |
| `npm run validate:layout` | Enforce `CalculatorLayout` contract on product pages |
| `node scripts/audit-module-docs.mjs` | Module documentation audit |
| `node scripts/test-normalize-math.mjs` | LaTeX normalization regression checks |

## Documentation

- **In-app:** [/documentation](http://localhost:3000/documentation) — browse by module or read the full reference
- **Source manual:** [docs/Modules-Technical-Reference.md](./docs/Modules-Technical-Reference.md)
- **Verification:** [docs/VerificationGuide.md](./docs/VerificationGuide.md)
- **Launch / gating:** [docs/Launch-Plan.md](./docs/Launch-Plan.md)

## Architecture (summary)

- **Next.js App Router** — product pages under `src/app/products/`
- **Single sidebar** — `src/app/products/layout.tsx`; category layouts are passthrough only
- **Module chrome** — `CalculatorLayout` + `CalculatorInputPanel` / `CalculatorResultsShell`
- **Design codes** — US / EU / ISO / Indicative via `DesignCodeContext`; sets default units on change
- **Standards layer** — `src/lib/standards/` attaches `CalculationSpec` checks after each solve
- **Structured PDF export** — `src/lib/export/structuredReport.ts` (title block, metrics, checks, formulas, charts)
- **Projects** — local save + optional Supabase sync; dashboard at `/projects`
- **Cross-calculator handoff** — gear → shaft → bearing chain via `crossCalcHandoff`

See [AGENTS.md](./AGENTS.md) for contributor conventions (layout contract, plots, units, numeric inputs).

## Flagship modules (2026 remediation)

| Module | Standards / depth |
|--------|-------------------|
| Beams / columns | AISC 360 Ch. E–G, EN 1993-1-1 §6.2–6.3 |
| Gears | ISO 6336 bending + contact worksheet |
| Bearings | ISO 281 with catalog C ratings and life exponents |
| Compression springs | EN 13906-1 (G input, buckling screen, τ_zul) |
| Bolts | VDI 2230-1 single-bolt mode + power-screw / pattern modes |
| Fatigue | Basquin S–N + Marin factors + Goodman / Gerber / Morrow |

## License

Private — see repository owner for terms.
