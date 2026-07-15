### Bearing Housing (`housing`)

**Purpose**

Screen bearing housing body stress and mounting bolt tension/shear from radial and axial bearing reactions. Bridges the machine power-train workflow between bearing selection and bolt design. Includes screening SKU / seal / grease **mounted BOM** (SNL, UCP, FY, SAF-class).

**Physics & theory**

Simplified cantilever bracket: overturning moment from radial load at arm length proportional to bolt circle. Body bending stress from rectangular section modulus. Bolt tension from moment / (n × bolt circle radius). Bolt shear from resultant load / n. Fit recommendation reuses ISO 286 screening from rolling bearing logic.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `boreDiameter` | Bearing bore / shaft diameter at housing |
| `radialLoad`, `axialLoad` | Bearing reactions (N) |
| `mountStyle` | Pillow block, flange, or foot |
| `boltCount`, `boltCircleDiameter` | Mounting pattern |
| `yieldStress` | Housing material yield |
| Catalog / seal prefs | Optional SKU class for mounted BOM |

**Outputs**

- Body safety factor, body utilization, bolt T/V, bolt utilization (von Mises / allow), deflection / fit estimate
- Live **Design Summary** rail (body SF/util, bolt util, deflection/fit, SKU, status)
- Deterministic **housing SKU advisor** (why this SNL/UCP/…, cost band, seal note, alternatives)
- Compact **mounted BOM** on results Summary and in PDF/Excel
- Sectioned PDF / Excel with body/bolt domain factors + recommendation

**Cross-module handoff**

- Imports from **bearings** / **shafts**: bore, loads, speed.
- Publishes `tension`, `shear`, `boltCount`, `patternDiameter` to **bolts**.

**Assumptions & limitations**

- Structural screening only — not FEA of housing elasticity or OEM mounted-product databases.
- SKU catalog is representative (SNL/UCP/FY/SAF-class), not full vendor housings.

**Verification**

- CI: `housing-indicative-01.json`
- Vitest: `src/lib/machine/housing/engine.test.ts`
