### Multi-Pulley Layout (`multi-pulley`)

**Purpose**

Compute total belt or chain length and wrap angles for drives with three or more pulleys in a single plane. Supports layout verification before detailed power rating in the V-Belt or Roller Chain modules.

**Physics & theory**

Multi-pulley drives route a single belt or chain around several shafts. Total length equals sum of straight tangent segments between pulley pairs plus arc lengths on each pulley. Wrap angle on each pulley depends on incoming and outgoing tangent directions, which are determined by pulley centers and diameters in the layout plane.

Minimum wrap angle governs friction capacity on friction belts — values below ~120° require idler pulleys or larger diameters. For timing belts and chains, wrap angle affects chordal action and engagement but not slip. The module treats pulleys as circles in 2D with user-specified center coordinates and diameters.

Power transmission elements operate under cyclic tension, bending, and contact stresses. Service factors account for driver type (motor vs engine), daily operating hours, and shock loading. Belt slip occurs when required friction capacity exceeds available wrap; chain drives depend on proper lubrication and sprocket tooth count for rated life.

Center distance adjustment affects belt length and wrap angle simultaneously — the solver uses the standard open-drive length formula assuming coplanar shafts and parallel pulley grooves.

**Governing equations**

\[
L = \sum_i \ell_{\mathrm{straight},i} + \sum_j \frac{\theta_j D_j}{2}
\]

\[
\theta_j = \pi - (\alpha_{\mathrm{in}} + \alpha_{\mathrm{out}})_j
\]

\[
\theta_{\min} = \min_j \theta_j
\]

**Numerical method**

Geometric layout solver: pulley centers and diameters define tangent lines between adjacent pulleys in the routing order. Arc lengths computed from wrap angles derived from vector geometry. Belt length summed; minimum wrap flagged if below threshold.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pulley list | Center coordinates \( (x, y) \), diameter |
| Routing order | Sequence around which belt wraps |
| Drive type | Open belt, crossed, or chain |

**Outputs**

- Total belt/chain length, per-pulley wrap angle (degrees), minimum wrap angle, tangent segment lengths.

**Design codes & checks**

- **Indicative:** Total belt length, minimum wrap angle screening


**Assumptions & limitations**

- Coplanar pulleys only; no 3D skew or quarter-turn twist.
- Circular pulleys; no crowned or flanged geometry effects.
- Does not compute power capacity — use with V-Belt or Chain modules.
- Routing order must be specified correctly by user.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 17.
2. Marks' Standard Handbook for Mechanical Engineers, 12th ed.
3. Gates Corporation. *Heavy-Duty V-Belt Drive Design Manual*.
4. ISO 4184:1992. *Classical V-belts and pulleys*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
