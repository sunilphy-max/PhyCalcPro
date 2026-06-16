### Plain Bearings (`plain-bearings`)

**Purpose**

Screen hydrodynamic journal bearings using Sommerfeld number, minimum film thickness, and power loss estimates. Supports preliminary bearing design before detailed Reynolds equation solution.

**Physics & theory**

In a journal bearing, rotating shaft (journal) separates from the bushing by a lubricant film when sufficient speed generates hydrodynamic pressure. The Sommerfeld number \( S = (\mu n / p)(r/c)^2 \) characterizes operation, where \( \mu \) is viscosity, \( n \) is speed, \( p \) is unit load, \( r \) is radius, and \( c \) is radial clearance.

Minimum film thickness \( h_{\min} \) occurs near the maximum pressure arc; it must exceed composite surface roughness to avoid boundary contact. Eccentricity ratio \( \varepsilon \) relates to \( S \) through film theory charts (Sommerfeld, Ocvirk, or short-bearing approximations). Power loss is viscous shear in the film: \( P \propto \mu n^2 r^3 L / c \).

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
S = \frac{\mu n}{p}\left(\frac{r}{c}\right)^2, \quad p = \frac{W}{2 r L}
\]

\[
h_{\min} = c(1 - \varepsilon)
\]

\[
P_{\mathrm{loss}} = \frac{2\pi^2 \mu n^2 r^3 L}{c}
\]

**Numerical method**

Sommerfeld screening with chart-based or approximate \( \varepsilon(S) \) relations. Inputs: diameter, length, clearance, load, speed, viscosity. Outputs: \( S \), \( h_{\min} \), eccentricity, power loss, temperature rise estimate (optional simplified).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Journal diameter, length | Bearing geometry |
| Radial clearance \( c \) | Assembly clearance |
| `load`, `speed` | Operating W and rpm |
| Oil viscosity \( \mu \) | At operating temperature |
| Surface roughness | For film ratio \( h_{\min}/R_q \) |

**Outputs**

- Sommerfeld number, eccentricity ratio, minimum film thickness, film ratio, power loss, unit load.

**Design codes & checks**

- **Indicative:** Sommerfeld screening, minimum film thickness
- **ISO:** ISO 7902 plain bearing calculation (reference)

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Full journal, steady-state, isoviscous lubrication.
- Short-bearing or Sommerfeld boundary — not full finite-length Reynolds solution.
- No dynamic instability (oil whirl/whip) analysis.
- Thermal viscosity variation simplified or user-adjusted.

**References**

1. Hamrock, B. J., Schmid, S. R., & Jacobson, B. O. *Fundamentals of Fluid Film Lubrication*, 2nd ed. CRC Press.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 12.
3. ISO 7902-1:2020. *Calculation of plain bearings — Hydrodynamic plain journal bearings*.
4. Bassani, R., & Piccigallo, B. *Hydrostatic Lubrication*. Elsevier.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
