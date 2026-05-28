# PhyCalcPro verification workbook guide

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

- **INDICATIVE** — educational; limited checks implemented today
- **US** — AISC, ASME, AGMA, AWS, etc. (per module)
- **EU** — EN, DIN, VDI, etc.
- **ISO** — ISO international standards where listed

## After you complete a row

1. Save the Excel file and share it (or export **4_Benchmarks** as JSON into `src/data/verification/`).
2. We set `implemented_US` / `implemented_EU` / `implemented_ISO` to YES in the catalog and align solver math.
3. Module moves toward **verified** once CI benchmarks pass.

## JSON benchmark example (`src/data/verification/gears-US-01.json`)

```json
{
  "id": "gears-US-01",
  "moduleId": "gears",
  "designCode": "US",
  "description": "Spur gear bending SF check",
  "inputs": { "power_kW": 15, "rpm": 1200 },
  "expected": { "safetyFactor": 1.85 },
  "tolerancePercent": 5,
  "source": "Your AGMA worksheet 2026-05-27"
}
```

Run automated checks (when cases exist):

```bash
npm run test:verification
```
