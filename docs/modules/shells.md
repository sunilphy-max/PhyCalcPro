---
seoTitle: "Cylindrical Shell Calculator — Hoop Stress, Axial Stress & Von Mises | PhyCalcPro"
seoDescription: "Screen thin cylindrical shells under internal pressure, axial force, and bending. Compute hoop stress, axial membrane stress, von Mises equivalent stress, and safety factor per ASME/EN 13445."
guideHeadline: "Cylindrical Shells: Pressure Vessel Membrane Stress Engineering Guide"
keywords: ["cylindrical shell", "hoop stress", "pressure vessel", "thin shell theory", "membrane stress", "von Mises shell", "ASME BPVC", "shell thickness", "internal pressure vessel"]
---

### Cylindrical Shells Guide (`shells`)

## How engineers design cylindrical shells

Cylindrical shells are the most common pressure-containing geometry in engineering: boilers, chemical reactors, storage tanks, pipelines, heat exchangers, and rocket casings are all cylindrical shells. Under internal pressure, the shell develops biaxial membrane stresses — hoop (circumferential) and axial (longitudinal) — that govern wall thickness selection.

Thin-shell membrane theory provides elegant closed-form results when \( t/r < 0.1 \): hoop stress \( \sigma_h = pr/t \) and axial stress \( \sigma_a = pr/(2t) \) for closed-ended cylinders. The hoop stress is always twice the axial stress from pressure alone, making circumferential failure the governing mode. When external axial loads or bending moments are superimposed, von Mises equivalent stress determines the combined safety margin.

The PhyCalcPro shells module evaluates membrane stresses from internal pressure combined with external axial force and bending moment, then computes von Mises equivalent stress and safety factor. This provides rapid pressure vessel screening without full finite-element shell analysis.

## Shell loading scenarios

| Loading Case | Stress Components | Governing Condition |
|---|---|---|
| Internal pressure only (closed ends) | \( \sigma_h = pr/t \), \( \sigma_a = pr/2t \) | Hoop stress governs |
| Internal pressure (open ends) | \( \sigma_h = pr/t \), \( \sigma_a = 0 \) | Pure hoop |
| Pressure + axial tension | \( \sigma_h \), \( \sigma_a + F/(2\pi r t) \) | Combined biaxial |
| Pressure + bending moment | \( \sigma_h \), \( \sigma_a \pm M/(\pi r^2 t) \) | Von Mises critical |
| External pressure | Buckling governs (not membrane) | Requires separate analysis |

## Engineering workflow

1. Define shell geometry: mean radius \( r \), wall thickness \( t \), and length \( L \).
2. Specify end condition: open or closed (closed adds axial membrane stress from pressure).
3. Apply internal pressure \( p \).
4. Add external loads if present: axial force \( F \) and/or bending moment \( M \).
5. Specify material allowable stress or yield strength.
6. Run the membrane stress solver.
7. Review individual stress components: hoop, axial, bending.
8. Check von Mises equivalent stress against allowable.
9. Verify safety factor meets design requirements (typically SF >= 3.5 for ASME vessels).
10. For code compliance, cross-check with ASME BPVC or EN 13445 thickness formulas.

## Key quantities and formulas

Hoop (circumferential) stress from internal pressure:

\[
\sigma_h = \frac{p r}{t}
\]

Axial (longitudinal) membrane stress for closed ends:

\[
\sigma_a = \frac{p r}{2t}
\]

Additional axial stress from external loads:

\[
\sigma_{a,\mathrm{ext}} = \frac{F}{2\pi r t} + \frac{M}{\pi r^2 t}
\]

Von Mises equivalent stress (biaxial, no shear):

\[
\sigma_{\mathrm{vm}} = \sqrt{\sigma_h^2 - \sigma_h \sigma_x + \sigma_x^2}
\]

where \( \sigma_x = \sigma_a + \sigma_{a,\mathrm{ext}} \) is the total axial stress.

ASME minimum thickness:

\[
t_{\min} = \frac{p r}{S E_j - 0.6 p}
\]

where \( S \) = allowable stress and \( E_j \) = joint efficiency.

## Worked example

**Problem:** A closed-ended steel cylinder has mean radius 500 mm, wall thickness 8 mm, and operates at 2 MPa internal pressure. An external axial tension of 200 kN is also applied. Material yield = 250 MPa. Evaluate the safety factor.

**Step 1 — Hoop stress:**

\[
\sigma_h = \frac{p r}{t} = \frac{2 \times 500}{8} = 125 \text{ MPa}
\]

**Step 2 — Axial stress (pressure + external load):**

\[
\sigma_a = \frac{p r}{2t} + \frac{F}{2\pi r t} = \frac{2 \times 500}{2 \times 8} + \frac{200 \times 10^3}{2\pi \times 500 \times 8}
\]
\[
\sigma_a = 62.5 + 7.96 = 70.5 \text{ MPa}
\]

**Step 3 — Von Mises equivalent stress:**

\[
\sigma_{\mathrm{vm}} = \sqrt{125^2 - 125 \times 70.5 + 70.5^2} = \sqrt{15625 - 8813 + 4970} = \sqrt{11782} = 108.6 \text{ MPa}
\]

**Step 4 — Safety factor:**

\[
SF = \frac{250}{108.6} = 2.30
\]

Adequate for industrial service (SF > 2.0). For ASME code compliance, compare against code allowable stress (typically \( S = \sigma_u/3.5 \) or \( \sigma_y/1.5 \)).

## Common mistakes and checks

- **Confusing inner radius with mean radius:** ASME formulas use inner radius; membrane theory uses mean radius \( r = r_i + t/2 \). Small difference for thin shells but matters for accuracy.
- **Forgetting the 2:1 hoop-to-axial ratio:** Hoop stress is always twice axial for pressure alone. Longitudinal welds (resisting hoop stress) are the critical joints.
- **Ignoring open vs closed ends:** Open cylinders have no axial membrane stress from pressure. Specifying wrong end condition changes the stress state significantly.
- **Applying to thick shells:** When \( t/r > 0.1 \), Lame's thick-cylinder equations are required. Membrane theory underestimates inner-surface stress.
- **Overlooking buckling under external pressure:** External pressure causes shell buckling (a stability problem), not a membrane stress problem. This module does not handle external pressure collapse.
- **Not accounting for corrosion allowance:** Design thickness = calculated thickness + corrosion allowance (1-3 mm typical). Always add corrosion allowance before specifying fabrication thickness.

## FAQ

### When is thin-shell theory valid?

When \( t/r < 0.1 \) (wall thickness less than 10% of mean radius). Most industrial pressure vessels satisfy this. For thick cylinders, use Lame's equations which account for radial stress variation through the wall.

### How do I determine allowable stress for ASME vessels?

ASME BPVC Section II, Part D provides allowable stresses by material and temperature. For carbon steel at ambient: \( S \approx \min(\sigma_u/3.5, \sigma_y/1.5) \). Joint efficiency \( E_j \) accounts for weld quality (1.0 for full RT, 0.85 for spot RT).

### Does this module handle nozzle reinforcement?

No — nozzle openings create stress concentrations and require separate reinforcement calculations per ASME UG-37 or EN 13445 Section 9. Use this module for the basic shell away from discontinuities.

### What about thermal stresses in the shell?

Thermal gradients through the wall thickness create bending stresses not captured by membrane theory. For significant temperature differences (\( \Delta T > 50 \) K through the wall), perform a thermal stress analysis separately.

### Can I evaluate external pressure (vacuum) vessels?

External pressure causes buckling, not membrane yielding. The module does not perform buckling analysis. Use ASME UG-28 charts or EN 13445 Section 8 for external pressure design.

### How does bending moment affect the shell?

Bending moment creates alternating tension and compression around the circumference, added to the membrane axial stress. The peak stress occurs at the extreme fiber: \( \sigma_{b} = M/(\pi r^2 t) \). This is included in the von Mises calculation.

## Use the PhyCalcPro calculator

[Open the Cylindrical Shells calculator](/products/structural/shells)

**Purpose**

Screen thin cylindrical shells under internal pressure, axial force, and bending moment using membrane theory plus von Mises combined stress. Provides rapid pressure vessel screening for wall thickness adequacy and safety factor evaluation.

**Physics & theory**

For a thin cylinder of mean radius \( r \) and wall thickness \( t \), hoop stress from internal pressure is \( \sigma_h = pr/t \). Closed ends add axial membrane stress \( \sigma_a = pr/(2t) \). External axial load and bending further modify the axial stress. Von Mises equivalent stress combines all components for yield screening.

**Governing equations**

\[
\sigma_h = \frac{pr}{t}, \quad \sigma_a = \frac{pr}{2t} + \frac{F}{2\pi r t} + \frac{M}{\pi r^2 t}, \quad \sigma_{\mathrm{vm}} = \sqrt{\sigma_h^2 - \sigma_h \sigma_a + \sigma_a^2}
\]

**Numerical method**

Closed-form membrane stress evaluation with simplified beam bending deflection estimate via the shell engine solver. No iterative solution required — direct algebraic computation from inputs.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius`, `thickness`, `length` | Shell geometry |
| `internalPressure` | Design pressure \( p \) |
| `axialForce` | External axial load \( F \) |
| `bendingMoment` | External bending moment \( M \) |
| `endCondition` | Open or closed ends |
| `allowableStress` | Design allowable or yield strength |

**Outputs**

- Hoop stress, axial stress, bending stress components
- Von Mises equivalent stress
- Safety factor
- Indicative deflection estimate
- Design status message

**Design codes & checks**

- **Indicative:** Membrane + von Mises screening
- **US:** ASME BPVC Section VIII (pressure vessel context, screening)
- **EU:** EN 13445 (unfired pressure vessel context, screening)

**Assumptions & limitations**

- Thin-shell membrane theory (\( t/r < 0.1 \)).
- No nozzles, knuckles, or geometric discontinuities.
- No buckling under external pressure.
- No thermal stress or fatigue analysis.
- User must supply appropriate load combinations and safety factors.

**Verification**

- CI: verification benchmarks in `src/data/verification/` where available
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed., Ch. 13.
2. ASME BPVC Section VIII, Division 1 — pressure vessel shell design.
3. EN 13445-3:2021. *Unfired pressure vessels — Part 3: Design*.
4. Bednar, H. H. *Pressure Vessel Design Handbook*, 2nd ed. Van Nostrand Reinhold.
5. Moss, D. R., & Basic, M. *Pressure Vessel Design Manual*, 4th ed. Elsevier.
