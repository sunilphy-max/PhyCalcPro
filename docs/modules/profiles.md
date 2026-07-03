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
