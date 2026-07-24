---
seoTitle: "Internal Gear & Rack-and-Pinion Calculator – Bending & Contact Stress"
seoDescription: "Screen internal spur gear pairs and rack-and-pinion drives for Lewis bending stress and Hertzian contact stress with safety factors and pitch geometry."
guideHeadline: "Engineering guide to internal gear and rack-and-pinion design"
keywords:
  - internal gear calculator
  - rack and pinion design
  - Lewis bending stress
  - Hertzian contact stress
  - ring gear analysis
  - linear actuator gear
  - gear tooth strength
---

### Internal Gears & Rack (`internal-gears-rack`)

## How engineers design internal gears and rack drives

Internal gears and rack-and-pinion drives solve two distinct problems. An internal (ring) gear meshes a pinion inside the ring, producing compact co-axial reductions used in planetary sets, slewing rings, and enclosed speed reducers. A rack converts pinion rotation into linear translation for CNC tables, gate actuators, and steering systems. Both share involute tooth geometry but require separate form-factor treatment for bending stress.

## Types and configurations

| Type | Motion | Typical application |
|------|--------|---------------------|
| Internal spur pair | Rotary reduction | Planetary carriers, turntable drives |
| Rack and pinion | Rotary to linear | Machine tool axis, steering |
| Helical internal | Rotary, quieter | Automotive ring gears |

The module covers spur-tooth internal pairs and straight-tooth rack and pinion.

## Engineering workflow

1. Define power, speed, and required ratio (internal) or linear speed (rack).
2. Select module and face width from load and space constraints.
3. Choose tooth counts — pinion must have fewer teeth than ring for internal; rack tooth count is infinite.
4. Calculate tangential force at the pitch circle.
5. Evaluate Lewis bending stress with form factors specific to internal or rack geometry.
6. Evaluate Hertzian contact stress between mating pitch cylinders.
7. Compare stresses to material allowables with appropriate safety factors.

## Key quantities and formulas

Tangential force at pitch line:

\[
W_t = \frac{2T}{d}
\]

Lewis bending stress:

\[
\sigma_b = \frac{W_t}{b \, m \, Y}
\]

Hertzian contact stress:

\[
\sigma_c = \sqrt{\frac{W_t \, E^*}{\pi \, b}\left(\frac{1}{R_1} + \frac{1}{R_2}\right)}
\]

For a rack, \( R_2 \) is infinite, simplifying the contact term to \( 1/R_1 \).

## Worked example

A rack-and-pinion with module 3 mm, 20-tooth pinion, 25 mm face width transmits 1.5 kW at 300 rpm.

- Pitch diameter: \( d = 3 \times 20 = 60 \) mm.
- Tangential force: \( W_t = 2 \times (1500 \times 60) / (2\pi \times 300 \times 0.060) = 1591 \) N (from \( T = P/\omega \)).
- Bending stress: \( \sigma_b = 1591 / (25 \times 3 \times 0.32) = 66.3 \) MPa (Y = 0.32 for 20 teeth).
- Compare to steel allowable of 200 MPa: safety factor = 3.0 — adequate.

## Common mistakes and checks

- **Using external form factors for internal teeth:** internal gears have higher Y values — using external values is unconservative.
- **Ignoring tip interference in internal pairs:** if tooth count difference is too small (below about 10), tip interference prevents assembly.
- **Rack backlash:** linear systems are sensitive to backlash; specify anti-backlash spring pinions where precision matters.
- **Forgetting rack mounting rigidity:** a flexible rack deflects under tooth load, increasing dynamic factor.

## FAQ

### What minimum tooth-count difference is safe for internal gear pairs?

Typically the ring gear should have at least 10 more teeth than the pinion for standard profiles to avoid tip interference.

### Can this module handle helical internal gears?

The current screening uses spur-tooth form factors. For helical gears, apply overlap ratio corrections from the spur gear module.

### How does rack linear speed relate to pinion rpm?

Linear speed \( v = \pi d n / 60 \) where \( d \) is pinion pitch diameter and \( n \) is pinion rpm.

### Is the contact stress formula different for a rack?

Yes — since the rack has infinite radius, the curvature term reduces to \( 1/R_1 \) only, which lowers contact stress compared to an external pair of similar size.

## Use the PhyCalcPro calculator

Open the [Internal Gears & Rack calculator](/products/machine/internal-gears-rack) to select internal or rack mode, enter tooth counts, module, face width, power, and speed. The tool returns bending and contact safety factors, pitch diameters, and pitch-line velocity.

---

**Purpose**

Screen internal spur gear pairs and rack-and-pinion drives for Lewis bending and simplified Hertzian contact stress. Provides preliminary sizing before detailed ISO 6336 analysis.

**Physics & theory**

Internal gearing uses a pinion meshing inside a ring gear; rack drives convert rotation to linear motion. Tangential force at the pitch line is \( W_t = 2T/d \). Lewis bending uses a higher form factor for internal pinions than external gears. Contact stress uses Hertzian line-contact screening between pitch cylinders. For racks, the mating radius is infinite, simplifying the contact calculation.

**Governing equations**

\[
W_t = \frac{2T}{d}, \quad \sigma_b = \frac{W_t}{b \, m \, Y}
\]

\[
\sigma_c = \sqrt{\frac{W_t \, E^*}{\pi \, b}\left(\frac{1}{R_1} + \frac{1}{R_2}\right)}
\]

**Numerical method**

Closed-form Lewis and Hertz screening via `solveInternalGearsRackEngine` with type-specific form factors.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `gearType` | `internal` or `rack` |
| `power`, `speed` | Transmitted power and pinion rpm |
| `module`, `faceWidth`, tooth counts | Geometry |
| `material` | Yield and elastic properties |

**Outputs**

- Bending and contact safety factors, pitch diameters, pitch-line velocity.

**Design codes & checks**

- **Indicative:** Lewis + Hertz screening
- **ISO:** ISO 6336 reference context (screening)

**Assumptions & limitations**

- No microgeometry, scuffing, or planetary kinematics.
- Rack uses representative mating radius for contact only.
- Spur-tooth form factors; helical overlap not included.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13–14.
2. ISO 6336-1:2019. *Calculation of load capacity of spur and helical gears*.
3. AGMA 917-B97. *Design Manual for Parallel Shaft Fine-Pitch Gearing*.
