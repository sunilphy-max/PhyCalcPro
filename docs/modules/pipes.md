### Pipe Stress Analysis (`pipes`)

**Purpose**

Analyze cylindrical pipes under internal pressure, thermal expansion, and weight loads using ring–beam FEM. Computes hoop, longitudinal, and combined stresses with ASME B31.3 sustained, occasional, and peak stress screening.

**Physics & theory**

Thin-wall hoop stress from internal pressure: \( \sigma_h = pr/t \). Longitudinal stress from pressure end cap: \( \sigma_l = pr/(2t) \). Thermal expansion strain \( \alpha \Delta T \) generates stress if expansion is restrained by supports. Weight and sagging add bending in long horizontal spans.

ASME B31.3 categorizes stresses: sustained (pressure + weight), occasional (wind/seismic), and peak (thermal transients). Each has allowable limits based on yield and fatigue at discontinuities. Thick-wall pipes use Lamé solution when \( t/r > 0.1 \).

Pressure systems combine membrane stress from internal pressure with bending from weight, thermal expansion, and external loads. ASME codes distinguish sustained, occasional, and peak stress categories with different allowable limits reflecting primary vs secondary stress character.

Thin-wall theory applies when wall thickness is small compared to radius; thick-wall Lamé solutions are required for heavy-wall vessels and high-pressure cylinders.

**Governing equations**

\[
\sigma_h = \frac{p r}{t}, \quad \sigma_l = \frac{p r}{2t}
\]

\[
\sigma_{\mathrm{sustained}} = \sqrt{\sigma_h^2 + \sigma_l^2 + \sigma_{\mathrm{bend}}^2}
\]

\[
\sigma_{\mathrm{allow,sustained}} = f \cdot S_y
\]

**Numerical method**

Ring–beam pipe FEM (`solver`): pipe meshed along length with circumferential ring stiffness for pressure. Thermal and weight loads superposed. Post-processing extracts stress components and B31.3 utilization categories.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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
- sustained/occasional/peak utilization
- deflection
- expansion thrust.

**Design codes & checks**

- **Indicative:** Thin-wall pipe stress
- **US:** ASME B31.3 §302.3 sustained, §302.3.6 occasional, peak/upset

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Straight single pipe segment; no fittings, branches, or flanges modeled.
- Linear elastic; no plastic shake-down analysis.
- Stress intensification at welds requires user SIF factors for detailed work.
- Minimum 8 segments required for adequate ring resolution.

**References**

1. ASME B31.3:2022. *Process Piping*.
2. Timoshenko, S. P., & Woinowsky-Krieger, S. *Theory of Plates and Shells*.
3. Spuybroek, W. H. *Flexibility Analysis of Piping Systems*. Kluwer.
4. ASME BPVC Section III (nuclear piping context, reference).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
