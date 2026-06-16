### Area Properties (`profiles`)

**Purpose**

Compute cross-sectional area properties for arbitrary 2D profiles defined by SVG outlines or parametric shapes using finite-element mesh integration. Supports custom extrusions and imported geometry with visual preview.

**Physics & theory**

For arbitrary simply-connected regions, area \( A = \oint x\, dy \), centroid coordinates \( \bar{x} = \frac{1}{A}\int x\, dA \), and second moments \( I_x = \int y^2 dA \) are evaluated numerically over a triangular mesh of the outline. Green's theorem converts boundary integrals to mesh summation.

Principal axes and angles derive from the inertia tensor. Minimum wall thickness and bounding box support manufacturing and buckling screens. Mesh quality affects accuracy — finer meshes reduce discretization error on curved boundaries.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
A = \int dA, \quad I_x = \int y^2 dA, \quad I_{xy} = \int xy\, dA
\]

\[
I_{1,2} = \frac{I_x + I_y}{2} \pm \sqrt{\left(\frac{I_x - I_y}{2}\right)^2 + I_{xy}^2}
\]

**Numerical method**

2D FEM mesh integration (`femSolver`, `femPost`): SVG path or polygon tessellated into triangles. Properties integrated per element; results compared to analytical benchmarks for standard shapes. SVG outline preview in results picker.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Profile outline | SVG path or parametric shape |
| Mesh density | Tessellation fineness |
| Hole cutouts (optional) | Subtracted regions |

**Outputs**

- Area, centroid, \( I_x
- I_y
- I_{xy} \), principal inertias and angle, section moduli, bounding box, mesh preview.

**Design codes & checks**

- **Indicative:** Section area and principal inertia

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

- Single material homogeneous section; no composite layup.
- 2D plane section only; no thin-walled shear center for open profiles unless extended.
- Mesh-dependent accuracy on sharp corners.
- SVG import requires closed, non-self-intersecting paths.

**References**

1. Cook, R. D., et al. *Concepts and Applications of FEA*, 4th ed.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*.
3. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed.
4. ISO 10303 (STEP) — CAD exchange context for profile import.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
