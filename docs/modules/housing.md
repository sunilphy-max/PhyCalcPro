---
seoTitle: "Bearing Housing Calculator – Body Stress, Bolt Check & Mounted Unit BOM"
seoDescription: "Screen bearing housing body stress and bolt tension/shear from bearing reactions. Includes SKU advisor for SNL, UCP, FY, and SAF-class mounted units with seal and grease selection."
guideHeadline: "Engineering guide to bearing housing design and mounted unit selection"
keywords:
  - bearing housing calculator
  - pillow block design
  - housing body stress
  - mounting bolt analysis
  - SNL housing selection
  - bearing mounted unit
  - housing bolt shear
---

### Bearing Housing (`housing`)

## How engineers design bearing housings

A bearing housing holds the rolling element bearing in position and transfers shaft loads to the machine frame. Design involves checking that the housing body can sustain bending from radial loads without yielding, and that the mounting bolts resist the resulting overturning moment and shear. In many installations, engineers select a standard mounted unit (pillow block, flange, or take-up) rather than designing a custom casting, so the module also includes an SKU advisor for representative mounted units.

## Housing types and configurations

| Type | Mounting | Typical application |
|------|---------|---------------------|
| Pillow block (UCP) | Two-bolt pedestal | General purpose conveyor, fans |
| Flanged unit (UCF) | Square 4-bolt flange | Walls, vertical surfaces |
| Take-up unit (UCT) | Sliding base | Belt tensioning, conveyors |
| SNL plummer block | Two-bolt split housing | Heavy-duty industrial |
| SAF housing | Large split housing | Pulp, mining, steel mills |
| FY bearing unit | Square flange, compact | Light machinery |

## Engineering workflow

1. Import bearing bore, radial load, and axial load from the bearing or shaft module.
2. Select mounting style (pillow block, flange, or foot).
3. Define bolt pattern: bolt count and bolt circle diameter.
4. Enter housing material yield stress.
5. Calculate body bending stress from cantilever bracket model.
6. Calculate bolt tension from overturning moment and bolt shear from resultant load.
7. Evaluate safety factors for body and bolts.
8. Use the SKU advisor to select an appropriate mounted unit class if standard housings apply.
9. Review seal and grease recommendations from the mounted BOM.

## Key quantities and formulas

Body bending stress (simplified cantilever model):

\[
\sigma_b = \frac{M}{S} = \frac{F_r \, L_{\text{arm}}}{S}
\]

Bolt tension from overturning:

\[
F_{t,\text{bolt}} = \frac{M}{n \, r_{\text{bolt}}}
\]

Bolt shear from resultant:

\[
\tau_{\text{bolt}} = \frac{F_{\text{resultant}}}{n \, A_{\text{bolt}}}
\]

Combined bolt utilization (von Mises):

\[
\sigma_{\text{eq}} = \sqrt{\sigma_t^2 + 3\tau^2} \leq \sigma_{\text{allow}}
\]

## Worked example

A pillow block housing supports a 50 mm bore bearing with 8 kN radial load and 1.5 kN axial load. Two M16 bolts on 130 mm bolt circle. Housing body is cast iron with 180 MPa yield.

- Overturning moment: \( M = 8000 \times 0.065 = 520 \) N-m (arm to bolt CL).
- Bolt tension: \( F_t = 520 / (2 \times 0.065) = 4000 \) N per bolt.
- Bolt shear: \( \tau = \sqrt{8000^2 + 1500^2} / (2 \times 157) = 25.9 \) MPa (M16 stress area 157 mm\(^2\)).
- Body section modulus determined from housing cross-section; bending stress compared to 180 MPa yield.
- SKU advisor suggests SNL 511 or UCP 210 class.

## Common mistakes and checks

- **Ignoring axial load on flange housings:** axial loads create bending in flange mounts that pedestal blocks handle differently.
- **Undersizing bolts for overturning:** radial load at a lever arm creates significant bolt tension — not just shear.
- **Wrong material for environment:** outdoor or washdown applications need stainless or polymer housings, not grey cast iron.
- **Omitting seal selection:** an open housing destroys bearing life through contamination. Match seal type to speed and environment.
- **Not checking deflection:** a compliant housing alters bearing alignment, causing premature failure.

## FAQ

### When should I use a split housing (SNL/SAF) vs a solid unit (UCP)?

Split housings allow bearing installation and removal without disturbing the shaft. They are preferred for heavy-duty applications and maintenance-intensive environments.

### How does the SKU advisor work?

It matches bore diameter, load, and speed against representative mounted unit classes (SNL, UCP, FY, SAF) and recommends the lightest adequate housing with seal and grease notes.

### Can housing bolts carry shear through friction?

If the housing is properly tightened, friction under clamping force can resist shear. The module conservatively assumes bolts carry shear in bearing unless specified otherwise.

### What safety factor should I target for housing body stress?

A minimum of 2.0 for static loads on cast iron; 3.0 or higher for dynamic or shock-loaded installations.

### Does the module account for thermal expansion?

No — thermal growth of the shaft relative to the housing must be accommodated by using a locating/non-locating bearing arrangement, not by housing stress analysis.

## Use the PhyCalcPro calculator

Open the [Bearing Housing calculator](/products/bearings/housing) to enter bore diameter, bearing loads, mount style, bolt pattern, and material. The tool returns body safety factor, bolt utilization, deflection estimate, housing SKU recommendation, and mounted BOM.

---

**Purpose**

Screen bearing housing body stress and mounting bolt tension/shear from radial and axial bearing reactions. Bridges the machine power-train workflow between bearing selection and bolt design. Includes screening SKU / seal / grease mounted BOM (SNL, UCP, FY, SAF-class).

**Physics & theory**

Simplified cantilever bracket model: overturning moment from radial load at arm length proportional to bolt circle. Body bending stress from rectangular section modulus. Bolt tension from moment divided by bolt count times bolt circle radius. Bolt shear from resultant load divided by bolt count. Combined bolt stress evaluated with von Mises criterion against allowable.

**Governing equations**

\[
\sigma_b = \frac{F_r \, L_{\text{arm}}}{S}
\]

\[
F_{t,\text{bolt}} = \frac{M}{n \, r_{\text{bolt}}}, \quad \tau_{\text{bolt}} = \frac{F_{\text{res}}}{n \, A_{\text{bolt}}}
\]

\[
\sigma_{\text{eq}} = \sqrt{\sigma_t^2 + 3\tau^2} \leq \sigma_{\text{allow}}
\]

**Numerical method**

Closed-form cantilever bracket and bolt stress analysis. SKU advisor matches bore/load/speed to representative mounted unit classes.

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

- Body safety factor, body utilization, bolt tension/shear, bolt utilization (von Mises), deflection estimate, housing SKU recommendation, mounted BOM.

**Design codes & checks**

- **Indicative:** Body and bolt stress utilization

**Assumptions & limitations**

- Structural screening only — not FEA of housing elasticity or OEM mounted-product databases.
- SKU catalog is representative (SNL/UCP/FY/SAF-class), not full vendor housings.
- Thermal expansion and misalignment not evaluated.

**Verification**

- CI: `housing-indicative-01.json`
- Vitest: `src/lib/machine/housing/engine.test.ts`

**References**

1. SKF Group. *Rolling Bearings Catalogue* — mounted units section.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 11.
3. ISO 113:2010. *Rolling bearings — Plummer block housings*.
4. Timken Company. *Mounted Bearing Selection Guide*.
