### Load Case Manager (`load-case-manager`)

**Purpose**

Orchestrate multiple structural load cases and compute envelope results (maximum/minimum stress, deflection, and utilization) across cases. Enables design-by-envelope workflows where the governing load combination is identified without re-running individual module calculations manually.

**Physics & theory**

Structural design requires evaluating several load scenarios — dead, live, wind, seismic, thermal, and operational loads — each factored per the governing code. Rather than solving a single load vector, envelope analysis tracks the extremum of each response quantity across all defined cases: \( R_{\mathrm{env}} = \max_i |R_i| \) or signed envelopes for asymmetric checks.

Linear elastic structures satisfy superposition: responses from independent load cases add when combined. The load case manager stores per-case inputs and results, applies load factors from design code presets, and aggregates utilizations for pass/fail screening. Nonlinear or path-dependent cases (plasticity, contact) are outside scope.

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

**Governing equations**

\[
R_{\mathrm{env}} = \max_{i=1}^{n} \left| R_i \right|
\]

\[
U_{\mathrm{env}} = \max_i \frac{\sigma_i}{\sigma_{\mathrm{allow},i}}
\]

\[
R_{\mathrm{combined}} = \sum_j \gamma_j R_j \quad \text{(linear combination)}
\]

**Numerical method**

Orchestration layer over module solvers: each load case invokes the underlying structural engine (beams, frames, etc.) or stores imported results. Envelope logic scans result arrays and metric summaries to extract governing values. No independent FEM — numerical depth is in aggregation and comparison logic.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Load cases | Named sets of loads with factors |
| Source module | Beam, frame, or imported results |
| Combination rules | Max envelope, sum, or code-specific |
| Allowable limits | Stress, deflection thresholds |

**Outputs**

- Envelope stress utilization, governing load case ID, per-case utilizations, max/min deflection envelopes, summary table for export.

**Design codes & checks**

- **Indicative:** Envelope stress utilization
- **US/EU:** Load combination factors per AISC/ASCE 7 or EN 1990 (user responsibility)

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

- Linear elastic superposition unless cases explicitly marked nonlinear.
- User responsible for correct load factors and combination rules per code.
- Does not perform load pattern optimization or automatic code combination generation.
- Envelope of nonlinear results may be non-conservative.

**References**

1. ASCE/SEI 7-22. *Minimum Design Loads and Associated Criteria for Buildings*.
2. EN 1990:2002. *Eurocode — Basis of structural design*.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter B.
4. ISO 8686:1989. *Cranes — Design principles for loads and load combinations*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
