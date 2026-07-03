### Section Properties (`sections`)

**Purpose**

Calculate geometric section properties — area, centroid, second moments of area, section moduli, and radii of gyration — for standard and parametric cross-section shapes used in structural and machine design.

**Physics & theory**

Cross-section geometry determines resistance to axial load (\( A \)), bending (\( I \)), and torsion (\( J \)). Centroid location defines neutral axis for bending. Parallel-axis theorem transfers inertia: \( I = I_c + Ad^2 \). Section modulus \( S = I/c \) links bending moment to extreme fiber stress \( \sigma = M/S \).

Standard shapes (rectangle, circle, tube, I-beam built from rectangles) use closed-form formulas. Radii of gyration \( r = \sqrt{I/A} \) enter column buckling slenderness calculations.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
A = \int dA, \quad I_x = \int y^2 dA, \quad S_x = \frac{I_x}{c_x}
\]

\[
I = I_c + A d^2 \quad \text{(parallel-axis theorem)}
\]

\[
r_x = \sqrt{I_x / A}
\]

**Numerical method**

Closed-form formulas for catalog shapes (`engine`). Composite sections built by summation with signed areas for voids. Outputs principal axes when asymmetric sections supported.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Shape type | Rectangle, circle, tube, I, T, etc. |
| Dimensions | Height, width, wall thickness, etc. |
| Orientation | Strong/weak axis selection |

**Outputs**

- Area, centroid coordinates, \( I_x
- I_y
- J \), section moduli, radii of gyration.

**Design codes & checks**

- **Indicative:** Area and inertia calculations


**Assumptions & limitations**

- Homogeneous solid sections; composite materials use Effective Width in Composites module.
- Thin-walled open sections use approximate torsion constant.
- No elastic-plastic section modulus ( \( Z \) ) for compact I-shapes per code — geometric \( S \) only unless extended.

**References**

1. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed., Ch. 6.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*.
3. AISC. *Steel Construction Manual*, property tables.
4. EN 10279:2007. *Hot rolled steel channels* (shape definitions).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
