### Battery & EV Systems (`battery-ev-systems`)

**Purpose**

Screen battery pack nominal energy, ohmic heat generation, required cooling flow, minimum busbar cross-section, and simple vent area for EV and stationary storage packs at concept design stage.

**Physics & theory**

Pack configuration: \( N_s \) series × \( N_p \) parallel cells. Nominal voltage \( V_{\mathrm{pack}} = N_s V_{\mathrm{cell}} \); energy \( E = V_{\mathrm{pack}} N_p C_{\mathrm{Ah}} \) (Wh). Cell heating from internal resistance: \( P = N_{\mathrm{total}} I_{\mathrm{cell}}^2 R_{\mathrm{cell}} \) with \( I_{\mathrm{cell}} = I_{\mathrm{pack}}/N_p \).

Coolant mass flow \( \dot{m} = P / (c_p \Delta T_{\mathrm{allow}}) \) removes heat at allowable temperature rise. Busbar area from current density limit \( A_{\mathrm{bar}} = I / j_{\mathrm{allow}} \). Vent area from volumetric gas flow and target velocity during abuse scenario — first-pass screen only.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
V_{\mathrm{pack}} = N_s V_{\mathrm{cell}}, \quad E_{\mathrm{kWh}} = \frac{V_{\mathrm{pack}} N_p C_{\mathrm{Ah}}}{1000}
\]

\[
P_{\mathrm{heat}} = N_s N_p I_{\mathrm{cell}}^2 R_{\mathrm{cell}}
\]

\[
\dot{m} = \frac{P_{\mathrm{heat}}}{c_p \Delta T}, \quad A_{\mathrm{bar}} = \frac{I}{j_{\mathrm{allow}}}
\]

**Numerical method**

Closed-form pack electrical and thermal screening (`advanced-systems/calculators`). Vent area from gas generation rate / target velocity — not full thermal runaway simulation.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `seriesCells`, `parallelCells` | Pack topology |
| `cellVoltage`, `cellCapacityAh` | Cell specs |
| `current`, `cellResistance` | Load and heat |
| `allowableCurrentDensity` | Busbar limit (A/mm²) |
| `coolantCp`, `coolantDeltaT` | Cooling |
| `gasGenerationRate`, `ventVelocity` | Vent screening |

**Outputs**

- Pack voltage, energy (kWh), heat generation (W), cooling mass flow, busbar area (mm²), vent area (m²).

**Design codes & checks**

- **Indicative:** Pack energy, heat, vent screening
- **ISO:** ISO 6469 electric road vehicle safety (context)
- **UL:** UL 2580 battery safety (context)
- **SAE:** SAE J2464 abuse testing (context)

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Uniform cell parameters; no cell-to-cell imbalance or BMS logic.
- \( I^2R \) heating only; no entropic heat or reaction heat during abuse.
- Vent sizing is volumetric screen — not regulatory compliance tool.
- No propagation, enclosure rupture, or state-of-charge maps.

**References**

1. Plett, G. L. *Battery Management Systems*, Vol. I & II. Artech House.
2. ISO 6469-1:2019. *Electrically propelled road vehicles — Safety specifications*.
3. UL 2580. *Batteries for Use in Electric Vehicles*.
4. SAE J2464. *Electric and Hybrid Electric Vehicle Rechargeable Energy Storage System Safety*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
