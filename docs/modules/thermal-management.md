### Thermal Management (`thermal-management`)

**Purpose**

Combine parallel conduction, convection, radiation, and coolant flow estimates for steady-state heat rejection from electronics, cold plates, and advanced hardware. Reports effective thermal resistance and coolant temperature rise.

**Physics & theory**

Heat flows through parallel paths from hot surface at \( T_h \) to ambient. Conduction through solid: \( Q_c = k A \Delta T / t \). Convection to fluid or air: \( Q_{\mathrm{conv}} = h A \Delta T \). Radiation: \( Q_r = \varepsilon \sigma A (T_h^4 - T_{\mathrm{amb}}^4) \).

Total capacity \( Q_{\mathrm{tot}} = Q_c + Q_{\mathrm{conv}} + Q_r \) (screening sum). Effective resistance \( R_{\mathrm{th}} = \Delta T / Q_{\mathrm{tot}} \). Coolant mass flow required: \( \dot{m} = Q_{\mathrm{tot}} / (c_p \Delta T_{\mathrm{coolant}}) \).

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
Q_c = \frac{k A \Delta T}{t}, \quad Q_{\mathrm{conv}} = h A \Delta T
\]

\[
Q_r = \varepsilon \sigma A (T_h^4 - T_{\mathrm{amb}}^4)
\]

\[
R_{\mathrm{th}} = \frac{\Delta T}{Q_{\mathrm{tot}}}, \quad \Delta T_{\mathrm{coolant}} = \frac{Q_{\mathrm{tot}}}{\dot{m} c_p}
\]

**Numerical method**

Parallel path capacity summation (`advanced-systems/calculators`). Paths treated as independent capacity estimates — not series thermal network unless user configures equivalent \( \Delta T \).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `deltaT`, `area` | Driving potential and area |
| `thickness`, `conductivity` | Conduction path |
| `convectionCoefficient` | \( h \) (W/m²·K) |
| `emissivity`, `hotTemperature`, `ambientTemperature` | Radiation |
| `flowRate`, `coolantCp` | Liquid cooling |

**Outputs**

- Conduction, convection, radiation components (W), total capacity, thermal resistance (K/W), coolant rise (K).

**Design codes & checks**

- **Indicative:** Heat-transfer capacity, thermal resistance screening
- **JEDEC:** Electronics thermal practice (context)
- **ASHRAE:** Heat transfer data (reference)

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

- Steady-state lumped model; no transient or spatial gradients.
- Parallel path summation may overestimate if paths are actually series-dominated.
- No spreading resistance, contact interface resistance, or two-phase boiling.
- CFD and fin efficiency not computed.

**References**

1. Incropera, F. P., et al. *Fundamentals of Heat and Mass Transfer*, 8th ed.
2. JEDEC JESD51 series. *Thermal characterization of semiconductor devices*.
3. ASHRAE Handbook — Fundamentals.
4. Lee, S. *Optimum Design and Selection of Heat Sinks*. IEEE Trans. COM-25.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
