### Superconducting Systems (`superconducting-systems`)

**Purpose**

Screen superconducting magnet operating margins — current, temperature, stored energy, dump voltage, and cryogenic cooling balance. Provides scalar safety margins before detailed quench protection analysis.

**Physics & theory**

Superconductors carry lossless current below critical current \( I_c(T) \) and critical temperature \( T_c \). Operating point \( (I, T) \) must stay below critical surface. Stored inductive energy \( E = \frac{1}{2} L I^2 \) must be safely dissipated during quench through dump resistor without exceeding insulation voltage.

Quench dump: voltage \( V = I R_d \) across dump resistance \( R_d \); discharge time constant \( \tau = L/R_d \). Static heat leak into cold mass must remain below cryocooler capacity to maintain operating temperature.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
E = \frac{1}{2} L I^2
\]

\[
M_I = \frac{I_c - I_{\mathrm{op}}}{I_c}, \quad M_T = T_c - T_{\mathrm{op}}
\]

\[
V_{\mathrm{dump}} = I R_d, \quad \tau = \frac{L}{R_d}
\]

**Numerical method**

Scalar margin screening (`advanced-systems/calculators`). Negative margins flagged in warnings. No finite-element quench propagation or critical surface interpolation.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `inductance`, `operatingCurrent` | Magnet electrical |
| `criticalCurrent`, `criticalTemperature` | SC limits |
| `operatingTemperature` | Bath temperature (K) |
| `dumpResistance` | Protection resistor |
| `heatLoad`, `coolingPower` | Cryogenic balance |

**Outputs**

- Stored energy, current margin, temperature margin, dump voltage, discharge τ, cooling margin, warnings.

**Design codes & checks**

- **Indicative:** Current/temperature margin, stored energy screening
- **IEC:** Superconductivity terminology and magnet practice (context)

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

- Scalar margins only; no conductor critical surface \( I_c(B,T,\varepsilon) \).
- Quench propagation, hotspot formation, and insulation stress not modeled.
- Single lumped inductance and dump resistance.
- Does not replace qualified quench protection system design.

**References**

1. Wilson, M. N. *Superconducting Magnets*. Oxford University Press.
2. Iwasa, Y. *Case Studies in Superconducting Magnets*, 2nd ed. Springer.
3. IEC 60050-815. *International Electrotechnical Vocabulary — Superconductivity*.
4. Ekin, J. W. *Experimental Techniques for Low-Temperature Measurements*. Oxford.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
