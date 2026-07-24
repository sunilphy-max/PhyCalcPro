---
seoTitle: "Composite Laminate Analysis: CLT Stiffness, Ply Stress & Failure"
seoDescription: "How engineers analyse laminated composites using classical lamination theory — ABD stiffness matrices, ply-by-ply stress, Tsai-Hill and Tsai-Wu failure criteria."
guideHeadline: "How Engineers Analyse Composite Laminates"
keywords: ["composite laminate", "classical lamination theory", "ABD matrix", "Tsai-Hill", "ply stress", "layup sequence"]
---

### Composite Materials (`composites`)

## How engineers analyse composite laminates

Fibre-reinforced laminates — carbon/epoxy, glass/epoxy, aramid — are engineered ply by ply. Each ply has directional stiffness that depends on fibre orientation. Classical lamination theory (CLT) assembles ply contributions into plate stiffness matrices, recovers stresses in every layer, and screens them against failure criteria. This lets engineers optimise layup angles and thicknesses before committing to tooling.

This guide walks through layup definition, ABD matrix assembly, ply-stress recovery, and failure screening with Tsai-Hill, Tsai-Wu, and maximum-stress criteria.

## Layup types and when to use them

| Layup | Character | Typical use |
|-------|-----------|-------------|
| Symmetric balanced \([0/\pm45/90]_s\) | No coupling (\(\mathbf{B}=0\)), quasi-isotropic in-plane | General structural panels |
| Unidirectional \([0_n]\) | Maximum stiffness/strength in one direction | Spars, tension straps |
| Angle-ply \([\pm\theta]_s\) | High shear stiffness | Torque tubes, drive shafts |
| Asymmetric | Non-zero \(\mathbf{B}\); warps under temperature | Avoid unless curvature is designed |
| Hybrid (mixed fibres) | Combine stiffness and impact tolerance | Armour, sporting goods |

## Engineering workflow

1. **Define ply materials** — \(E_1\), \(E_2\), \(G_{12}\), \(\nu_{12}\), ply thickness, and ply strengths (\(X_t, X_c, Y_t, Y_c, S\)).
2. **Specify layup sequence** — fibre angles and stacking order; aim for symmetric balanced unless coupling is intentional.
3. **Apply loads** — in-plane forces \(N_x, N_y, N_{xy}\) and/or moments \(M_x, M_y, M_{xy}\) per unit width.
4. **Build ABD matrix** — assemble extensional \(\mathbf{A}\), coupling \(\mathbf{B}\), and bending \(\mathbf{D}\) stiffness.
5. **Solve for response** — midplane strains \(\boldsymbol{\varepsilon}^0\) and curvatures \(\boldsymbol{\kappa}\).
6. **Recover ply stresses** — transform to ply coordinates and evaluate failure index in each layer.
7. **Iterate** — adjust angles, thicknesses, or materials to satisfy failure criteria with margin.

## Key quantities and formulas

Laminate constitutive relation:

\[
\begin{Bmatrix} \mathbf{N} \\ \mathbf{M} \end{Bmatrix} = \begin{bmatrix} \mathbf{A} & \mathbf{B} \\ \mathbf{B} & \mathbf{D} \end{bmatrix} \begin{Bmatrix} \boldsymbol{\varepsilon}^0 \\ \boldsymbol{\kappa} \end{Bmatrix}
\]

Extensional stiffness:

\[
\mathbf{A} = \sum_k \bar{\mathbf{Q}}_k\,(z_{k+1} - z_k)
\]

Tsai-Hill failure criterion:

\[
\frac{\sigma_1^2}{X^2} - \frac{\sigma_1\,\sigma_2}{X^2} + \frac{\sigma_2^2}{Y^2} + \frac{\tau_{12}^2}{S^2} \leq 1
\]

First-ply failure load factor: the scalar multiplier on applied load at which any ply first reaches failure index = 1.

## Worked example

**Given:** \([0/90]_s\) carbon/epoxy laminate, ply thickness 0.125 mm, \(E_1 = 140\) GPa, \(E_2 = 10\) GPa, \(G_{12} = 5\) GPa, \(\nu_{12} = 0.3\). Applied \(N_x = 500\) N/mm.

1. Total thickness = 4 × 0.125 = 0.5 mm.
2. Assemble \(\mathbf{A}\) matrix — symmetric balanced, so \(\mathbf{B} = 0\).
3. Solve \(\boldsymbol{\varepsilon}^0 = \mathbf{A}^{-1}\mathbf{N}\). Midplane strain \(\varepsilon_x^0 \approx 0.0048\).
4. Ply stresses: 0° ply sees \(\sigma_1 = E_1 \varepsilon_x \approx 672\) MPa (tension along fibre); 90° ply sees \(\sigma_2 = E_2 \varepsilon_x \approx 48\) MPa (transverse).
5. Check Tsai-Hill in the 90° ply: if \(Y_t = 50\) MPa, the transverse stress is near the limit — increase 0° ply count or add \(\pm45°\) plies.

## Common mistakes and checks

- Building an **asymmetric layup** unintentionally — causes warping after cure.
- Using **tensile strengths** for compressive ply checks (compression values are often lower).
- Ignoring **interlaminar shear** — CLT assumes plane stress; thick laminates need FSDT checks.
- Forgetting **thermal residual stresses** from cure — especially in dissimilar fibre hybrids.
- Reporting **laminate strength** when only **first-ply failure** is evaluated — progressive damage is different.

## FAQ

### What is the ABD matrix?

The ABD matrix relates in-plane forces and bending moments to midplane strains and curvatures. \(\mathbf{A}\) governs extension, \(\mathbf{D}\) governs bending, and \(\mathbf{B}\) couples them. A symmetric layup zeroes out \(\mathbf{B}\).

### How is Tsai-Hill different from Tsai-Wu?

Tsai-Hill is a quadratic interaction criterion that does not distinguish tension from compression. Tsai-Wu adds linear terms, providing different failure surfaces in tension and compression. Tsai-Wu is generally preferred for design screening.

### What is first-ply failure?

The load level at which the first ply in the stack reaches its failure index of 1. Beyond this point, progressive damage (matrix cracking, delamination) begins — CLT does not model post-first-ply behaviour.

### Can I model sandwich panels?

Enter core material as a thick, low-stiffness ply between face-sheet layups. CLT handles the stiffness contribution; core shear failure must be checked separately.

## Use the PhyCalcPro calculator

Open the [Composites calculator](/products/materials/composites). Define ply materials and layup sequence, apply loads, and review ABD matrices, midplane response, ply-by-ply stresses, and failure indices. Iterate layup until all plies pass the selected failure criterion with adequate margin.

**Purpose**

Analyse laminated composite layups using classical lamination theory (CLT) for effective stiffness, ply stresses, and failure screening with common failure criteria. Supports symmetric and general stacking sequences.

**Physics & theory**

Each ply has orthotropic properties referenced to fibre direction: \(E_1, E_2, G_{12}, \nu_{12}\). Under plane stress, reduced stiffness \(\mathbf{Q}\) relates stress to strain in ply coordinates. Rotated plies transform \(\mathbf{Q}\) to global coordinates via angle \(\theta\). Lamination theory sums ply contributions through thickness. Symmetric layups eliminate extension-bending coupling (\(\mathbf{B}=\mathbf{0}\)); asymmetric stacks require full ABD inversion.

**Governing equations**

\[
\begin{Bmatrix} \mathbf{N} \\ \mathbf{M} \end{Bmatrix} = \begin{bmatrix} \mathbf{A} & \mathbf{B} \\ \mathbf{B} & \mathbf{D} \end{bmatrix} \begin{Bmatrix} \boldsymbol{\varepsilon}^0 \\ \boldsymbol{\kappa} \end{Bmatrix}
\]

\[
\mathbf{A} = \sum_k \bar{\mathbf{Q}}_k\,(z_{k+1} - z_k)
\]

\[
F_{\mathrm{Tsai\text{-}Hill}} = \frac{\sigma_1^2}{X^2} - \frac{\sigma_1\,\sigma_2}{X^2} + \frac{\sigma_2^2}{Y^2} + \frac{\tau_{12}^2}{S^2} \leq 1
\]

**Numerical method**

CLT matrix assembly: ply stack input builds \(\mathbf{ABD}\) matrices; load vector solved for midplane response; ply stresses and failure indices computed layer by layer.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Ply materials | \(E_1, E_2, G_{12}, \nu_{12}\), strengths |
| Layup sequence | Angles and thicknesses |
| Applied loads | \(N_x, N_y, N_{xy}, M_x, M_y, M_{xy}\) per unit width |
| Failure criterion | Max stress, Tsai-Hill, Tsai-Wu |

**Outputs**

- Effective moduli, midplane strains/curvatures, ply stresses per layer, failure index, first-ply failure load factor.

**Design codes & checks**

- **Indicative:** Effective modulus and strength utilisation
- **US:** MIL-HDBK-17-3F composite guidance (reference)
- **EU:** EN 1999-1-3 aluminium structures with bonded panels (context)

**Assumptions & limitations**

- Linear elastic CLT; no progressive damage or delamination propagation.
- Plane stress, thin laminate; no transverse shear (no FSDT unless extended).
- No moisture/temperature residual strains unless user offsets added.
- Manufacturing defects and open-hole effects not included.

**References**

1. Jones, R. M. *Mechanics of Composite Materials*, 2nd ed. Taylor & Francis.
2. MIL-HDBK-17-3F. *Composite Materials Handbook, Volume 3*.
3. Herakovich, C. T. *Mechanics of Fibrous Composites*. Wiley.
4. ASTM D3039/D3039M. *Tensile Properties of Polymer Matrix Composites*.
