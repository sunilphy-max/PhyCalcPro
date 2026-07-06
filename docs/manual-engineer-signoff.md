# Engineer sign-off — MITCalc parity validation

Use this document with [validation-master-checklist.md](./validation-master-checklist.md) when cross-checking PhyCalcPro against MITCalc, vendor software, or code examples.

## What you need to provide (per priority module)

| Module | Reference source | Key outputs to compare | Tolerance |
|--------|------------------|------------------------|-----------|
| gears | MITCalc spur gear or ISO 6336 worksheet | S_F, S_H, K_V, K_Hβ, center distance | ±3% |
| shafts | MITCalc shaft or DIN 743 / Shigley example | Bending stress, τ, fatigue SF, critical speed | ±5% |
| bearings | SKF catalog or MITCalc Bearings I | L10h, C required, static SF, speed margin | ±5% |
| compression-springs | MITCalc or EN 13906 nomograph | Rate, τ, SF, solid height | ±5% |
| extension-springs | MITCalc tension spring | Fi, hook stress, SF | ±5% |
| bolts | VDI 2230 / MITCalc bolt worksheet | Preload, slip, combined SF | ±5% |
| v-belts | Gates manual or MITCalc | Belt speed, tension, power margin | ±8% |

## Submission format

For each module, send either:

1. **MITCalc export** — screenshot or Excel values for inputs + outputs, or  
2. **Textbook/code case** — source citation, inputs JSON, expected values

Example JSON fragment for CI (`src/data/verification/{module}-EU-{slug}.json`):

```json
{
  "id": "gears-EU-worked-01",
  "moduleId": "gears",
  "designCode": "EU",
  "description": "Your MITCalc spur gear example",
  "inputs": { },
  "expected": { "iso6336BendingSafetyFactor": 1.8 },
  "tolerancePercent": 3,
  "source": "MITCalc 1.74 / your project ref"
}
```

## Catalog data still needed from you

- Bearing SKF/INA full designation tables beyond starter catalog  
- Spring wire mill stock list (`src/data/catalogs/springWireCatalog.ts`)  
- Belt/chain manufacturer rating tables  
- Rolled sections your projects use (extend aliases in `rolled-sections/data.ts`)

## Sign-off columns

In `validation-master-checklist.md`, mark **Physics** and **Standards** when satisfied. Promote release tier on `/status` only after your review.
