### Corrosion Allowance (`corrosion`)

**Purpose**

Calculate required wall thickness including corrosion allowance and estimate remaining service life based on corrosion rate. Used for piping, vessels, and structural steel in corrosive environments.

**Physics & theory**

Corrosion progressively removes material from exposed surfaces at rate \( r \) (mm/year typically). Design thickness must satisfy pressure/stress requirements at end of service life: \( t_{\mathrm{design}} = t_{\mathrm{min}} + CA \), where corrosion allowance \( CA = r \cdot t_{\mathrm{life}} \).

Remaining life from inspection measurement: \( t_{\mathrm{remaining}} = (t_{\mathrm{measured}} - t_{\mathrm{min}})/r \). Allowable stress uses reduced thickness in hoop or general membrane formulas. Galvanic, pitting, and crevice corrosion require higher allowances than uniform general corrosion models.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
CA = r \cdot t_{\mathrm{design\ life}}
\]

\[
t_{\mathrm{required}} = t_{\mathrm{pressure}} + CA
\]

\[
t_{\mathrm{remaining\ life}} = \frac{t_{\mathrm{now}} - t_{\mathrm{min}}}{r}
\]

**Numerical method**

Closed-form allowance and life equations (`engine`). User supplies corrosion rate, design life, minimum structural thickness, and optional measured thickness for remaining life.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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

- Uniform general corrosion; localized pitting not modeled.
- Constant corrosion rate over life — no inhibition or passivation change.
- Does not select CRA materials or coatings.
- Inspection interval planning is user responsibility.

**References**

1. ASME B31.3:2022. *Process Piping*, corrosion allowance.
2. ASME BPVC Section VIII, Division 1, UG-25.
3. NACE SP0169. *Control of External Corrosion on Underground Pipelines*.
4. API 570. *Piping Inspection Code*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
