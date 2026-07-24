---
seoTitle: "Key & Spline Calculator – Torque Capacity, Shear & Bearing Stress"
seoDescription: "Calculate torque capacity of parallel keys and splines from shear and bearing stress limits on key, shaft, and hub per ISO 3912 screening methods."
guideHeadline: "Engineering guide to key and spline design for shaft-hub connections"
keywords:
  - key calculator
  - spline torque capacity
  - keyway stress analysis
  - parallel key design
  - ISO 3912 key sizing
  - shaft key shear
  - spline bearing stress
---

### Keys & Splines (`keys-splines`)

## How engineers design keyed and splined connections

Keys and splines transmit torque between a shaft and a hub (gear, pulley, coupling). A key is a small bar fitted into matching slots (keyways) in both shaft and hub; splines are integral teeth machined into the shaft. The key or spline must resist shear across its width and bearing stress on the keyway flanks. The design process selects a standard key size for the shaft diameter, then checks that the key length provides adequate shear and bearing capacity.

## Types and configurations

| Type | Fit | Application |
|------|-----|-------------|
| Parallel key (square/rect) | Sliding or tight | General-purpose drives |
| Woodruff key | Semi-circular, self-aligning | Light-duty, tapered shafts |
| Gib-head key | Taper with head for extraction | Heavy press fits |
| Straight-sided spline | Multiple teeth | Automotive, gearboxes |
| Involute spline | Involute profile | Aerospace, high-torque |

## Engineering workflow

1. Look up standard key cross-section \( b \times h \) for the shaft diameter (ISO 3912 / DIN 6885).
2. Calculate the tangential force from torque and shaft radius.
3. Determine required key length from shear stress limit.
4. Check bearing stress on the shallower keyway side (shaft or hub).
5. For splines, multiply effective bearing area by tooth count and load-sharing factor.
6. Verify keyway stress concentration does not compromise shaft fatigue life.

## Key quantities and formulas

Tangential force on key:

\[
F_t = \frac{2T}{d}
\]

Key shear stress:

\[
\tau = \frac{F_t}{b \, L} \leq \tau_{\text{allow}}
\]

Bearing stress on keyway:

\[
\sigma_b = \frac{F_t}{(h/2) \, L} \leq \sigma_{\text{b,allow}}
\]

Spline bearing with load sharing:

\[
\sigma_b = \frac{F_t}{n_t \, K_s \, (h/2) \, L}
\]

## Worked example

A 50 mm shaft transmits 200 N-m through a standard 14 x 9 mm parallel key, 40 mm long. Key material: steel with \( \tau_{\text{allow}} = 60 \) MPa, \( \sigma_{\text{b,allow}} = 120 \) MPa.

- Tangential force: \( F_t = 2 \times 200 / 0.050 = 8000 \) N.
- Shear stress: \( \tau = 8000 / (14 \times 40) = 14.3 \) MPa — well within 60 MPa.
- Bearing stress: \( \sigma_b = 8000 / (4.5 \times 40) = 44.4 \) MPa — within 120 MPa.
- Both checks pass with safety factors of 4.2 (shear) and 2.7 (bearing).

## Common mistakes and checks

- **Using key height instead of half-height for bearing:** the bearing surface is only the portion of the key embedded in the shaft or hub.
- **Ignoring keyway stress concentration:** a keyway reduces the shaft's fatigue strength by a factor of 1.5–3.0 depending on fillet radius.
- **Single key for reversing torque:** reversing loads hammer the key in the keyway — consider two keys at 90 deg or 120 deg.
- **Assuming all spline teeth share load equally:** manufacturing tolerances mean only 50–75% of teeth carry load — apply a sharing factor.

## FAQ

### How do I select the right key size?

ISO 3912 and DIN 6885 provide standard key cross-sections for each shaft diameter range. For a 50 mm shaft, the standard key is 14 x 9 mm.

### When should I use splines instead of keys?

When torque is high relative to shaft diameter, when alignment must be precise, or when the connection must slide axially under load (sliding splines in gearboxes).

### Do keyways weaken the shaft?

Yes — the stress concentration at keyway corners can reduce fatigue strength by 30–60%. Use generous fillet radii and consider fatigue analysis with the Shafts module.

### Can I use two keys on one shaft?

Yes — two keys at 90 deg or 120 deg spacing share load and are used when a single key is too long or for reversing torque applications.

### What is the difference between a sliding fit and a tight fit key?

A sliding fit key allows axial movement of the hub along the shaft; a tight fit key is pressed in and prevents axial motion.

## Use the PhyCalcPro calculator

Open the [Keys & Splines calculator](/products/fasteners/keys-splines) to enter torque, shaft diameter, key type and dimensions, and material allowables. The tool returns tangential force, shear stress, bearing stress, utilizations, and the governing failure mode.

---

**Purpose**

Calculate torque capacity of parallel keys and splines from shear and bearing stress limits on key, shaft, and hub.

**Physics & theory**

Keys transmit torque \( T \) between shaft and hub through shear in the key and bearing on keyway flanks. Tangential force \( F_t = 2T/d \). Key shear stress \( \tau = F_t/(bL) \). Bearing stress on shaft or hub side is \( \sigma_b = F_t/((h/2)L) \). Splines multiply effective bearing area by tooth count with a load sharing factor. Stress concentration at keyway corners reduces fatigue strength.

**Governing equations**

\[
F_t = \frac{2T}{d}
\]

\[
\tau = \frac{F_t}{b \, L} \leq \tau_{\text{allow}}
\]

\[
\sigma_b = \frac{F_t}{(h/2) \, L} \leq \sigma_{\text{b,allow}}
\]

**Numerical method**

Closed-form shear and bearing checks for selected key size or custom dimensions. Spline mode applies tooth count and load-sharing factor per ISO 3912 simplified method.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `torque`, shaft diameter | Operating load |
| Key type/size | Standard or custom \( b \times h \times L \) |
| Material allowables | Key and hub shear/bearing |
| Spline teeth (optional) | For spline analysis |

**Outputs**

- Tangential force, key shear stress, bearing stress, utilizations, governing failure mode.

**Design codes & checks**

- **Indicative:** Key shear and bearing capacity
- **ISO:** ISO 3912 parallel keys and keyways

**Assumptions & limitations**

- Uniform load along key length; no torsion along key overhang.
- Static or slowly varying torque; no fatigue per DIN 6892 full method.
- Set-screws and taper keys use different models.
- Hub wall thickness must support bearing — not checked here.

**Verification**

- CI: `keys-splines-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ISO 3912:2019. *Parallel keys and keyways*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
3. DIN 6892:2012. *Drive type connections — Keys*.
4. Peterson, R. E. *Stress Concentration Factors* (keyway Kt).
