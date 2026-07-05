# Verification cases (Phase 4)

Add benchmark JSON files here. CI runs them via:

```bash
npm run test:verification
```

Results are written to `last-run.json` (committed after passing) and `reports/verification-latest.json` (local).

**Master validation checklist (all 62 modules):** [docs/validation-master-checklist.md](../../docs/validation-master-checklist.md)

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

**Modules with committed CI cases (38 cases, 34 modules):** includes shells, internal-gears-rack (×2), power-screws (×2), plain-bearings (×2), tolerance (3D), plus beams, bearings, bevel-gears, bolts, circular-plates, columns, combined-loading, compression-springs (×2), corrosion, extension-springs, fatigue, frames, gears, hydraulics, impact, keys-splines, pipes, rivets, rotation, shafts, suspension, timing-belts, torsion-springs, trusses, unit-converter, v-belts, vessels, vibrations, welds.

## After you verify against a standard

1. Add a case with your inputs and expected values from your worksheet.
2. Run `npm run test:verification` until PASS.
3. Commit the JSON + updated `last-run.json`.
4. Module release tier on `/status` moves toward **verified**.
