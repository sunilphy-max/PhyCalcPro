---
seoTitle: "Pipe Stress Calculator – Hoop Stress, Thermal Expansion & ASME B31.3 Analysis"
seoDescription: "Analyze cylindrical pipes under internal pressure, thermal expansion, and weight loads with hoop stress, sustained/occasional stress screening, and ASME B31.3 code checks."
guideHeadline: "Pipe Stress Analysis — Hoop Stress, Thermal Loads & B31.3 Screening Guide"
keywords: ["pipe stress calculator", "hoop stress", "ASME B31.3", "thermal expansion", "pipe design", "sustained stress", "pipe wall thickness", "pressure piping"]
---

### Pipe Stress Analysis Guide (`pipes`)

## How engineers analyze piping systems

Piping carries pressurized fluids between equipment in process plants, power stations, and building services. Unlike pressure vessels (which are primarily static), piping must accommodate thermal expansion, weight-induced sag, seismic loads, and support reactions — all while maintaining pressure integrity.

ASME B31.3 (Process Piping) is the primary code for refinery, chemical, and general process piping in North America. It categorizes stresses into sustained, occasional, and displacement (thermal expansion) ranges, each with separate allowable limits reflecting their different natures: sustained loads cause primary stress that can lead to burst, while displacement-range stresses are self-limiting and evaluated against fatigue criteria.

## Types and configurations

| Pipe standard | Common use | Wall schedule |
|---|---|---|
| ASME B36.10M (carbon/alloy) | Process plants, power piping | Sch 10–160, STD, XS, XXS |
| ASME B36.19M (stainless) | Chemical, food, pharmaceutical | Sch 5S–80S |
| API 5L | Oil and gas transmission | Various wall thicknesses |
| EN 10216/10217 | European pressure service | EN wall designations |

Wall thickness selection begins with the pressure design formula and is then verified against sustained, occasional, and displacement stress limits at all operating conditions.

## Engineering workflow

1. **Define design conditions** — Design pressure, design temperature, operating temperature range, and fluid density.
2. **Select pipe material and schedule** — Choose a code-listed material and initial wall thickness from standard schedules.
3. **Pressure design thickness** — Compute the minimum wall for internal pressure using the Barlow or B31.3 formula, including mill tolerance (typically 12.5 %) and corrosion allowance.
4. **Sustained stress check** — Pressure + weight stresses must stay below the allowable \( S_h \) at design temperature.
5. **Displacement stress check** — Thermal expansion range must stay below \( S_A = f(1.25\,S_c + 0.25\,S_h) \).
6. **Occasional loads** — Wind, seismic, or relief valve thrust adds short-term stress checked against \( 1.33\,S_h \).
7. **Support design** — Set support spans to limit sag and ensure adequate guides and anchors for thermal growth.

## Key quantities and formulas

**Hoop stress (thin wall)**

\[
\sigma_h = \frac{p\,D}{2\,t}, \quad \sigma_l = \frac{p\,D}{4\,t}
\]

where \( D \) is the outside diameter and \( t \) is the nominal wall thickness minus corrosion and mill tolerance.

**Minimum pressure design thickness (B31.3)**

\[
t_m = \frac{p\,D}{2\,(S\,E\,W + p\,Y)}
\]

where \( S \) is allowable stress, \( E \) is weld joint factor, \( W \) is weld strength reduction factor, and \( Y \) is a coefficient (0.4 for ferrous materials below 482 C).

**Sustained stress**

\[
S_L = \frac{p\,D}{4\,t_n} + \frac{0.75\,i\,M_A}{Z} \leq S_h
\]

where \( M_A \) is the resultant moment from sustained loads (weight + pressure), \( i \) is the stress intensification factor, and \( Z \) is the section modulus.

**Displacement (expansion) stress range**

\[
S_E = \sqrt{S_b^2 + 4\,S_t^2} \leq S_A
\]

where \( S_b \) is bending stress range and \( S_t \) is torsional stress range from thermal expansion.

## Worked example

**Problem:** 6-inch Sch 40 carbon steel pipe (OD 168.3 mm, wall 7.11 mm) at 2.0 MPa, 300 C design temperature. Allowable stress \( S_h = 118 \) MPa. Span between supports 6 m, fluid density 800 kg/m^3.

1. Corroded wall: \( t = 7.11 - 1.5 = 5.61 \) mm (1.5 mm corrosion allowance).
2. Hoop stress: \( \sigma_h = 2.0 \times 168.3 / (2 \times 5.61) = 30.0 \) MPa.
3. Longitudinal pressure stress: \( \sigma_l = 30.0 / 2 = 15.0 \) MPa.
4. Pipe weight (steel + fluid): approximately 35 kg/m. Maximum bending moment at midspan: \( M = w L^2 / 8 = 35 \times 9.81 \times 6^2 / 8 = 1545 \) N-m.
5. Section modulus: \( Z = \pi(D^4 - d^4)/(32D) \approx 1.39 \times 10^5 \) mm^3.
6. Bending stress: \( \sigma_b = 1\,545\,000 / 139\,000 = 11.1 \) MPa.
7. Sustained stress: \( S_L = 15.0 + 0.75 \times 1.0 \times 11.1 = 23.3 \) MPa. Utilization: \( 23.3/118 = 20\% \) — well within limits.
8. Thermal expansion stress requires routing analysis (not shown); straight runs generate axial thrust \( F = E\,\alpha\,\Delta T\,A \).

## Common mistakes and checks

- **Omitting mill tolerance** — Standard pipe wall thickness has a manufacturing tolerance of -12.5 %. The minimum wall is \( 0.875\,t_{\mathrm{nominal}} \), not \( t_{\mathrm{nominal}} \).
- **Ignoring sustained weight stress** — Long unsupported spans generate significant bending that adds to pressure stress. ASME B31.3 §302.3.5 requires this check.
- **Confusing allowable categories** — Sustained stress is limited to \( S_h \); displacement stress range uses a different, often higher allowable \( S_A \). Using the wrong limit is unconservative for one and over-conservative for the other.
- **Neglecting SIF at fittings** — Tees, reducers, and bends have stress intensification factors \( i > 1.0 \). The SIF at an unreinforced tee can be 3–5, dramatically increasing the effective stress.
- **Straight-pipe assumption** — Real piping systems include elbows, branches, and expansion loops. A straight-pipe analysis misses thermal expansion effects entirely.

## FAQ

### What is the difference between hoop and longitudinal stress?
Hoop (circumferential) stress acts around the pipe circumference and is exactly twice the longitudinal (axial) stress for a pressurized cylinder. Hoop stress governs burst failure.

### How does thermal expansion cause stress?
When temperature rises, the pipe wants to expand. If anchored at both ends, the restrained expansion generates compressive axial stress \( \sigma = E \alpha \Delta T \). Expansion loops, bellows, or sliding supports are used to accommodate growth.

### What is a stress intensification factor (SIF)?
SIF is a fatigue multiplier applied at fittings (bends, tees, reducers) where the local stress is higher than the nominal pipe stress. B31.3 Appendix D lists SIFs for standard fittings.

### When should I use thick-wall analysis for pipes?
When \( t/r > 0.1 \), which occurs in high-pressure piping (e.g., hydraulic lines, supercritical steam). Standard process piping (Sch 40/80 in common sizes) is usually well within thin-wall range.

### Does the calculator handle pipe flexibility analysis?
PhyCalcPro performs straight-segment ring-beam FEM with thermal and weight loads. Full 3D piping flexibility analysis (multi-element routing with elbows) requires dedicated piping software like CAESAR II.

## Use the PhyCalcPro calculator

Analyze pipe stress under pressure, thermal, and weight loads in the [Pipe Stress Calculator](/products/pressure/pipes).

---

**Purpose**

Analyze cylindrical pipes under internal pressure, thermal expansion, and weight loads using ring-beam FEM. Computes hoop, longitudinal, and combined stresses with ASME B31.3 sustained, occasional, and peak stress screening.

**Physics & theory**

Thin-wall hoop stress from internal pressure: \( \sigma_h = pr/t \). Longitudinal stress from pressure end cap: \( \sigma_l = pr/(2t) \). Thermal expansion strain \( \alpha \Delta T \) generates stress if expansion is restrained by supports. Weight and sagging add bending in long horizontal spans.

ASME B31.3 categorizes stresses: sustained (pressure + weight), occasional (wind/seismic), and displacement (thermal expansion). Each has allowable limits based on material strength and fatigue considerations at operating temperature.

**Governing equations**

\[
\sigma_h = \frac{p\,r}{t}, \quad \sigma_l = \frac{p\,r}{2t}
\]

\[
S_L = \frac{p\,D}{4\,t_n} + \frac{0.75\,i\,M_A}{Z} \leq S_h
\]

\[
S_E = \sqrt{S_b^2 + 4\,S_t^2} \leq S_A
\]

**Numerical method**

Ring-beam pipe FEM (`solver`): pipe meshed along length with circumferential ring stiffness for pressure. Thermal and weight loads superposed. Post-processing extracts stress components and B31.3 utilization categories.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius`, `thickness`, `length` | Pipe geometry |
| `pressure` | Internal design pressure |
| `E`, `alpha`, `rho` | Material properties |
| `deltaT` | Operating minus install temperature |
| Support span, `segments` | Boundary and mesh |
| Design code | ASME B31.3 or Indicative |

**Outputs**

- Hoop, longitudinal, bending stresses
- Sustained/occasional/displacement utilization
- Deflection, expansion thrust

**Design codes & checks**

- **Indicative:** Thin-wall pipe stress
- **US:** ASME B31.3 sustained, occasional, displacement range

**Assumptions & limitations**

- Straight single pipe segment; no fittings, branches, or flanges modeled.
- Linear elastic; no plastic shake-down analysis.
- Stress intensification at welds requires user SIF factors for detailed work.
- Minimum 8 segments required for adequate ring resolution.

**Verification**

- CI: `pipes-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ASME B31.3:2022. *Process Piping*.
2. Becht IV, C. *Process Piping: The Complete Guide to ASME B31.3*, 4th ed.
3. Timoshenko, S. P., & Woinowsky-Krieger, S. *Theory of Plates and Shells*.
4. Nayyar, M. L. *Piping Handbook*, 7th ed., McGraw-Hill.
5. ASME BPVC Section III (nuclear piping context, reference).
