---
seoTitle: "Bevel Gear Calculator – Cone Geometry, Bending & Contact Stress Screening"
seoDescription: "Screen straight and spiral bevel gear sets for pitch cone geometry, bending stress, and contact strength using virtual spur gear methods per ISO 10300."
guideHeadline: "Engineering guide to bevel gear design and load capacity screening"
keywords:
  - bevel gear calculator
  - bevel gear design
  - pitch cone angle
  - bevel gear bending stress
  - ISO 10300 screening
  - AGMA bevel rating
  - spiral bevel gear
---

### Bevel Gear Screening (`bevel-gears`)

## How engineers design bevel gear drives

Bevel gears transmit power between intersecting shaft axes — most commonly at 90 deg. They appear in differential drives, angle gearboxes, and helicopter tail rotors. Designing a bevel gear set involves selecting tooth counts, module, and face width, then verifying that bending and contact stresses remain within material allowables. The virtual spur gear method transforms conical geometry into equivalent cylindrical parameters for strength screening.

## Types and configurations

| Type | Characteristics | Application |
|------|----------------|-------------|
| Straight bevel | Simple manufacturing, moderate load | Low-speed angle drives |
| Zerol bevel | Zero spiral angle, reduced axial thrust | General purpose |
| Spiral bevel | High load capacity, smooth mesh | Automotive differentials, aerospace |
| Hypoid | Offset axes, high ratio | Automotive rear axle |

The module screens straight and zerol bevel geometries; spiral bevel effects are simplified.

## Engineering workflow

1. Define shaft angle (typically 90 deg), power, speed, and ratio.
2. Select pinion and gear tooth counts for the desired ratio.
3. Choose mean module and face width within cone length limits.
4. Compute pitch cone angles from tooth counts and shaft angle.
5. Transform to virtual spur gear dimensions at the mean cone section.
6. Evaluate bending stress using ISO 6336-style factors on the virtual gear.
7. Evaluate contact stress at the mean pitch point.
8. Check face width does not exceed one-third of cone distance.
9. Verify mounting stiffness is adequate for proper contact patterns.

## Key quantities and formulas

Pitch cone angles:

\[
\delta_1 = \arctan\!\left(\frac{\sin\Sigma}{N_2/N_1 + \cos\Sigma}\right), \quad \delta_2 = \Sigma - \delta_1
\]

Mean pitch diameter and cone distance:

\[
d_{m1} = m_m \, N_1, \quad R_m = \frac{d_{m1}}{2\sin\delta_1}
\]

Bending and contact stress checks:

\[
\sigma_F = \frac{W_t \, K_A \, K_V}{b \, m_m \, Y} \leq \sigma_{FP}, \quad \sigma_H \leq \sigma_{HP}
\]

## Worked example

A 90 deg bevel set with 20-tooth pinion and 40-tooth gear, mean module 4 mm, face width 30 mm, transmitting 8 kW at 1200 rpm pinion speed.

- Pitch cone angles: \( \delta_1 = \arctan(1/(40/20)) = 26.57° \), \( \delta_2 = 63.43° \).
- Mean pitch diameter: \( d_{m1} = 4 \times 20 = 80 \) mm.
- Cone distance: \( R_m = 80/(2 \sin 26.57°) = 89.4 \) mm. Face width 30 mm is 33.6% of \( R_m \) — just at the one-third limit.
- Tangential force from torque and diameter leads to bending and contact checks against material limits.

## Common mistakes and checks

- **Face width exceeding \( R_m/3 \):** tooth load distribution degrades at the toe and heel.
- **Ignoring axial and radial thrust loads:** bevel gears produce significant bearing loads in all three directions.
- **Neglecting mounting deflection:** contact pattern shifts destroy bevel gear life faster than overload.
- **Applying spur gear form factors directly:** the virtual gear transformation adjusts for cone geometry.

## FAQ

### Why is the one-third face width rule important?

Beyond one-third of cone distance, the tooth profile changes significantly from toe to heel, causing uneven load distribution and premature pitting.

### How do spiral bevel gears differ from straight bevels in this module?

Spiral angle effects are simplified — the module uses straight-bevel form factors. For full spiral bevel rating, use ISO 10300 with spiral angle corrections.

### What shaft angles can this module handle?

Any shaft angle, though 90 deg is most common. The cone angle equations work for any \( \Sigma \).

### When should I use hypoid gears instead?

When shaft axes must be offset (non-intersecting). Hypoid gears sacrifice efficiency for packaging flexibility and higher load capacity.

### What mounting accuracy do bevel gears require?

Axial position of each cone apex must align within about 0.05 mm for proper contact patterns. Shim adjustment at assembly is standard practice.

## Use the PhyCalcPro calculator

Open the [Bevel Gears calculator](/products/machine/bevel-gears) to enter tooth counts, shaft angle, module, face width, and operating conditions. The tool returns pitch cone angles, mean diameters, cone distance, tangential force, and bending/contact utilization.

---

**Purpose**

Screen straight and spiral bevel gear sets for geometry, pitch cone dimensions, and bending/contact strength using adapted spur gear rating methods. Provides preliminary sizing before detailed Gleason/Klingelnberg analysis.

**Physics & theory**

Bevel gears transmit power between intersecting axes. Pitch cone geometry relates pinion and gear tooth counts through shaft angle \( \Sigma \). Mean cone distance \( R_m \) and mean module \( m_m \) define the virtual spur gear equivalent used for strength screening. Tangential force acts at the mean pitch circle on the pitch cone. Bending and contact stresses use ISO 6336-style factors applied to the virtual cylindrical gear dimensions.

**Governing equations**

\[
\delta_1 = \arctan\!\left(\frac{\sin\Sigma}{N_2/N_1 + \cos\Sigma}\right), \quad \delta_2 = \Sigma - \delta_1
\]

\[
d_{m1} = m_m \, N_1, \quad R_m = \frac{d_{m1}}{2\sin\delta_1}
\]

\[
\sigma_F = \frac{W_t K_A K_V}{b \, m_m \, Y} \leq \sigma_{FP}, \quad \sigma_H \leq \sigma_{HP}
\]

**Numerical method**

Virtual spur gear transformation followed by gear rating checks. Cone geometry computed from tooth counts and shaft angle; strength factors applied at mean section.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `pinionTeeth`, `gearTeeth` | Tooth counts |
| Shaft angle \( \Sigma \) | Usually 90 deg |
| `module`, `faceWidth` | Mean module and face width |
| `power`, `speed` | Operating conditions |
| Material allowables | Bending and contact limits |

**Outputs**

- Pitch cone angles, mean diameters, cone distance, tangential force, bending/contact utilization.

**Design codes & checks**

- **Indicative:** Lewis/ISO-style bending and contact screening
- **ISO:** ISO 10300 bevel gear load capacity (reference)
- **US:** AGMA 2003 bevel gear rating (reference)

**Assumptions & limitations**

- Straight or zerol bevel screening; spiral angle effects simplified.
- Virtual gear method — not full bevel-specific ISO 10300 factor set.
- Assumes proper mounting and lapping; no deflection under load.
- No scuffing or lapping contact pattern analysis.

**Verification**

- CI: `bevel-gears-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ISO 10300-1:2014. *Calculation of load capacity of bevel gears*.
2. AGMA 2003-D19. *Rating the Pitting Resistance and Bending Strength of Generated Straight Bevel, Zerol Bevel and Spiral Bevel Gear Teeth*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
4. Maitra, G. M. *Handbook of Gear Design*, 2nd ed. McGraw-Hill.
