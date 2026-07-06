# Release tier promotion guide

PhyCalcPro release tiers on [`/status`](../src/app/status/page.tsx) combine catalog `validationStatus`, CI benchmarks, and `moduleMaturity.validationQuality`.

## Automated gates (CI)

```bash
npm run test:verification   # 70 cases — includes validate:maturity-gates
```

- **beta/verified** catalog modules must have passing CI benchmarks (enforced by `scripts/validate-maturity-gates.ts`).

## Manual promotion checklist

| Target tier | Requirements | Your action |
|-------------|--------------|-------------|
| **indicative** | Solver + UI scaffold | Default for new modules |
| **beta** | Set `validationStatus: "beta"` in `moduleCatalog.ts` + CI pass | Approve screening use |
| **verified** | CI pass + engineer worksheet sign-off ([manual-engineer-signoff.md](./manual-engineer-signoff.md)) | Set `validationStatus: "verified"` |
| **certified** | verified + `validationQuality >= 4` in `moduleMaturity.ts` | Production-critical modules only |

## Screening vs full worksheet boundary (current policy)

| Area | PhyCalcPro stance | Override? |
|------|-------------------|-----------|
| ISO 6336 gears | Method C screening + user K_A, K_V, K_Hβ | Full AGMA worksheets = major scope |
| DIN 743 shafts | K_σ, K_τ, γ_F inputs + Shigley fatigue | Full DIN 743 tables = future |
| VDI 2230 bolts | Single-bolt + elastic pattern | Multi-bolt FEA = out of scope |
| CAD export | Excluded | SVG/DXF optional later |

Record your approval of this boundary in your internal calculation procedure before promoting modules to **verified**.

## Recommended promotion order

1. shafts, bearings, gears, compression-springs, bolts  
2. v-belts, beams, columns  
3. Remaining MITCalc-core modules  
4. Advanced-systems (indicative unless you supply chamber/cell data)
