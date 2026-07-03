### Load Case Manager (`load-case-manager`)

**Purpose**

Orchestrate multiple structural load cases and compute envelope results (maximum/minimum stress, deflection, and utilization) across cases. Enables design-by-envelope workflows where the governing load combination is identified without re-running individual module calculations manually.

**Physics & theory**

Structural design requires evaluating several load scenarios — dead, live, wind, seismic, thermal, and operational loads — each factored per the governing code. Rather than solving a single load vector, envelope analysis tracks the extremum of each response quantity across all defined cases: \( R_{\mathrm{env}} = \max_i |R_i| \) or signed envelopes for asymmetric checks.

Linear elastic structures satisfy superposition: responses from independent load cases add when combined. The load case manager stores per-case inputs and results, applies load factors from design code presets, and aggregates utilizations for pass/fail screening. Nonlinear or path-dependent cases (plasticity, contact) are outside scope.

Each stored case preserves the originating module inputs and factored results. Envelope utilizations identify the governing case for each check without re-solving the underlying structural model.

Load factors follow design-code presets (Indicative, US, EU, ISO); users must confirm factor sets match the project load combination requirements.

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
