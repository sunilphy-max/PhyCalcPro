### Gear Design (`gears`) — **beta**

**Purpose**

Design and rate spur and helical gear pairs for bending and contact (pitting) strength. Combines Lewis bending screening with ISO 6336 Method B/C factors including dynamic load \( K_V \), zone factor \( Z_H \), elasticity factor \( Z_E \), and contact ratio factor \( Y_\varepsilon \).

**Physics & theory**

Gear teeth convert rotation and torque through involute meshing. Transmitted tangential force at the pitch circle is \( W_t = 2T/d \), where \( T \) is torque and \( d \) is pitch diameter. Lewis equation estimates bending stress in a tooth treated as a cantilever: \( \sigma = W_t K_V / (b m Y_J) \), with module \( m \), face width \( b \), and form factor \( Y_J \).

Contact (Hertzian) stress between mating teeth limits pitting life. ISO 6336 expresses contact stress \( \sigma_H \) with factors for load sharing, geometry, lubrication, and material. Scuffing and micropitting are not fully evaluated in indicative mode.

**Governing equations**

\[
W_t = \frac{2000 P}{v}, \quad d = m N, \quad v = \frac{\pi d n}{60000}
\]

\[
\sigma_F = \frac{W_t K_A K_V K_F K_\alpha}{b m Y_\beta Y_B Y_DT} \leq \sigma_{FP}
\]

\[
\sigma_H = Z_E Z_H Z_\varepsilon Z_\beta \sqrt{\frac{F_t}{b d_1} \frac{u+1}{u} K_A K_V K_{H\alpha} K_{H\beta}} \leq \sigma_{HP}
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

**References**

1. ISO 6336-1:2019. *Calculation of load capacity of spur and helical gears — Part 1: Basic principles*.
2. ISO 6336-2:2019. *Part 2: Calculation of surface durability (pitting)*.
3. ISO 6336-3:2019. *Part 3: Calculation of tooth bending strength*.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13–14.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
