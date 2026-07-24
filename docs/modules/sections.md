---
seoTitle: "Section Properties Calculator: Area, Inertia & Modulus for Standard Shapes"
seoDescription: "How engineers compute cross-section area, second moment of area, section modulus, and radius of gyration for standard structural and machine design shapes."
guideHeadline: "How Engineers Compute Section Properties"
keywords: ["section properties", "moment of inertia", "section modulus", "radius of gyration", "cross-section", "parallel axis theorem"]
---

### Section Properties (`sections`)

## How engineers compute section properties

Every beam, column, and shaft calculation depends on the geometry of the cross-section. Area \(A\) resists axial load, second moment of area \(I\) resists bending, torsion constant \(J\) resists twist, and section modulus \(S\) links bending moment to peak stress. Getting these numbers right — and in the correct axis orientation — is the foundation of structural and machine design.

This guide covers parametric shapes (rectangle, circle, tube, I, T, channel), the parallel-axis theorem for built-up sections, and how to push computed properties into beam, column, and shaft solvers.

## Shape types and when to use them

| Shape | Typical use | Key property advantage |
|-------|-------------|----------------------|
| Solid rectangle | Timber beams, flat bars | Simple, high \(I\) about strong axis |
| Solid circle | Shafts, pins | Symmetric \(I\) and \(J\) |
| Hollow circle (tube) | Shafts, columns, piping | High \(I/A\) ratio, torsion efficient |
| I / wide-flange | Steel beams, girders | Maximum \(I_x\) per unit weight |
| Channel (C) | Framing, light columns | One-axis bending, bolting flange |
| T-section | Composite tee beams | Asymmetric bending with slab |
| Angle (L) | Bracing, lintels | Compact, two-leg stability |

## Engineering workflow

1. **Identify load path** — determine which axis bending, axial, or torsion acts about.
2. **Select shape family** — match structural efficiency to load type and connection requirements.
3. **Enter dimensions** — height, width, wall thickness, fillet radius where applicable.
4. **Compute properties** — area, centroid, \(I_x\), \(I_y\), \(J\), section moduli, radii of gyration.
5. **Transfer to solver** — push \(A\), \(I\), \(S\) into beam deflection, column buckling, or shaft stress modules.

## Key quantities and formulas

Area and second moment of area:

\[
A = \int dA, \quad I_x = \int y^2 \, dA, \quad S_x = \frac{I_x}{c}
\]

Parallel-axis theorem for composite or offset shapes:

\[
I = I_c + A\,d^2
\]

Radius of gyration (enters column slenderness):

\[
r = \sqrt{\frac{I}{A}}
\]

Rectangular section closed-form:

\[
I_x = \frac{b\,h^3}{12}, \quad S_x = \frac{b\,h^2}{6}
\]

Circular section:

\[
I = \frac{\pi\,d^4}{64}, \quad J = \frac{\pi\,d^4}{32}
\]

## Worked example

**Given:** Built-up T-section — flange 200 mm wide × 15 mm thick on top of a web 300 mm deep × 10 mm thick. Find \(I_x\) about the centroidal axis.

1. Flange area \(A_f = 200 \times 15 = 3000\) mm². Web area \(A_w = 300 \times 10 = 3000\) mm². Total \(A = 6000\) mm².
2. Take datum at bottom of web. Flange centroid at \(y_f = 300 + 7.5 = 307.5\) mm; web centroid at \(y_w = 150\) mm.
3. Composite centroid \(\bar{y} = (3000 \times 307.5 + 3000 \times 150)/6000 = 228.75\) mm.
4. Flange: \(I_{c,f} = 200 \times 15^3/12 = 56{,}250\) mm\(^4\); transfer \(d_f = 307.5 - 228.75 = 78.75\) mm; \(I_f = 56{,}250 + 3000 \times 78.75^2 = 18.66 \times 10^6\) mm\(^4\).
5. Web: \(I_{c,w} = 10 \times 300^3/12 = 22.5 \times 10^6\) mm\(^4\); transfer \(d_w = 228.75 - 150 = 78.75\) mm; \(I_w = 22.5 \times 10^6 + 3000 \times 78.75^2 = 41.11 \times 10^6\) mm\(^4\).
6. Total \(I_x = 18.66 + 41.11 = 59.77 \times 10^6\) mm\(^4\).

## Common mistakes and checks

- Forgetting the **parallel-axis transfer** term \(A d^2\) when combining sub-shapes.
- Using the wrong **axis orientation** — \(I_x\) vs \(I_y\) swapped relative to bending plane.
- Confusing **elastic section modulus** \(S\) with **plastic section modulus** \(Z\).
- Neglecting **voids** — subtract hollow areas with signed contributions.
- Applying closed-form tube formulas to **thin-walled open** sections where torsion constant differs.

## FAQ

### What is the difference between I and S?

\(I\) (second moment of area) quantifies the distribution of area about an axis. \(S = I/c\) (section modulus) divides by the extreme-fiber distance, directly giving stress from moment: \(\sigma = M/S\).

### When do I need the parallel-axis theorem?

Whenever the centroid of a sub-shape does not coincide with the composite centroid — i.e., for any built-up, compound, or asymmetric section.

### How does radius of gyration relate to buckling?

Column slenderness \(\lambda = KL/r\). A smaller \(r\) means a higher slenderness ratio and lower buckling capacity. Design to maximise the minimum \(r\) when compression governs.

### Can this handle hollow or multi-cell sections?

Standard hollows (tubes, box) use signed-area subtraction. Multi-cell closed sections with shear flow require the Profiles module for numerical mesh integration.

## Use the PhyCalcPro calculator

Open the [Section properties calculator](/products/materials/sections). Select a standard shape, enter dimensions, and read off \(A\), centroid, \(I_x\), \(I_y\), \(J\), section moduli, and radii of gyration. Results feed directly into beam, column, and shaft modules.

**Purpose**

Calculate geometric section properties — area, centroid, second moments of area, section moduli, and radii of gyration — for standard and parametric cross-section shapes used in structural and machine design.

**Physics & theory**

Cross-section geometry determines resistance to axial load (\(A\)), bending (\(I\)), and torsion (\(J\)). Centroid location defines the neutral axis for bending. The parallel-axis theorem transfers inertia: \(I = I_c + Ad^2\). Section modulus \(S = I/c\) links bending moment to extreme-fibre stress \(\sigma = M/S\). Standard shapes use closed-form formulas. Radii of gyration \(r = \sqrt{I/A}\) enter column buckling slenderness calculations.

**Governing equations**

\[
A = \int dA, \quad I_x = \int y^2\,dA, \quad S_x = \frac{I_x}{c}
\]

\[
I = I_c + A\,d^2
\]

\[
r = \sqrt{I/A}
\]

**Numerical method**

Closed-form formulas for catalog shapes. Composite sections built by summation with signed areas for voids. Outputs principal axes when asymmetric sections are present.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Shape type | Rectangle, circle, tube, I, T, channel, angle |
| Dimensions | Height, width, wall thickness, fillet radius |
| Orientation | Strong / weak axis selection |

**Outputs**

- Area, centroid coordinates, \(I_x\), \(I_y\), \(J\), section moduli, radii of gyration.

**Design codes & checks**

- **Indicative:** Area and inertia calculations

**Assumptions & limitations**

- Homogeneous solid sections; composite materials use the Composites module.
- Thin-walled open sections use approximate torsion constant.
- No plastic section modulus \(Z\) for compact I-shapes unless extended.

**References**

1. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed., Ch. 6.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*.
3. AISC. *Steel Construction Manual*, property tables.
4. EN 10279:2007. *Hot rolled steel channels* (shape definitions).
