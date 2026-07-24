---
seoTitle: "Multi-Pulley Belt Layout Calculator – Wrap Angles & Belt Length"
seoDescription: "Compute total belt or chain length and per-pulley wrap angles for three or more pulleys in a single plane layout. Verify minimum wrap before power rating."
guideHeadline: "Engineering guide to multi-pulley belt and chain drive layout"
keywords:
  - multi-pulley calculator
  - belt length calculation
  - wrap angle analysis
  - serpentine belt layout
  - multi-sheave drive
  - chain drive geometry
  - pulley layout design
---

### Multi-Pulley Layout (`multi-pulley`)

## How engineers lay out multi-pulley drives

Any belt or chain drive with three or more pulleys must be geometrically validated before power rating. Adding idlers for tensioning, routing around obstacles, or driving multiple shafts from one belt all change total belt length and individual wrap angles. Insufficient wrap on a friction belt means insufficient grip; insufficient engagement on a timed belt means skipped teeth. The multi-pulley layout module solves these geometry questions.

## Drive configurations

| Configuration | Typical use |
|--------------|-------------|
| Three-pulley with idler | V-belt tension take-up |
| Serpentine accessory drive | Automotive alternator, compressor, pump |
| Multi-shaft timing | Packaging machine, printing press |
| Chain with tensioner | Industrial chain conveyor |

All share the same geometric problem: compute tangent lengths and wrap arcs for an ordered sequence of circular pulleys in a plane.

## Engineering workflow

1. Sketch pulley centers and diameters in a 2D plane.
2. Define the routing order (the sequence the belt follows).
3. Run the geometry solver to obtain total belt length and wrap per pulley.
4. Check minimum wrap angle against drive requirements (120 deg typical for V-belts, 60 deg for timing).
5. If any wrap is too low, move pulley centers or add an idler.
6. Use the total length to select a standard belt from catalogues.
7. Feed wrap angles into the V-Belt, Timing Belt, or Chain power module.

## Key quantities and formulas

Total belt length as sum of straight segments and arcs:

\[
L = \sum_{i} \ell_{\text{straight},i} + \sum_{j} \frac{\theta_j D_j}{2}
\]

Wrap angle on pulley \( j \):

\[
\theta_j = \pi - (\alpha_{\text{in}} + \alpha_{\text{out}})_j
\]

Minimum wrap across all pulleys:

\[
\theta_{\min} = \min_j \theta_j
\]

## Worked example

A three-pulley V-belt drive has pulleys at (0, 0) with D = 200 mm, (400, 0) with D = 300 mm, and (200, 250) with D = 100 mm (idler). The routing order is 1-2-3.

The solver computes tangent lines between each pair, then arc lengths on each pulley from the incoming and outgoing tangent angles. If the minimum wrap on the 100 mm idler is 85 deg, friction capacity may be adequate since the idler only tensions the slack side.

## Common mistakes and checks

- **Wrong routing order:** reversing the sequence changes all wrap angles.
- **Ignoring back-side idlers:** a flat idler on the belt's back side creates two extra tangent points and reduces wrap on adjacent pulleys.
- **Assuming coplanar when shafts are offset:** even 1 deg skew introduces lateral belt tracking problems not captured in 2D analysis.
- **Forgetting belt stretch:** elasticity changes effective length under load — order belt lengths with tolerance.

## FAQ

### What is the minimum acceptable wrap angle for a V-belt?

Industry practice is 120 deg; below that, derate the power capacity using wrap correction factors from belt manufacturers.

### Can this module handle crossed-belt drives?

Yes — a crossed configuration reverses direction on one pulley, changing tangent geometry. Select "crossed" drive type.

### How many pulleys can I include?

The solver accepts any number of coplanar pulleys in the routing sequence.

### Does belt length need rounding to standard sizes?

For V-belts, yes — select the next standard length from ISO 4184 or manufacturer tables. For timing belts, round to whole tooth pitches.

### Why does an idler pulley improve a drive?

It increases wrap on the small pulley (boosting friction capacity) and provides a take-up point for tensioning without moving shaft centers.

## Use the PhyCalcPro calculator

Open the [Multi-Pulley Layout calculator](/products/power-transmission/multi-pulley) to enter pulley positions, diameters, and routing order. The tool returns total belt length, per-pulley wrap angles, tangent segment lengths, and minimum wrap screening.

---

**Purpose**

Compute total belt or chain length and wrap angles for drives with three or more pulleys in a single plane. Supports layout verification before detailed power rating in the V-Belt or Roller Chain modules.

**Physics & theory**

Multi-pulley drives route a single belt or chain around several shafts. Total length equals the sum of straight tangent segments between pulley pairs plus arc lengths on each pulley. Wrap angle on each pulley depends on incoming and outgoing tangent directions, which are determined by pulley centers and diameters in the layout plane. Minimum wrap angle governs friction capacity on friction belts.

**Governing equations**

\[
L = \sum_i \ell_{\text{straight},i} + \sum_j \frac{\theta_j D_j}{2}
\]

\[
\theta_j = \pi - (\alpha_{\text{in}} + \alpha_{\text{out}})_j
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
