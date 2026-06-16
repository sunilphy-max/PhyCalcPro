### Vacuum Engineering (`vacuum-engineering`)

**Purpose**

Screen vacuum chamber pump-down time, molecular-flow conductance, chamber force on windows/flanges, and gas throughput at target pressure. Supports preliminary vacuum system sizing for research and industrial hardware.

**Physics & theory**

Ideal gas pump-down follows exponential pressure decay: \( t = (V/S) \ln(P_0/P_f) \) for chamber volume \( V \) and effective pumping speed \( S \). Molecular-flow conductance of a circular tube (air, room temperature) approximates \( C = 12.1\, d^3/L \) L/s with diameter \( d \) and length \( L \) in cm.

Pressure differential across area \( A \) produces force \( F = \Delta P \cdot A \) — critical for viewport and door design. Throughput \( Q = P S \) at target pressure sets required pump capacity for dynamic gas load (outgassing, leaks).

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
t_{\mathrm{pumpdown}} = \frac{V}{S} \ln\left(\frac{P_0}{P_f}\right)
\]

\[
C_{\mathrm{mol}} = \frac{12.1\, d^3}{L} \quad \text{(L/s, cm units)}
\]

\[
F = \Delta P \cdot A, \quad Q = P_f S
\]

**Numerical method**

Closed-form ideal gas pump-down and molecular conductance (`advanced-systems/calculators`). Warnings issued when target pressure remains in viscous-dominated range (> 100 Pa typical transition context).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `volume` | Chamber volume (m³) |
| `pumpSpeed` | Effective pumping speed (m³/s) |
| `initialPressure`, `targetPressure` | Pressure range (Pa) |
| `tubeDiameterMm`, `tubeLength` | Vacuum line geometry |
| `pressureDiff`, `projectedArea` | Force calculation |

**Outputs**

- Pump-down time, molecular conductance (L/s), chamber force (N), target throughput (Pa·m³/s), assumptions and warnings.

**Design codes & checks**

- **Indicative:** Pump-down, conductance, vacuum force screening
- **ISO:** ISO 21360 vacuum pump performance context
- **ASTM:** ASTM E595 outgassing context

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

- Isothermal ideal gas; constant effective pumping speed.
- No viscous–molecular transition modeling or outgassing transients.
- Conductance network not solved — single tube segment only.
- Leak rate testing procedures not included.

**References**

1. O'Hanlon, J. F. *A User's Guide to Vacuum Technology*, 4th ed. Wiley.
2. Roth, A. *Vacuum Technology*, 3rd ed. Elsevier.
3. ISO 21360-1:2012. *Vacuum pumps — Performance test methods*.
4. AVS. *Recommended Practices for Vacuum Technology*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
