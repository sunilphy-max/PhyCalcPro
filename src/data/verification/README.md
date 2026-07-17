# Verification cases (Phase 4)

Add benchmark JSON files here. CI runs them via:

```bash
npm run test:verification
```

Results are written to `last-run.json` (committed after passing) and `reports/verification-latest.json` (local).

**Master validation checklist:** [docs/validation-master-checklist.md](../../docs/validation-master-checklist.md) — **86** CI cases / **67** solvers (see `npm run test:verification`).

## File naming

`{moduleId}-{designCode}-{slug}.json`

Example: `beams-indicative-01.json`

## Schema

```json
{
  "id": "gears-indicative-01",
  "moduleId": "gears",
  "designCode": "INDICATIVE",
  "description": "Short description",
  "inputs": {},
  "expected": { "safetyFactor": 1.6 },
  "tolerancePercent": 2,
  "source": "Your worksheet / code example"
}
```

## Automated modules

All solvers are registered in `src/lib/qa/moduleSolverRegistry.ts`. Run:

```bash
npx tsx scripts/bootstrap-verification.ts
```

to generate JSON from seeds in `src/lib/qa/verificationSeeds.ts` (skips existing files).

**Modules with committed CI cases (70 cases, 64 modules):** all solver-backed modules except **material-db** (browse-only). Run `npm run test:verification` then `npm run validate:maturity-gates` (chained automatically).

## After you verify against a standard

1. Add a case with your inputs and expected values from your worksheet.
2. Run `npm run test:verification` until PASS.
3. Commit the JSON + updated `last-run.json`.
4. Module release tier on `/status` moves toward **verified**.
