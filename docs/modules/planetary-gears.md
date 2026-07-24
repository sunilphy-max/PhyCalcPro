---
seoTitle: "Planetary Gear Calculator – Epicyclic Tooth Count Search & Assembly Check"
seoDescription: "Size planetary gear trains: sun, planet, and ring tooth counts for target ratio with assembly validation, planet spacing, and approximate strength balance."
guideHeadline: "Engineering guide to planetary (epicyclic) gear train design"
keywords:
  - planetary gear calculator
  - epicyclic gear train
  - sun planet ring teeth
  - gear ratio search
  - assembly condition check
  - planet spacing
  - compact speed reducer
---

### Planetary Gear Set (`planetary-gears`)

## How engineers design planetary gear trains

Planetary (epicyclic) gear sets pack high ratios into small envelopes by sharing load across multiple planet gears. They appear in automatic transmissions, wind turbine gearboxes, and robot joints. The design challenge is finding integer tooth counts that hit a target ratio while satisfying the assembly condition, avoiding planet-to-planet interference, and maintaining balanced load sharing.

## Configurations and modes

| Fixed element | Input | Output | Ratio formula |
|--------------|-------|--------|---------------|
| Ring | Sun | Carrier | \( 1 + N_R/N_S \) |
| Carrier | Sun | Ring | \( -N_R/N_S \) |
| Sun | Carrier | Ring | \( N_R/(N_R + N_S) \) |

The most common arrangement fixes the ring and drives the sun, with the carrier as output.

## Engineering workflow

1. Define target ratio and allowable ratio error.
2. Set minimum/maximum tooth counts and number of planets.
3. Run integer search for tooth combinations satisfying \( N_R = N_S + 2N_P \).
4. Filter by assembly condition: \( (N_S + N_R)/n_P \) must be integer.
5. Check planet-to-planet clearance — planet tip circles must not overlap.
6. Screen per-planet tooth load against module and face width limits.
7. Select the combination with minimum total teeth or best ratio accuracy.

## Key quantities and formulas

Gear ratio (ring fixed, sun input, carrier output):

\[
i = \frac{N_R}{N_S} + 1
\]

Tooth count constraint:

\[
N_R = N_S + 2\,N_P
\]

Assembly condition for equally spaced planets:

\[
\frac{N_S + N_R}{n_P} \in \mathbb{Z}
\]

## Worked example

Target ratio 5:1, 3 planets, module 2 mm, face width 20 mm.

- From \( i = 1 + N_R/N_S = 5 \), so \( N_R = 4 N_S \).
- Try \( N_S = 18 \): \( N_R = 72 \), \( N_P = (72 - 18)/2 = 27 \).
- Assembly check: \( (18 + 72)/3 = 30 \) — integer, valid.
- Actual ratio: exactly 5.0. Planet spacing is adequate for module 2 with 27-tooth planets.

## Common mistakes and checks

- **Ignoring the assembly condition:** tooth counts that satisfy the geometry but fail the spacing constraint cannot be assembled.
- **Too few planets:** fewer planets mean higher per-planet load; 3 planets is the practical minimum for balanced loading.
- **Neglecting carrier pin bearing loads:** each planet pin sees the full tangential load on that planet.
- **Assuming perfect load sharing:** manufacturing tolerances cause unequal planet loads — apply a load sharing factor (1.1–1.3).

## FAQ

### What ratios can a single-stage planetary achieve?

Typically 3:1 to 12:1 with ring fixed. Compound planetary sets extend this range.

### Why are coprime sun and planet tooth counts preferred?

Coprime counts distribute wear evenly — every sun tooth eventually contacts every planet tooth, preventing localized pitting.

### Can I use helical planets?

Yes, but helical planets generate axial thrust loads that must be absorbed by thrust bearings or balanced by herringbone teeth.

### How does adding more planets increase torque capacity?

Each additional planet shares the tangential load. Going from 3 to 4 planets increases capacity by roughly 33%, though load-sharing penalties apply.

### What is a compound planetary?

A compound set uses two different planet gears on each pin, meshing with different sun/ring pairs to achieve ratios above 12:1 in a single stage.

## Use the PhyCalcPro calculator

Open the [Planetary Gears calculator](/products/machine/planetary-gears) to enter target ratio, planet count, tooth count bounds, module, and operating conditions. The tool returns valid tooth combinations, actual ratio, ratio error, assembly status, and approximate planet load.

---

**Purpose**

Size planetary (epicyclic) gear trains by selecting sun, planet, and ring tooth counts for a target ratio while checking assembly, planet spacing, and approximate strength balance.

**Physics & theory**

A basic planetary set has sun gear \( S \), planet gears \( P \), and ring gear \( R \) with carrier \( C \). Fundamental speed relation: \( \omega_R N_R + \omega_S N_S = \omega_C (N_S + N_R) \). Gear ratio depends on which element is held fixed. Tooth count constraint: \( N_R = N_S + 2 N_P \) for equally spaced planets. Planet-ring and planet-sun meshes share load; planet bearing load and equal spacing are design constraints.

**Governing equations**

\[
i = \frac{N_R}{N_S} + 1 \quad \text{(sun input, carrier output, ring fixed)}
\]

\[
N_R = N_S + 2\,N_P
\]

\[
\frac{N_S + N_R}{n_P} \in \mathbb{Z}
\]

**Numerical method**

Integer tooth search for target ratio within bounds. Validates assembly condition and planet spacing. Approximate torque sharing assigns equal planet load; strength screening uses per-planet tangential force vs allowable.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Target ratio | Desired speed reduction |
| `numPlanets` | Number of planet gears |
| Min/max tooth counts | Search bounds |
| `module`, `faceWidth` | Gear geometry |
| `power`, `speed` | Operating conditions |

**Outputs**

- Sun, planet, ring tooth counts, actual ratio, ratio error, assembly validity, approximate planet load.

**Design codes & checks**

- **Indicative:** Actual ratio vs target, assembly constraint check

**Assumptions & limitations**

- Single-stage planetary; no compound or multi-stage trains.
- Full ISO 6336 planet load sharing factors not applied.
- Planet carrier stiffness and pin bearing loads simplified.
- Helical planets require additional axial load analysis.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
2. Mueller, H. W. *Epicyclic Drive Trains*. Wayne State University Press.
3. ISO 6336 series (planet gear load sharing context).
4. AGMA 6123-B06. *Design Manual for Enclosed Epicyclic Gear Drives*.
