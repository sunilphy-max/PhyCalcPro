### Bearing Housing (`housing`)

**Purpose**

Screen bearing housing body stress and mounting bolt tension/shear from radial and axial bearing reactions. Bridges the machine power-train workflow between bearing selection and bolt design.

**Physics & theory**

Simplified cantilever bracket: overturning moment from radial load at arm length proportional to bolt circle. Body bending stress from rectangular section modulus. Bolt tension from moment / (n × bolt circle radius). Bolt shear from resultant load / n.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `boreDiameter` | Bearing bore / shaft diameter at housing |
| `radialLoad`, `axialLoad` | Bearing reactions (N) |
| `mountStyle` | Pillow block, flange, or foot |
| `boltCount`, `boltCircleDiameter` | Mounting pattern |
| `yieldStress` | Housing material yield |

**Outputs**

- Body safety factor, bolt tension and shear per bolt, recommended bolt size, deflection estimate.

**Cross-module handoff**

- Imports from **bearings** / **shafts**: bore, loads, speed.
- Publishes `tension`, `shear`, `boltCount`, `patternDiameter` to **bolts**.

**Verification**

- CI: `housing-indicative-01.json`
