### Precision Motion & Vibration (`precision-motion`)

**Purpose**

Estimate flexure stiffness, natural frequency, thermal drift, and vibration isolation transmissibility for precision optomechanical and machine tool subsystems. Supports early-stage compliance and isolation design.

**Physics & theory**

Cantilever flexure tip stiffness \( k = 3EI/L^3 \) for elastic modulus \( E \), second moment \( I \), and length \( L \). SDOF natural frequency \( f_n = \frac{1}{2\pi}\sqrt{k/m} \). Thermal drift \( \delta_{\mathrm{th}} = \alpha L \Delta T \) from expansion coefficient \( \alpha \).

Base-excitation transmissibility for damping ratio \( \zeta \) and frequency ratio \( r = f_{\mathrm{exc}}/f_n \):

\[
TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1-r^2)^2 + (2\zeta r)^2}}
\]

Values \( TR < 1 \) indicate isolation above resonance; near \( r \approx 1 \), amplification occurs.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
k = \frac{3 E I}{L^3}, \quad f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}}
\]

\[
\delta_{\mathrm{th}} = \alpha L \Delta T
\]

\[
TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1-r^2)^2 + (2\zeta r)^2}}
\]

**Numerical method**

Closed-form flexure, thermal, and SDOF transmissibility (`advanced-systems/calculators`). Resonance warning when \( 0.8 < r < 1.2 \).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `elasticModulus`, `inertia`, `flexureLength` | Flexure geometry |
| `movingMass` | Payload mass |
| `alpha`, `referenceLength`, `deltaT` | Thermal drift |
| `excitationFrequency`, `dampingRatio` | Vibration isolation |

**Outputs**

- Flexure stiffness (N/m), natural frequency (Hz), thermal drift (m), frequency ratio, transmissibility.

**Design codes & checks**

- **Indicative:** Stiffness, natural frequency, transmissibility screening
- **ISO:** ISO 230 machine tool accuracy; ISO 20816 vibration context

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

- Single cantilever flexure; multi-axis flexure systems not modeled.
- SDOF isolation; no multi-mode or active control.
- Linear elasticity; flexure stress limits not checked.
- Abbe error and motion cross-coupling omitted.

**References**

1. Smith, S. T., & Chetwynd, D. G. *Foundations of Ultraprecision Mechanism Design*. Gordon and Breach.
2. Slocum, A. H. *Precision Machine Design*. SME.
3. ISO 230-1:2012. *Test code for machine tools — Geometric accuracy*.
4. Rao, S. S. *Mechanical Vibrations*, 6th ed., transmissibility chapter.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
