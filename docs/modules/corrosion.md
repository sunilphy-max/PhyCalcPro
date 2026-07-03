### Corrosion Allowance (`corrosion`)

**Purpose**

Calculate required wall thickness including corrosion allowance and estimate remaining service life based on corrosion rate. Used for piping, vessels, and structural steel in corrosive environments.

**Physics & theory**

Corrosion progressively removes material from exposed surfaces at rate \( r \) (mm/year typically). Design thickness must satisfy pressure/stress requirements at end of service life: \( t_{\mathrm{design}} = t_{\mathrm{min}} + CA \), where corrosion allowance \( CA = r \cdot t_{\mathrm{life}} \).

Remaining life from inspection measurement: \( t_{\mathrm{remaining}} = (t_{\mathrm{measured}} - t_{\mathrm{min}})/r \). Allowable stress uses reduced thickness in hoop or general membrane formulas. Galvanic, pitting, and crevice corrosion require higher allowances than uniform general corrosion models.

Inspection thickness readings anchor remaining-life estimates; localized pitting may require a higher allowance than the uniform-rate model predicts.

**Governing equations**

\[
CA = r \cdot t_{\mathrm{design\_life}}
\]

\[
t_{\mathrm{required}} = t_{\mathrm{pressure}} + CA
\]

\[
t_{\mathrm{remaining\_life}} = \frac{t_{\mathrm{now}} - t_{\mathrm{min}}}{r}
\]

**Numerical method**

Closed-form allowance and life equations (`engine`). User supplies corrosion rate, design life, minimum structural thickness, and optional measured thickness for remaining life.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `corrosionRate` | Material loss rate (mm/year) |
| `designLife` | Intended service years |
| `minThickness` | Structural/pressure minimum |
| `measuredThickness` (optional) | Current inspection reading |
| Environment class | Informative severity |

**Outputs**

- Corrosion allowance, required thickness, remaining life margin, thickness utilization.

**Design codes & checks**

- **Indicative:** Remaining life margin, required thickness margin
- **US:** ASME B31.3 corrosion allowance guidance
- **US:** ASME VIII-1 UG-25 corrosion allowance


**Assumptions & limitations**

- Uniform general corrosion; localized pitting not modeled.
- Constant corrosion rate over life — no inhibition or passivation change.
- Does not select CRA materials or coatings.
- Inspection interval planning is user responsibility.

**Verification**

- CI: `corrosion-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ASME B31.3:2022. *Process Piping*, corrosion allowance.
2. ASME BPVC Section VIII, Division 1, UG-25.
3. NACE SP0169. *Control of External Corrosion on Underground Pipelines*.
4. API 570. *Piping Inspection Code*.
5. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
