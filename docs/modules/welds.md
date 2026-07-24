---
seoTitle: "Weld Group Calculator – Throat Stress, Eccentric Loading & AWS/EN Analysis"
seoDescription: "Analyze fillet weld groups under direct shear, torsion, and eccentric loads. Throat stress distribution, combined stress utilization, and code checks per AWS D1.1 and EN 1993-1-8."
guideHeadline: "Fillet Weld Group Analysis — Throat Stress & Eccentric Loading Guide"
keywords: ["weld calculator", "fillet weld", "throat stress", "weld group", "eccentric loading", "AWS D1.1", "EN 1993-1-8", "weld design"]
---

### Weld Group Analysis Guide (`welds`)

## How engineers analyze weld groups

Welded connections are permanent joints that transfer load through weld metal deposited between base-metal parts. Fillet welds — the most common type — resist load primarily through shear across the weld throat. The design challenge is computing the *combined throat stress* from simultaneous direct shear, torsion, and bending, then comparing it against the allowable throat shear from the governing code.

Eccentric loading produces the highest stresses: a load offset from the weld group centroid generates a moment that adds torsional shear on top of direct shear. The outermost weld segment furthest from the centroid sees the peak combined stress.

## Types and configurations

| Weld pattern | Application | Key property |
|---|---|---|
| Line welds (straight) | Simple lap and tee joints | Area and section modulus |
| C-shape (three sides) | Bracket-to-column connections | Polar moment about centroid |
| Box (four sides) | Moment connections, base plates | High torsional resistance |
| Circular fillet | Pipe-to-plate, nozzle attachments | Uniform polar moment |
| L-shape (two sides) | Angle brackets, stiffeners | Asymmetric centroid |

Each pattern has a computable centroid, throat area \( A_w \), section modulus \( S_w \), and polar moment \( J_w \). Standard formulas for rectangular, circular, and L-patterns are tabulated in Blodgett and Shigley.

## Engineering workflow

1. **Identify loads** — Direct shear \( V \), applied moment \( M \), and any eccentricity \( e \) of the load from the weld group centroid.
2. **Define weld geometry** — Leg size \( a \), segment lengths, and positions. Compute effective throat \( a_e = 0.707 a \) for equal-leg fillets.
3. **Compute group properties** — Total throat area \( A_w = a_e \times L_{\mathrm{total}} \), centroid, polar moment \( J_w \) about the centroid.
4. **Direct shear stress** — \( \tau_V = V / A_w \), uniformly distributed.
5. **Torsional shear stress** — \( \tau_M = M\,c / J_w \), where \( c \) is the distance from centroid to the farthest weld point.
6. **Combine stresses** — Vector sum at the critical point: \( \tau_{\mathrm{combined}} = \sqrt{\tau_V^2 + \tau_M^2 + 2\,\tau_V\,\tau_M\,\cos\alpha} \), where \( \alpha \) is the angle between stress vectors.
7. **Code check** — Compare \( \tau_{\mathrm{combined}} \) against allowable throat shear (AWS: \( 0.3\,F_u \); EN: partial-factor method).

## Key quantities and formulas

**Effective throat area**

\[
A_w = 0.707\,a\,L_{\mathrm{total}}
\]

**Direct and torsional throat shear**

\[
\tau_V = \frac{V}{A_w}, \quad \tau_M = \frac{M\,c}{J_w}
\]

**Combined throat stress**

\[
\tau_{\mathrm{combined}} = \sqrt{\tau_V^2 + \tau_M^2} \leq \tau_{\mathrm{allow}}
\]

For the general case where direct and torsional shear are not perpendicular, the vector resultant accounts for the angle between them.

**Allowable throat shear (AWS D1.1)**

\[
\tau_{\mathrm{allow}} = 0.30\,F_{EXX}
\]

where \( F_{EXX} \) is the electrode classification strength (e.g., 490 MPa for E70xx).

## Worked example

**Problem:** A C-shaped weld group (three sides of a 150 mm x 100 mm bracket) uses 8 mm fillet welds (E70xx electrode, \( F_{EXX} = 490 \) MPa). A 25 kN load acts 200 mm from the weld group centroid.

1. Throat: \( a_e = 0.707 \times 8 = 5.66 \) mm.
2. Total weld length: \( L = 150 + 100 + 100 = 350 \) mm.
3. Throat area: \( A_w = 5.66 \times 350 = 1980 \) mm^2.
4. Centroid of C-shape: \( \bar{x} = 100^2/(2 \times 350) = 14.3 \) mm from the back.
5. Polar moment \( J_w \): computed from parallel-axis theorem for the three segments. Assume \( J_w = 8.5 \times 10^6 \) mm^3 (unit throat).
6. Direct shear: \( \tau_V = 25\,000/1980 = 12.6 \) MPa.
7. Moment: \( M = 25\,000 \times 200 = 5.0 \times 10^6 \) N-mm.
8. Maximum radius: \( c = \sqrt{(150/2)^2 + (100 - 14.3)^2} = 112 \) mm.
9. Torsional shear: \( \tau_M = 5.0 \times 10^6 \times 112 / (5.66 \times 8.5 \times 10^6) = 116 \) MPa.
10. Combined: \( \tau_{\mathrm{combined}} \approx \sqrt{12.6^2 + 116^2} = 117 \) MPa.
11. Allowable: \( 0.30 \times 490 = 147 \) MPa. Utilization: 79 % — acceptable.

## Common mistakes and checks

- **Using leg size instead of throat** — Stress calculations use the effective throat dimension \( a_e = 0.707\,a \), not the leg size \( a \). Confusing the two doubles the calculated area and halves the stress, giving dangerously unconservative results.
- **Forgetting eccentricity** — Bracket connections almost always have eccentric loading. Treating the load as concentric ignores the dominant torsional shear component.
- **Undersized returns** — Weld returns at corners are often specified too short. Minimum return length should be at least 2 times the leg size to develop the fillet.
- **Ignoring minimum fillet size** — AWS D1.1 Table 5.8 and EN 1993-1-8 specify minimum fillet sizes based on the thicker part joined. Undersized welds may crack during cooling.
- **Mixing code methods** — AWS uses allowable-stress design (ASD) while EN uses partial-factor LRFD. Do not mix factors from different codes in the same check.

## FAQ

### What electrode should I specify?
E70xx (490 MPa) is the default for structural steel. Higher electrodes (E80xx, E90xx) are used for high-strength steels but require preheat and controlled procedures. Match the electrode to the base metal per AWS matching tables.

### How does the calculator handle multi-segment weld groups?
PhyCalcPro computes the centroid and polar moment from user-defined weld segment coordinates. Each segment contributes area and second moment; the parallel-axis theorem accumulates \( J_w \) for the full group.

### Can I analyze groove (butt) welds?
The current module focuses on fillet welds. Groove welds in tension are checked as full-penetration joints where the weld throat equals the thinner base metal — typically not a weld group analysis problem.

### What is the difference between AWS and EN methods?
AWS D1.1 uses a single allowable throat shear \( 0.30\,F_{EXX} \). EN 1993-1-8 uses a directional method resolving throat stress into normal and shear components with partial factors (\( \gamma_{M2} = 1.25 \)). Both give similar results for typical fillet welds.

### When should I use a larger fillet vs. a longer weld?
Increasing leg size is less material-efficient than increasing weld length. A 6 mm fillet that is 200 mm long has 70 % more throat area than a 10 mm fillet that is 100 mm long, using less weld metal. Prefer longer welds when space permits.

## Use the PhyCalcPro calculator

Analyze fillet weld groups with eccentric loading and code checks in the [Weld Group Calculator](/products/fasteners/welds).

---

**Purpose**

Analyze weld groups under direct shear, torsion, and eccentric loading by computing throat shear stress distribution and combined throat stress utilization per AWS D1.1 and EN 1993-1-8 screening methods.

**Physics & theory**

Fillet welds are sized by effective throat \( a_e = 0.707\,a \) for equal-leg fillets. Throat area resists shear; normal stress on throat is often neglected for fillet welds in simplified analysis. For a weld group of total throat area \( A_w \), direct shear is \( \tau = V/A_w \).

Eccentric load \( e \) creates moment resisted by weld group polar moment \( J_w \) about the group centroid: combined shear \( \tau = \sqrt{\tau_V^2 + \tau_M^2} \). Common patterns (rectangle, circle, line) have tabulated \( J_w \) formulas. Allowable throat shear is typically \( 0.3\,F_u \) (AWS) or partial factor per EN.

**Governing equations**

\[
\tau_V = \frac{V}{A_w}, \quad \tau_M = \frac{M\,c}{J_w}
\]

\[
\tau_{\mathrm{combined}} = \sqrt{\tau_V^2 + \tau_M^2} \leq \tau_{\mathrm{allow}}
\]

\[
A_w = 0.707 \cdot a \cdot L_{\mathrm{total}}
\]

**Numerical method**

Closed-form throat shear for standard weld group geometries. Centroid and polar moment computed from weld segment coordinates. Combined stress checked against code allowable; eccentric moment from load offset.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Weld segments | Length, position, leg size \( a \) |
| Applied shear \( V \), moment \( M \) | Loading |
| Eccentricity | Load offset from centroid |
| Electrode strength \( F_u \) | Weld metal ultimate |
| Design code | AWS D1.1 or EN 1993-1-8 |

**Outputs**

- Throat shear components, combined throat stress, utilization, critical weld segment location.

**Design codes & checks**

- **Indicative:** Throat shear and combined stress
- **US:** AWS D1.1/D1.1M structural welding code
- **EU:** EN 1993-1-8 fillet weld design rules

**Assumptions & limitations**

- Elastic distribution; no plastic redistribution in weld group.
- Fillet welds only; groove weld tension not included.
- Brittle fracture and fatigue of welds require separate analysis.
- Leg size must meet minimum per material thickness tables.

**Verification**

- CI: `welds-indicative-01.json` (where available)
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. AWS D1.1/D1.1M:2020. *Structural Welding Code — Steel*.
2. EN 1993-1-8:2005. *Design of joints — Welded connections*.
3. Blodgett, O. W. *Design of Welded Structures*. James F. Lincoln Arc Welding Foundation.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
5. Salmon, C. G., & Johnson, J. E. *Steel Structures: Design and Behavior*, 5th ed.
