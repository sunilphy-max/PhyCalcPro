# Verification cases (Phase 4)

Add benchmark JSON files here. CI runs them via:

```bash
npm run test:verification
```

Results are written to `last-run.json` (committed after passing) and `reports/verification-latest.json` (local).

## File naming

`{moduleId}-{designCode}-{slug}.json`

Example: `beams-US-cantilever-tip.json`

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

`gears`, `columns`, `combined-loading`, `impact`, `fatigue`, `corrosion`, `suspension`, `rotation`

Extend runners in `src/lib/qa/benchmarkRunner.ts`.

## After you verify against a standard

1. Add a case with your inputs and expected values from your worksheet.
2. Run `npm run test:verification` until PASS.
3. Commit the JSON + updated `last-run.json`.
4. Module release tier on `/status` moves toward **verified**.
