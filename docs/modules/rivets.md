### Rivet Analysis (`rivets`)

**Purpose**

Evaluate riveted joints for shear, bearing, and tear-out capacity with safety factors per classical joint design methods. Supports single-shear and double-shear lap and butt configurations.

**Physics & theory**

Rivets clamp plates by forming a head on installation, carrying load primarily in shear across the shank. Shear capacity is \( F_{\mathrm{shear}} = n \tau_{\mathrm{allow}} A_{\mathrm{rivet}} \) for \( n \) shear planes. Bearing on plate holes limits load: \( F_{\mathrm{bearing}} = n d t \sigma_{\mathrm{bearing}} \).

Tear-out removes material along plate edge: \( F_{\mathrm{tear}} = n (e - d/2) t \sigma_{\mathrm{tensile}} \) per rivet spacing \( e \). Governing capacity is minimum of shear, bearing, and tear-out modes divided by appropriate safety factor.

Connections transfer load through bearing, shear, tension, and friction paths depending on joint configuration. Preload in bolted joints reduces joint separation and can allow friction to carry shear; without adequate preload, bolts carry full shear in bearing against hole walls.

FEM-based bolt analysis resolves member and bolt stiffness for load sharing; VDI 2230 provides a systematic worksheet for high-fidelity preloaded joints including embedding loss and tightening scatter.

**Governing equations**

\[
F_{\mathrm{shear}} = n \frac{\pi d^2}{4} \tau_{\mathrm{allow}}
\]

\[
F_{\mathrm{bearing}} = n d t \sigma_{\mathrm{bearing,allow}}
\]

\[
F_{\mathrm{tear}} = n \left(e - \frac{d}{2}\right) t \sigma_{\mathrm{tensile}}
\]

**Numerical method**

Closed-form failure mode screening (`solver`). Each limit state computed independently; minimum capacity and governing mode reported with safety factors for applied load.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Rivet diameter \( d \), count | Geometry |
| Plate thickness \( t \), edge distance \( e \) | Layout |
| Shear planes \( n \) | Single or double shear |
| Material allowables | Rivet shear, plate bearing/tensile |
| Applied load | Joint service force |

**Outputs**

- Shear, bearing, tear-out capacities, governing mode, safety factors, recommended spacing check.

**Design codes & checks**

- **Indicative:** Shear and bearing safety factors
- **US:** AISC historical rivet specifications (reference)
- **EU:** EN 1993-1-8 riveted connections (reference)

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

- Static loading; fatigue of riveted joints not evaluated.
- Assumes filled holes and driven rivets at full shank contact.
- Corrosion and galvanic effects not included.
- Not for blind pop rivets in aerospace primary structure without additional factors.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. EN 1993-1-8:2005. *Design of joints — Riveted connections*.
3. AISC. *Steel Construction Manual*, rivet specifications (historical reference).
4. Kulak, G. L., et al. *Structural Joint Connections*. Prentice Hall.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
