---
seoTitle: "Pressure Vessel Calculator – Hoop Stress, ASME VIII & Lamé Thick-Wall Analysis"
seoDescription: "Design cylindrical and spherical pressure vessels with thin-wall hoop stress, thick-wall Lamé theory, ASME VIII-1 UG-27, and EN 13445 screening using PhyCalcPro."
guideHeadline: "Pressure Vessel Design — Hoop Stress, ASME VIII & Thick-Wall Analysis Guide"
keywords: ["pressure vessel calculator", "hoop stress", "ASME VIII", "thin wall", "thick wall", "Lamé", "vessel design", "UG-27"]
---

### Pressure Vessel Design Guide (`vessels`)

## How engineers design pressure vessels

Pressure vessels contain fluids at pressures significantly above (or below) atmospheric. They appear throughout the chemical, petrochemical, power generation, and food processing industries. Design is governed by mandatory codes — ASME Boiler and Pressure Vessel Code (BPVC) Section VIII in North America, EN 13445 in Europe — because failure can be catastrophic.

The fundamental design question is: *What wall thickness provides adequate strength against burst while remaining economically practical?* The answer depends on the vessel geometry (cylinder, sphere, cone), the design pressure and temperature, material allowable stress, joint efficiency of welded seams, and corrosion allowance for the service life.

## Types and configurations

| Vessel type | Stress state | Governing formula |
|---|---|---|
| Thin cylindrical shell | Biaxial: hoop + longitudinal | \( t = pR/(SE - 0.6p) \) (ASME UG-27) |
| Thin spherical shell | Equal biaxial | \( t = pR/(2SE - 0.2p) \) |
| Thick cylinder (Lamé) | Triaxial: hoop + longitudinal + radial | Lamé equations through wall |
| Ellipsoidal head (2:1) | Membrane + bending at knuckle | Equivalent sphere factor |
| Hemispherical head | Equal biaxial | Same as sphere |
| Flat head | Bending dominant | \( t = d\sqrt{C\,p/S} \) |

Thin-wall theory applies when \( t/R \leq 0.1 \). Above this ratio, radial stress variation through the wall becomes significant and thick-wall (Lamé) analysis is required.

## Engineering workflow

1. **Define design conditions** — Design pressure (typically 10 % above maximum operating pressure or 10 psi, whichever is greater), design temperature, and corrosion allowance.
2. **Select material** — Choose a code-listed material with an allowable stress \( S \) at the design temperature (ASME Section II, Part D).
3. **Determine joint efficiency** — \( E \) depends on weld type and examination level: \( E = 1.0 \) for full radiography, \( E = 0.85 \) for spot, \( E = 0.70 \) for none.
4. **Compute required thickness** — Apply the governing formula for the shell and each head type.
5. **Add corrosion allowance** — Typically 1.5–3.0 mm for carbon steel in mildly corrosive service.
6. **Select next standard plate thickness** — Round up to the nearest commercially available plate gauge.
7. **Verify with code checks** — Maximum allowable working pressure (MAWP) at the selected thickness must meet or exceed the design pressure.

## Key quantities and formulas

**Required thickness — cylindrical shell (ASME UG-27)**

\[
t = \frac{p\,R}{S\,E - 0.6\,p}
\]

**Thin-wall hoop and longitudinal stress**

\[
\sigma_h = \frac{p\,r}{t}, \quad \sigma_l = \frac{p\,r}{2t}
\]

Hoop stress is exactly twice the longitudinal stress in a thin cylinder — this is why cylinders fail along longitudinal seams first.

**Thick-wall (Lamé) hoop stress at inner radius**

\[
\sigma_{h,\mathrm{max}} = p\,\frac{r_o^2 + r_i^2}{r_o^2 - r_i^2}
\]

**Thick-wall radial stress distribution**

\[
\sigma_r(r) = \frac{p_i\,r_i^2 - p_o\,r_o^2}{r_o^2 - r_i^2} - \frac{(p_i - p_o)\,r_i^2\,r_o^2}{(r_o^2 - r_i^2)\,r^2}
\]

## Worked example

**Problem:** Design a cylindrical vessel for 2.0 MPa internal pressure. Inside diameter 1200 mm, SA-516 Grade 70 steel (\( S = 138 \) MPa at 250 C), double-welded butt joints with full RT (\( E = 1.0 \)), corrosion allowance 3.0 mm.

1. Inside radius: \( R = 600 \) mm.
2. Required thickness (UG-27): \( t = 2.0 \times 600 / (138 \times 1.0 - 0.6 \times 2.0) = 1200/136.8 = 8.77 \) mm.
3. Add corrosion allowance: \( 8.77 + 3.0 = 11.77 \) mm.
4. Select 12 mm plate (next standard gauge).
5. Hoop stress at design condition (corroded): \( \sigma_h = 2.0 \times 600 / (12 - 3) = 133.3 \) MPa.
6. Utilization: \( 133.3 / 138 = 96.6\% \) — tight but within code limits.
7. MAWP at 12 mm (corroded): \( p = 138 \times 1.0 \times 9 / (600 + 0.6 \times 9) = 2.05 \) MPa — exceeds design pressure.
8. Check thin-wall applicability: \( t/R = 12/600 = 0.02 \) — thin-wall theory valid.

## Common mistakes and checks

- **Forgetting corrosion allowance** — Designing to the exact required thickness leaves no margin for wall loss in service. Always add corrosion allowance before selecting plate thickness.
- **Wrong radius convention** — ASME UG-27 uses inside radius \( R \); some formulas use mean radius. Mixing conventions introduces a systematic error of \( t/2 \).
- **Ignoring joint efficiency** — Using \( E = 1.0 \) when welds are not fully radiographed overstates the allowable pressure by up to 43 % (if actual \( E = 0.70 \)).
- **Omitting head design** — Shell thickness is not sufficient alone; ellipsoidal and torispherical heads have their own thickness formulas and may govern the design.
- **Applying thin-wall formula to thick vessels** — When \( t/R > 0.1 \), thin-wall theory underestimates hoop stress at the inner surface. Switch to Lamé analysis.

## FAQ

### When is thick-wall (Lamé) analysis needed?
When the wall thickness exceeds 10 % of the inside radius (\( t/R > 0.1 \)). This is common for high-pressure vessels (above about 10–20 MPa) and small-diameter cylinders like hydraulic actuators.

### What is joint efficiency and how do I select it?
Joint efficiency \( E \) reflects the quality assurance level of welded seams. ASME UG-51 to UG-57 define categories: \( E = 1.0 \) for fully radiographed double-butt welds, \( E = 0.85 \) for spot radiography, and \( E = 0.70 \) for no radiographic examination.

### How does temperature affect allowable stress?
Material strength decreases at elevated temperatures. ASME Section II, Part D provides allowable stress values as a function of temperature. At 400 C, allowable stress for SA-516 Gr. 70 drops to about 110 MPa from 138 MPa at 250 C.

### Does the calculator check nozzle reinforcement?
The current module screens shell and head thickness per UG-27/UG-32. Nozzle reinforcement per UG-37 (area replacement method) is not yet implemented — consult code for nozzle cutouts.

### What about external pressure (vacuum)?
External pressure introduces buckling as the governing failure mode rather than yielding. ASME UG-28 provides charts for external pressure design. The current module focuses on internal pressure; use buckling modules for vacuum or jacketed vessels.

## Use the PhyCalcPro calculator

Design pressure vessel shells with hoop stress and code screening in the [Pressure Vessel Calculator](/products/pressure/vessels).

---

**Purpose**

Design and analyze cylindrical and spherical pressure vessel shells for internal pressure using thin-wall and thick-wall (Lamé) theory with ASME VIII-1 UG-27 and EN 13445 screening checks.

**Physics & theory**

Thin cylindrical shells (\( t/R \leq 0.1 \)): hoop stress \( \sigma_h = pR/t \) governs; longitudinal \( \sigma_l = pR/(2t) \). Spherical shells: \( \sigma = pR/(2t) \). Required thickness \( t = pR/(SE - 0.6p) \) per ASME UG-27 with joint efficiency \( E \) and allowable stress \( S \).

Thick-wall cylinders use Lamé stresses varying through wall thickness. The maximum hoop stress occurs at the inner surface and exceeds the thin-wall approximation by a factor that depends on the radius ratio. Heads (elliptical, hemispherical, flat) have separate formulas for discontinuity stresses at shell-head junction.

**Governing equations**

\[
t = \frac{p\,R}{S\,E - 0.6\,p} \quad \text{(cylindrical, ASME UG-27)}
\]

\[
\sigma_h = \frac{p\,r}{t}, \quad \sigma_l = \frac{p\,r}{2t}
\]

\[
\sigma_r(r) = \frac{p_i\,r_i^2 - p_o\,r_o^2}{r_o^2 - r_i^2} - \frac{(p_i - p_o)\,r_i^2\,r_o^2}{(r_o^2 - r_i^2)\,r^2} \quad \text{(Lam\'{e})}
\]

**Numerical method**

Thin/thick-wall closed-form with optional FEM mesh for nozzle or head transitions (`engine`, `mesh`). Required thickness and hoop utilization computed per selected code. Joint efficiency and corrosion allowance user-specified.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius`, `thickness` | Shell geometry |
| `pressure` | Internal design pressure |
| Material allowable \( S \), yield | Code allowable |
| Joint efficiency \( E \) | Seam weld factor |
| Corrosion allowance | Added to required \( t \) |
| Head type | Cylinder, sphere, elliptical |

**Outputs**

- Hoop/longitudinal stress, required thickness, utilization, thick vs thin-wall flag.

**Design codes & checks**

- **Indicative:** Hoop stress and required thickness screening
- **US:** ASME VIII-1 UG-27
- **EU:** EN 13445-3 design rules

**Assumptions & limitations**

- No detailed nozzle reinforcement per UG-37 unless extended.
- Wind/seismic external loads not combined unless user superposes.
- Fatigue evaluation per VIII-2 not included.
- MDMT and impact testing requirements not evaluated.

**Verification**

- CI: `vessels-indicative-01.json` (where available)
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ASME BPVC Section VIII, Division 1 (2023). UG-27.
2. EN 13445-3:2021. *Unfired pressure vessels — Design*.
3. Harvey, J. F. *Theory and Design of Pressure Vessels*, 2nd ed.
4. Bednar, H. H. *Pressure Vessel Design Handbook*, 3rd ed.
5. Moss, D. R. *Pressure Vessel Design Manual*, 4th ed.
