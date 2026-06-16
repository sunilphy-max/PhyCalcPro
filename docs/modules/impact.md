### Impact & Shock (`impact`)

**Purpose**

Estimate impulse, average impact force, and dynamic stress during short-duration velocity changes. Screens structural components against yield during drop, collision, or shock loading using simplified dynamic load factors.

**Physics & theory**

Impulse-momentum theorem: \( J = m \Delta v = F_{\mathrm{avg}} \Delta t \). For mass \( m \) experiencing velocity change \( \Delta v \) over impact duration \( \Delta t \), average force \( F_{\mathrm{avg}} = m \Delta v / \Delta t \) can exceed static load by dynamic amplification factor \( D = t_{\mathrm{period}}/(2\Delta t) \) for elastic systems.

Dynamic stress \( \sigma_d = F_{\mathrm{avg}}/A \) compared to yield gives safety factor. Short impact durations (milliseconds) produce high forces; energy absorption through plastic deformation or damping reduces peak stress below rigid estimate.

Dynamic analysis requires careful identification of mass, stiffness, and damping distribution. Natural frequencies depend on boundary conditions — a cantilever beam has fundamentally different modes than a simply supported beam of the same dimensions.

Damping limits resonant amplification; lightly damped structures (( zeta < 0.05 )) can see transmissibility peaks exceeding 10 near resonance. Separation margin between operating excitation and natural frequency should typically exceed 15–20% for rotating machinery.

**Governing equations**

\[
J = m \Delta v = F_{\mathrm{avg}} \Delta t
\]

\[
\sigma_d = \frac{F_{\mathrm{avg}}}{A}, \quad SF = \frac{\sigma_y}{\sigma_d}
\]

**Numerical method**

Closed-form impulse and average force (`engine`). Impact duration converted from milliseconds to seconds with minimum floor \( 10^{-4} \) s. Dynamic stress from force over cross-section area; design status flagged at SF thresholds.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `mass` | Moving mass |
| `velocityChange` | Speed change magnitude |
| `impactDuration` | Contact time (ms) |
| `crossSectionArea` | Load-bearing area (mm²) |
| `yieldStrength` | Material yield (MPa) |

**Outputs**

- Impulse, average force, dynamic stress, safety factor, design status (safe/warning/critical).

**Design codes & checks**

- **Indicative:** Dynamic load factor / yield safety factor

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Design practice note**

Screening results from this module inform preliminary sizing and design reviews. Final designs subject to applicable regulations, customer specifications, and qualified engineering approval should use full code-compliant methods, manufacturer data, and test validation beyond the indicative checks shown in PhyCalcPro.

**Assumptions & limitations**

- Uniform average force over duration; no force-time waveform.
- Single DOF; no wave propagation or stress concentration.
- Impact duration must be estimated or measured — highly uncertain.
- Plastic energy absorption not subtracted from impulse.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 4.
2. Rao, S. S. *Mechanical Vibrations*, 6th ed., shock response.
3. MIL-STD-810. *Environmental Engineering Considerations and Laboratory Tests*.
4. Barrow, H. D. *Applied Mechanics*, impact problems.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
