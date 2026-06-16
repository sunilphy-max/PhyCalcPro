### Tolerance Stackup (`tolerance`)

**Purpose**

Analyze dimensional variation accumulation in assemblies using worst-case and statistical (RSS) methods, with optional Monte Carlo simulation. Supports GD&T stack analysis for manufacturing tolerance planning.

**Physics & theory**

Each dimension in a chain contributes uncertainty \( \pm t_i \). Worst-case stack assumes all tolerances at extreme simultaneous values: \( T_{\mathrm{WC}} = \sum |t_i| \). Root-sum-square (RSS) assumes independent normal distributions: \( T_{\mathrm{RSS}} = \sqrt{\sum t_i^2} \), typically yielding tighter assembly tolerance than worst-case for the same part tolerances.

Monte Carlo draws random deviations per dimension and sums to build distribution of assembly dimension — mean and standard deviation quantify expected variation. ASME Y14.5 GD&T defines tolerance zones; this module operates on numeric tolerance values extracted from drawings.

Manufacturing modules support design-for-manufacture decisions early in product development. Tolerance analysis should identify critical dimensions in the stack — tightening non-critical tolerances increases cost without improving function.

Fit selection balances assembly ease, alignment precision, and load transmission. Interference fits provide torque capacity without keys but require controlled press force and material compatibility.

**Governing equations**

\[
T_{\mathrm{WC}} = \sum_{i=1}^{n} |t_i|
\]

\[
T_{\mathrm{RSS}} = \sqrt{\sum_{i=1}^{n} t_i^2}
\]

\[
\mu_{\mathrm{MC}} = \frac{1}{N}\sum_{j=1}^{N} x_j, \quad \sigma_{\mathrm{MC}} = \sqrt{\frac{1}{N-1}\sum (x_j - \mu)^2}
\]

**Numerical method**

Closed-form WC and RSS (`engine` in manufacturing module). Optional Monte Carlo with uniform or normal sampling over `monteCarloSamples` iterations. Separate X/Y stacks when 2D variation provided.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `tolerances` | Array of ± tolerances per dimension |
| `tolerancesY` (optional) | Secondary stack direction |
| `monteCarloSamples` | Simulation count (0 = skip) |
| Nominal stack direction | Additive chain definition |

**Outputs**

- Worst-case total
- RSS total
- Monte Carlo mean and standard deviation (if run), per-direction stacks.

**Design codes & checks**

- **Indicative:** Worst-case and RSS stack
- **US:** ASME Y14.5 dimensioning and tolerancing
- **ISO:** ISO 286 tolerance principles (related)

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

- Linear stack chains; no geometric tolerance zone conversion from GD&T without manual equivalent.
- RSS assumes normal, independent variations — not valid for skewed processes.
- Monte Carlo quality depends on sample count and input distribution assumptions.
- No assembly shift or thermal expansion unless added as dimensions.

**References**

1. ASME Y14.5-2018. *Dimensioning and Tolerancing*.
2. Wick, C. H., et al. *Tolerance Stack Up Analysis*, 2nd ed. ASME Press.
3. ISO 286-1:2010. *Limits and fits*.
4. Srinivasan, V. *Statistical Tolerance Analysis*. ASME Handbook.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
