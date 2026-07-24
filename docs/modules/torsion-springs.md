---
seoTitle: "Torsion Spring Calculator – Bending Rate, Curvature Factor & Fatigue Analysis"
seoDescription: "Design helical torsion springs with angular rate, curvature-corrected bending stress, leg stress, and EN 13906-3 fatigue screening using PhyCalcPro."
guideHeadline: "Helical Torsion Spring Design — Angular Rate, Bending Stress & Fatigue Guide"
keywords: ["torsion spring calculator", "torsion spring design", "angular spring rate", "curvature factor", "bending stress", "EN 13906-3", "spring fatigue", "leg stress"]
---

### Torsion Spring Design Guide (`torsion-springs`)

## How engineers design torsion springs

Helical torsion springs resist rotational loading through wire bending — not through torsional shear as the name might suggest. When a moment is applied through the spring's legs, the coil body acts as a curved beam in bending. This makes the governing stress a bending stress, corrected for curvature, rather than the shear stress that governs compression and extension springs.

Torsion springs are found in clothespins, mousetraps, door hinges, counterbalance mechanisms, and precision instrument pivots. Design involves matching the angular spring rate to the required torque at a specified deflection angle while keeping the curvature-corrected bending stress and the leg stress within allowable limits.

## Types and configurations

| Leg configuration | Application | Design note |
|---|---|---|
| Both legs straight, tangent | Clothespins, hinges | Simplest, lowest cost |
| One leg straight, one bent | Ratchet pawls, levers | Asymmetric loading |
| Both legs with hooks | Linkage mechanisms | Custom attachment |
| Double torsion (nested) | High-torque, compact | Two springs wound opposite-hand, connected by a common center section |

Torsion springs wind *down* under load — the coil diameter decreases and the body length increases as the spring is deflected. The design must ensure the wound-down diameter clears any mandrel or housing bore.

## Engineering workflow

1. **Define requirements** — Target angular rate \( k \) (N-m/rad or N-mm/deg), maximum torque \( M_{\mathrm{max}} \), angular deflection \( \theta \), and space envelope (maximum OD, mandrel ID).
2. **Select wire material** — Same grades as other spring types. Allowable bending stress for torsion springs is higher than shear: \( \sigma_{\mathrm{zul}} = 0.78\,R_m \) (EN 13906-3 static, cold-coiled).
3. **Choose wire and coil geometry** — Spring index \( C = D/d \) between 4 and 12. Rate is governed by the flexural stiffness formula.
4. **Compute active coils** — From the rate: \( n_a = Ed^4/(64 D k) \).
5. **Check bending stress** — Apply curvature factor \( K_b \) to the mean-diameter bending stress.
6. **Check leg stress** — Legs act as cantilever beams; bending stress at the leg root is estimated separately.
7. **Check wound-down diameter** — At maximum deflection, the new mean diameter is \( D' = D\,n_a/(n_a + \theta/360) \). Verify clearance over the mandrel.
8. **Fatigue screening** — If cyclic, check the bending stress range against EN 13906-3 fatigue limits.

## Key quantities and formulas

**Angular spring rate**

\[
k = \frac{E\,d^4}{64\,D\,n_a}
\]

where \( E \) is Young's modulus, \( d \) is wire diameter, \( D \) is mean coil diameter, and \( n_a \) is the active coil count. This equation (Shigley Eq. 10-37) treats each coil as a curved beam in bending.

**Curvature-corrected bending stress**

\[
\sigma = K_b \frac{32\,M}{\pi\,d^3}
\]

\[
K_b = \frac{4C^2 - C - 1}{4C\,(C - 1)}, \quad C = \frac{D}{d}
\]

The curvature factor \( K_b \) accounts for the higher stress on the inner fiber of the coil. It ranges from about 1.05 at \( C = 12 \) to 1.25 at \( C = 4 \).

**Torque at deflection angle**

\[
M = k \cdot \theta
\]

where \( \theta \) is in radians. For input in degrees: \( M = k \cdot \theta_{\mathrm{deg}} \cdot \pi/180 \).

**Wound-down mean diameter**

\[
D' = \frac{D\,n_a}{n_a + \theta/(2\pi)}
\]

## Worked example

**Problem:** Design a torsion spring for a hinge: rate 0.25 N-m/rad, maximum angle 90 degrees, mandrel diameter 8 mm. Material: stainless A313 Type 302, \( E = 193\,000 \) MPa.

1. Maximum torque: \( M = 0.25 \times \pi/2 = 0.393 \) N-m = 393 N-mm.
2. Try \( d = 2.0 \) mm, \( D = 14 \) mm. Spring index: \( C = 7.0 \).
3. Active coils: \( n_a = 193\,000 \times 16 / (64 \times 14 \times 250) = 3\,088\,000 / 224\,000 = 13.8 \). Use \( n_a = 14 \).
4. Actual rate: \( k = 193\,000 \times 16 / (64 \times 14 \times 14) = 3\,088\,000 / 12\,544 = 246 \) N-mm/rad = 0.246 N-m/rad.
5. Curvature factor: \( K_b = (196 - 7 - 1)/(4 \times 7 \times 6) = 188/168 = 1.119 \).
6. Bending stress: \( \sigma = 1.119 \times 32 \times 393 / (\pi \times 8) = 1.119 \times 12\,576/25.13 = 560 \) MPa.
7. Wire strength (\( d = 2 \) mm, A313-302): \( R_m \approx 1750 \) MPa. Allowable: \( 0.78 \times 1750 = 1365 \) MPa.
8. Utilization: \( 560/1365 = 41\% \) — well within limits.
9. Wound-down diameter: \( D' = 14 \times 14/(14 + 0.25) = 196/14.25 = 13.75 \) mm. Inner diameter: \( 13.75 - 2.0 = 11.75 \) mm. Clearance over 8 mm mandrel: 3.75 mm — adequate.
10. Body length at max wind: \( (14 + 90/360) \times 2.0 = 14.5 \times 2.0 = 29.0 \) mm. Verify housing depth.

## Common mistakes and checks

- **Confusing bending and shear stress** — Torsion springs are loaded in bending, not torsional shear. Using the shear stress formula from compression springs gives the wrong stress and the wrong allowable (\( 0.56\,R_m \) vs \( 0.78\,R_m \)).
- **Ignoring wound-down diameter** — As the spring winds, the inner diameter shrinks. If it contacts the mandrel, friction changes the effective rate and causes wear. Always verify clearance at maximum deflection.
- **Ignoring body length increase** — Torsion springs get longer as they wind. The body length at full deflection is \( (n_a + \theta/360) \times d \). Ensure the housing can accommodate this growth.
- **Winding in the wrong direction** — Torsion springs must be loaded to wind the coils tighter (decreasing diameter). Loading in the unwinding direction opens the coils and can cause premature failure.
- **Neglecting leg stress** — The leg-body junction is a stress concentration point. Straight legs in bending can have higher stress than the coil body, especially for short, thick legs.

## FAQ

### Why is the allowable stress higher for torsion springs than compression springs?
Torsion springs are stressed in bending, where the maximum stress occurs only at the outermost fiber. Compression springs are stressed in torsional shear, which is more uniformly distributed through the cross section. The different stress distributions lead to different allowable limits: \( 0.78\,R_m \) vs \( 0.56\,R_m \) (EN 13906).

### How do I account for leg length in the rate calculation?
Long legs add flexibility, slightly reducing the effective rate. Each straight leg contributes deflection equivalent to a fraction of a coil: \( n_{\mathrm{eff}} = n_a + l_1/(3\pi D) + l_2/(3\pi D) \), where \( l_1, l_2 \) are leg lengths. PhyCalcPro includes this correction.

### What is a double torsion spring?
Two torsion springs wound in opposite directions, connected by a shared middle section. This configuration cancels the axial thrust that a single torsion spring produces and doubles the torque capacity in the same radial space.

### Can I use this module for constant-force or spiral springs?
No. This module covers helical torsion springs (wire wound in a helix). Spiral (clock) springs and constant-force springs have fundamentally different mechanics and are not currently covered.

### When should I enable fatigue screening?
Enable fatigue whenever the spring cycles more than about \( 10^4 \) times over its life. Hinge springs on frequently used doors, reciprocating mechanisms, and ratchet springs all require fatigue evaluation per EN 13906-3.

## Use the PhyCalcPro calculator

Design helical torsion springs with curvature-corrected stress and fatigue in the [Torsion Spring Calculator](/products/springs/torsion-springs).

---

**Purpose**

Design helical torsion springs loaded by bending in the coil wire (typically via legs). Computes spring rate, curvature-corrected coil bending stress, leg stress estimate, EN 13906 fatigue screening, and wire catalog selection.

**Physics & theory**

Torsion springs store energy through wire bending rather than torsion shear along the coil axis. Spring rate in terms of angle \( \theta \) is:

\[
k = \frac{E\,d^4}{64\,D\,n_a}
\]

(Shigley Eq. 10-37), for \( n_a \) active coils. Bending stress uses curvature factor \( K_b \) on the mean-diameter stress:

\[
\sigma = K_b \frac{32\,M}{\pi\,d^3}
\]

Legs act as cantilever beams; leg bending stress is estimated separately. Allowable bending stress screening uses \( \sigma_{\mathrm{zul}} = 0.78\,R_m \) (EN 13906-3 for cold-coiled springs).

**Governing equations**

\[
k = \frac{E\,d^4}{64\,D\,n_a}, \quad M = k\,\theta
\]

\[
\sigma_{\mathrm{coil}} = K_b \frac{32\,M}{\pi\,d^3}
\]

\[
K_b = \frac{4C^2 - C - 1}{4C\,(C-1)}, \quad C = D/d
\]

**Numerical method**

Closed-form bending-based rate and stress with Shigley curvature factor. Optional EN 13906 bending fatigue when minimum wind angle is specified. Auto-design sweeps wire diameter, coil count, and leg length for target rate and bending SF.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `wireDiameter`, `meanDiameter` | Coil geometry |
| `activeCoils` | Active coil count |
| `legLength` | Leg geometry |
| `deflectionAngleDeg` | Operating wind angle |
| `wireType` / wire stock picker | Grade or catalog designation |
| Fatigue panel | Life class, wire quality, minimum angle (deg) |

**Outputs**

- Spring rate (N-m/rad), torque at angle, coil bending stress with \( K_b \)
- Leg force and leg bending stress estimate, static SF
- Optional fatigue SF; spring index, governing failure mode
- Torque-angle and stress-angle plots

**Design codes & checks**

- **Indicative:** Coil bending stress utilization, fatigue life (when enabled)
- **EU:** EN 13906-3 torsion springs (reference)

**Assumptions & limitations**

- Circular wire; rectangular wire requires different section modulus.
- Leg stress uses simplified cantilever model; coil-leg junction not FEA'd.
- Rate formula uses Shigley Eq. 10-37 (re-baseline saved projects from older builds).
- Fatigue simplified per EN 13906-3 screening.

**Verification**

- CI: `torsion-springs-indicative-01.json`
- Vitest: `src/lib/springs/torsion-springs/engine.test.ts`
- Engineer sign-off: [spring-modules-user-tasks.md](./spring-modules-user-tasks.md)

**References**

1. EN 13906-3:2013. *Cylindrical helical springs — Part 3: Torsion springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed., McGraw-Hill.
4. Spring Manufacturers Institute. *Handbook of Spring Design*.
5. Berry, W. R. *Spring Design: A Practical Treatment*. Emmott & Co.
