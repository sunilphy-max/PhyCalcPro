### Cost Estimation (`cost-estimator`) — **draft**

**Purpose**

Provide heuristic manufacturing cost estimates from material volume, process time, and overhead factors. Supports early design trade studies comparing material, machining, labor, and finishing costs.

**Physics & theory**

Part cost aggregates material, processing, and overhead. Material mass \( m = \rho V \) times cost per kg gives raw material cost; scrap fraction increases effective material usage. Machining cost scales with machine time and hourly rate; labor adds assembly or secondary operations. Finish and overhead apply as percentages on subtotals.

This is a parametric cost model, not activity-based costing or quoting from CAM toolpaths. Relative cost index supports comparing design alternatives rather than contractual pricing.

Manufacturing modules support design-for-manufacture decisions early in product development. Tolerance analysis should identify critical dimensions in the stack — tightening non-critical tolerances increases cost without improving function.

Fit selection balances assembly ease, alignment precision, and load transmission. Interference fits provide torque capacity without keys but require controlled press force and material compatibility.

**Governing equations**

\[
m = \rho V, \quad C_{\mathrm{material}} = m \cdot c_{\mathrm{kg}}
\]

\[
C_{\mathrm{process}} = t_{\mathrm{mach}} r_{\mathrm{mach}} + t_{\mathrm{labor}} r_{\mathrm{labor}}
\]

\[
C_{\mathrm{total}} = C_{\mathrm{material}} + C_{\mathrm{process}} + C_{\mathrm{finish}} + C_{\mathrm{overhead}}
\]

**Numerical method**

Closed-form cost rollup (`costEstimator/engine`). Scrap capped at 90%; finish and overhead as configurable percentages of subtotals. Outputs cost per volume and cost per mass for normalization.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `materialVolume`, `materialDensity` | Part material |
| `materialCostPerKg` | Raw material price |
| `scrapPercent` | Waste fraction |
| `machiningTime`, `machineRate` | CNC/machining |
| `laborTime`, `laborRate` | Assembly/labor |
| `finishPercent`, `overheadPercent` | Multipliers |

**Outputs**

- Material mass, scrap mass, cost breakdown, total cost, cost per volume/mass, effective material cost.

**Design codes & checks**

- **Indicative:** Relative cost index (draft module)

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

- **Draft status:** heuristic model for screening only.
- No regional pricing, tooling amortization, or batch quantity discounts.
- Machining time user-supplied — not linked to CAM Toolpaths automatically.
- Excludes quality inspection, packaging, and logistics.

**References**

1. Ostwald, P. F., & McLaren, T. S. *Cost Analysis and Estimating for Engineering and Management*. Pearson.
2. ASM. *Materials and Processing Costs in Design*.
3. Boothroyd, G., et al. *Product Design for Manufacture and Assembly*, 3rd ed.
4. DIN 8580. *Manufacturing processes classification* (process selection context).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
