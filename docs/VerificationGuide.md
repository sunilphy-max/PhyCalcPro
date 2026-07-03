# PhyCalcPro verification workbook guide

## Quick links

| Document | Purpose |
|----------|---------|
| **[validation-master-checklist.md](./validation-master-checklist.md)** | Per-module physics & standards sign-off (all 62 modules) |
| **[modules/spring-modules-user-tasks.md](./modules/spring-modules-user-tasks.md)** | Spring-specific engineer checklist |
| **`src/data/verification/README.md`** | JSON case schema and CI module list |

## File to fill out

**`docs/PhyCalcPro_Verification_Template.xlsx`**

Regenerate after catalog changes:

```bash
npm run generate:verification-template
```

## Sheets

| Sheet | Purpose |
|-------|---------|
| **1_Instructions** | How to use this workbook |
| **2_Modules** | US / EU / ISO document + clause references per module |
| **3_Checks** | Which engineering checks apply; mark **implemented** = YES when PhyCalcPro matches your calc |
| **4_Benchmarks** | Worked examples: inputs, expected outputs, tolerance, source |
| **5_PassFail** | Minimum safety factors or max utilization per check and code |

## Design codes

- **INDICATIVE** — textbook / closed-form screening; always available
- **US** — AISC, ASME, AGMA, AWS, etc. (per module catalog)
- **EU** — EN, DIN, VDI, etc.
- **ISO** — ISO 281, ISO 6336, ISO 286, etc. where listed

## Automated CI (JSON benchmarks)

### Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Vitest — unit tests and externally sourced benchmarks in `src/lib/**/*.test.ts` |
| `npm run test:verification` | JSON workbook cases in `src/data/verification/` |

### Architecture (2026)

- **`src/lib/qa/moduleSolverRegistry.ts`** — central registry of **61** numeric solvers (all modules except material-db browse mode)
- **`src/lib/qa/benchmarkRunner.ts`** — runs verification cases against the registry
- **`src/lib/qa/verificationSeeds.ts`** + **`scripts/bootstrap-verification.ts`** — generate new JSON from seed cases

### Modules with committed CI cases (24)

| Module | Verification file(s) |
|--------|----------------------|
| beams | `beams-indicative-01.json` |
| bearings | `bearings-indicative-01.json` |
| bevel-gears | `bevel-gears-indicative-01.json` |
| circular-plates | `circular-plates-indicative-01.json` |
| columns | `columns-indicative-01.json` |
| combined-loading | `combined-loading-indicative-01.json` |
| compression-springs | `compression-springs-indicative-01.json`, `compression-springs-indicative-fatigue-01.json` |
| corrosion | `corrosion-indicative-01.json` |
| extension-springs | `extension-springs-indicative-01.json` |
| fatigue | `fatigue-indicative-01.json` |
| gears | `gears-indicative-01.json` |
| hydraulics | `hydraulics-indicative-01.json` |
| impact | `impact-indicative-01.json` |
| keys-splines | `keys-splines-indicative-01.json` |
| pipes | `pipes-indicative-01.json` |
| rivets | `rivets-indicative-01.json` |
| rotation | `rotation-indicative-01.json` |
| shafts | `shafts-indicative-01.json` |
| suspension | `suspension-indicative-01.json` |
| timing-belts | `timing-belts-indicative-01.json` |
| torsion-springs | `torsion-springs-indicative-01.json` |
| unit-converter | `unit-converter-indicative-01.json` |
| v-belts | `v-belts-indicative-01.json` |

All other modules with solvers can add JSON at any time — the registry already supports them.

### Adding a new benchmark

```bash
# Option A: add seed to src/lib/qa/verificationSeeds.ts, then:
npx tsx scripts/bootstrap-verification.ts

# Option B: write JSON by hand in src/data/verification/
npm run test:verification
# Commit JSON + updated last-run.json
```

## JSON benchmark example

```json
{
  "id": "gears-indicative-01",
  "moduleId": "gears",
  "designCode": "INDICATIVE",
  "description": "Spur gear bending SF check",
  "inputs": { "power": 15000, "speedDriver": 1200 },
  "expected": { "safetyFactor": 1.85 },
  "tolerancePercent": 5,
  "source": "Your AGMA worksheet — replace bootstrap placeholder"
}
```

## After you complete a row (Excel or JSON)

1. Save the workbook or commit verification JSON.
2. Run `npm run test:verification` until all cases PASS.
3. Set `implemented_US` / `implemented_EU` / `implemented_ISO` in the standards catalog when solver math matches your worksheet.
4. Module moves toward **verified** on `/status` once CI and manual sign-off align.

## Flagship module tests (Vitest, not JSON)

| Module | Test file |
|--------|-----------|
| shafts | `src/lib/machine/shafts/engine.test.ts` |
| bearings | `src/lib/machine/bearings/engine.test.ts` |
| compression / extension / torsion springs | `src/lib/springs/*/engine.test.ts`, `en13906Fatigue.test.ts` |
| v-belts | `src/lib/powerTransmission/v-belts/engine.test.ts` |
| fatigue | `src/lib/materials/fatigue/engine.test.ts` |
