---
seoTitle: "Gear Design Calculator – Lewis Bending & ISO 6336 Contact Stress Analysis"
seoDescription: "Design spur and helical gear pairs with Lewis bending, ISO 6336 contact and bending strength, dynamic load factors, and pitting resistance screening using PhyCalcPro."
guideHeadline: "Spur & Helical Gear Rating — Bending, Pitting & ISO 6336 Guide"
keywords: ["gear design", "Lewis bending", "ISO 6336", "contact stress", "gear calculator", "pitting resistance", "spur gear", "helical gear"]
---

### Gear Design Guide (`gears`)

## How engineers design gear pairs

Gears are the backbone of mechanical power transmission. Selecting a gear pair involves balancing transmitted torque, speed ratio, noise, efficiency, and service life against cost and space constraints. The two dominant failure modes are:

- **Tooth bending fatigue** — the tooth root acts as a short cantilever beam; cyclic loading from meshing causes fatigue cracks at the root fillet.
- **Contact (pitting) fatigue** — Hertzian contact stress at the pitch line causes subsurface fatigue cracks that spall the tooth flank.

A successful design must demonstrate acceptable safety factors against both modes simultaneously while satisfying geometric constraints (center distance, face width, module).

## Types and configurations

| Gear type | Tooth geometry | Typical application |
|---|---|---|
| Spur | Straight, parallel to axis | Low-speed industrial drives, gearboxes |
| Helical | Angled teeth, smooth engagement | High-speed reducers, automotive transmissions |
| Herringbone | Double helical, no thrust | Marine drives, heavy-duty mills |
| Internal | Teeth on inner surface | Planetary gear sets, compact drives |

This module covers external spur and helical pairs. Internal gears and planetary sets are handled by dedicated modules.

## Engineering workflow

1. **Define requirements** — Input power, speed, ratio, design life, and space envelope.
2. **Select module and tooth count** — Choose a standard module \( m \) (or diametral pitch) and tooth counts \( N_1, N_2 \) that achieve the required ratio.
3. **Compute geometry** — Pitch diameters \( d = mN \), center distance, addendum, dedendum, face width.
4. **Bending stress check** — Lewis equation or ISO 6336-3 with load distribution and dynamic factors.
5. **Contact stress check** — ISO 6336-2 Hertzian stress with zone, elasticity, and contact ratio factors.
6. **Iterate** — Adjust module, face width, material, or heat treatment until both bending and contact safety factors exceed the target (typically 1.2–1.5 for industrial drives).
7. **Verify ancillaries** — Check pitch-line velocity for lubrication adequacy, scuffing risk, and noise.

## Key quantities and formulas

**Tangential force and pitch-line velocity**

\[
W_t = \frac{2000\,P}{v}, \quad d = m N, \quad v = \frac{\pi\,d\,n}{60\,000}
\]

where \( P \) is power (kW), \( v \) is pitch-line velocity (m/s), and \( n \) is speed (rpm).

**ISO 6336-3 bending stress**

\[
\sigma_F = \frac{W_t\,K_A\,K_V\,K_{F\alpha}\,K_{F\beta}}{b\,m\,Y_F\,Y_S\,Y_\beta\,Y_B\,Y_{DT}} \leq \sigma_{FP}
\]

where \( Y_F \) is form factor, \( Y_S \) is stress correction factor, \( K_A \) is application factor, \( K_V \) is dynamic factor, and \( K_{F\beta} \) is face load distribution factor for bending.

**ISO 6336-2 contact stress**

\[
\sigma_H = Z_E\,Z_H\,Z_\varepsilon\,Z_\beta \sqrt{\frac{W_t}{b\,d_1}\,\frac{u+1}{u}\,K_A\,K_V\,K_{H\alpha}\,K_{H\beta}} \leq \sigma_{HP}
\]

where \( Z_E \) is the elasticity factor, \( Z_H \) is the zone factor, \( Z_\varepsilon \) is the contact ratio factor, and \( u = N_2/N_1 \) is the gear ratio.

**Lewis bending (simplified screening)**

\[
\sigma_{\mathrm{Lewis}} = \frac{W_t\,K_V}{b\,m\,Y_J}
\]

## Worked example

**Problem:** Design a spur gear pair to transmit 15 kW at 1450 rpm (pinion) with a ratio of 3:1. Material: case-hardened 20MnCr5, allowable bending stress 320 MPa, allowable contact stress 1200 MPa.

1. Choose module \( m = 3 \) mm, pinion teeth \( N_1 = 20 \), gear teeth \( N_2 = 60 \).
2. Pitch diameters: \( d_1 = 60 \) mm, \( d_2 = 180 \) mm; center distance 120 mm.
3. Pitch-line velocity: \( v = \pi \times 0.060 \times 1450 / 60 = 4.56 \) m/s.
4. Tangential force: \( W_t = 2000 \times 15 / 4.56 = 6579 \) N.
5. Face width: choose \( b = 30 \) mm (10 modules).
6. Bending stress (ISO 6336-3): \( \sigma_F = 6579 \times 1.25 \times 1.05 / (30 \times 3 \times 2.65 \times 1.0) = 36.2 \) MPa; bending utilization 11 % — safe.
7. Contact stress (ISO 6336-2): \( \sigma_H = 189.8 \times 2.49 \times 0.87 \times \sqrt{6579/(30 \times 60) \times 4/3 \times 1.31} = 782 \) MPa; contact utilization 65 % — safe.
8. Both checks pass with margin; face width could be reduced or a smaller module considered.

## Common mistakes and checks

- **Neglecting dynamic load factor \( K_V \)** — At high pitch-line velocities, meshing impacts can double the effective tooth load. Always compute \( K_V \) from ISO 6336-1 or AGMA tables.
- **Undersizing face width** — A face width less than about 6 modules tends to concentrate load at tooth edges, increasing \( K_{H\beta} \).
- **Ignoring contact stress** — Bending-only designs may pass root checks yet fail by pitting in under 10^7 cycles. Both checks are mandatory.
- **Wrong module direction** — Increasing module improves bending strength but worsens contact stress (larger teeth, fewer in mesh). Iterate both simultaneously.
- **Profile shift omission** — For low tooth counts (< 17), negative profile shift causes undercut. Apply correction factor \( x \) to avoid weakened tooth roots.

## FAQ

### What is the difference between module and diametral pitch?
Module \( m \) (mm) is the metric standard; diametral pitch \( P_d \) (teeth per inch) is the US/Imperial equivalent. They are reciprocal: \( m = 25.4/P_d \). PhyCalcPro uses module internally with unit conversion available.

### How do I choose between spur and helical gears?
Helical gears run quieter and share load across more teeth simultaneously (higher contact ratio). Use helical for pitch-line velocities above about 5 m/s or when noise is critical. Spur gears are cheaper to manufacture and generate no axial thrust.

### What safety factor is typical for industrial gears?
ISO 6336 recommends minimum safety factors of 1.0 for contact (\( S_H \)) and 1.3 for bending (\( S_F \)) in standard service. Industrial practice often targets 1.2–1.5 for contact and 1.5–2.0 for bending depending on consequence of failure.

### Does the calculator handle helical gear thrust loads?
Yes. For helical gears the axial (thrust) force \( F_a = W_t \tan\beta \) is computed and reported. Thrust bearings must be sized accordingly.

### How is scuffing addressed?
Indicative mode provides a screening flag based on pitch-line velocity and specific sliding. Full scuffing analysis (flash temperature per ISO/TR 13989) is not included — consult a gear specialist for high-speed or heavily loaded drives.

## Use the PhyCalcPro calculator

Rate spur and helical gear pairs for bending, contact, and dynamic factors in the [Gear Design Calculator](/products/machine/gears).

---

**Purpose**

Design and rate spur and helical gear pairs for bending and contact (pitting) strength. Combines Lewis bending screening with ISO 6336 Method B/C factors including dynamic load \( K_V \), zone factor \( Z_H \), elasticity factor \( Z_E \), and contact ratio factor \( Y_\varepsilon \).

**Physics & theory**

Gear teeth convert rotation and torque through involute meshing. The transmitted tangential force at the pitch circle is \( W_t = 2T/d \), where \( T \) is torque and \( d \) is pitch diameter. Lewis equation estimates bending stress in a tooth treated as a cantilever: \( \sigma = W_t K_V / (b\,m\,Y_J) \), with module \( m \), face width \( b \), and form factor \( Y_J \).

Contact (Hertzian) stress between mating teeth limits pitting life. ISO 6336 expresses contact stress \( \sigma_H \) with factors for load sharing, geometry, lubrication, and material. The standard separates bending (Part 3) and contact (Part 2) calculations, each with distinct permissible stress values derived from material testing at reference conditions.

**Governing equations**

\[
W_t = \frac{2000\,P}{v}, \quad d = m\,N, \quad v = \frac{\pi\,d\,n}{60\,000}
\]

\[
\sigma_F = \frac{W_t\,K_A\,K_V\,K_{F\alpha}\,K_{F\beta}}{b\,m\,Y_F\,Y_S\,Y_\beta\,Y_B\,Y_{DT}} \leq \sigma_{FP}
\]

\[
\sigma_H = Z_E\,Z_H\,Z_\varepsilon\,Z_\beta \sqrt{\frac{W_t}{b\,d_1}\,\frac{u+1}{u}\,K_A\,K_V\,K_{H\alpha}\,K_{H\beta}} \leq \sigma_{HP}
\]

**Numerical method**

Closed-form ISO 6336 and Lewis screening via `solveGearDesign`. Input power, speed, module, face width, tooth counts, and material limits feed factor calculations. Results include bending and contact utilization, geometry summary, and pitch-line velocity.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `power`, `speed` | Transmitted power (kW), pinion speed (rpm) |
| `module`, `faceWidth` | Gear geometry |
| `pinionTeeth`, `gearRatio` | Tooth counts |
| `material` | Yield, allowable bending/contact stress |
| Application factors | \( K_A \), lubrication, quality grade |

**Outputs**

- Tangential force, pitch-line velocity, bending stress and utilization, contact stress and utilization, geometry (centers, diameters), factor breakdown.

**Design codes & checks**

- **Indicative:** Lewis bending and simplified Hertzian contact
- **ISO:** ISO 6336-1/2/3 Method B/C rating (screening)
- **US:** AGMA 2101-D04 (reference context)

**Assumptions & limitations**

- External spur/helical pair; no internal gears or planetary sets (see dedicated modules).
- Indicative scuffing and bending fatigue screening; full AGMA/ISO factor sets not included.
- Uniform load distribution along face width unless \( K_{H\beta} \) specified.
- No microgeometry (profile modification) analysis.

**Verification**

- CI: `gears-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. ISO 6336-1:2019. *Calculation of load capacity of spur and helical gears — Part 1: Basic principles*.
2. ISO 6336-2:2019. *Part 2: Calculation of surface durability (pitting)*.
3. ISO 6336-3:2019. *Part 3: Calculation of tooth bending strength*.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13–14.
5. AGMA 2101-D04. *Fundamental Rating Factors and Calculation Methods for Involute Spur and Helical Gear Teeth*.
