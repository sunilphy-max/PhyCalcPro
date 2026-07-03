### Bevel Gear Screening (`bevel-gears`)

**Purpose**

Screen straight and spiral bevel gear sets for geometry, pitch cone dimensions, and bending/contact strength using adapted spur gear rating methods. Provides preliminary sizing before detailed Gleason/Klingelnberg analysis.

**Physics & theory**

Bevel gears transmit power between intersecting axes, typically at 90°. Pitch cone geometry relates pinion and gear tooth counts through shaft angle \( \Sigma \). Mean cone distance \( R_m \) and mean module \( m_m \) define the virtual spur gear equivalent used for strength screening.

Tangential force acts at the mean pitch circle on the pitch cone. Bending and contact stresses use ISO 6336–style factors applied to the virtual cylindrical gear dimensions. Face width is limited by cone length and should not exceed \( R_m/3 \) without detailed analysis.

**Governing equations**

\[
\delta_1 = \arctan\left(\frac{\sin\Sigma}{N_2/N_1 + \cos\Sigma}\right), \quad \delta_2 = \Sigma - \delta_1
\]

\[
d_{m1} = m_m N_1, \quad R_m = \frac{d_{m1}}{2\sin\delta_1}
\]

\[
\sigma_F = \frac{W_t K_A K_V}{b m_m Y} \leq \sigma_{FP}, \quad \sigma_H \leq \sigma_{HP}
\]

**Numerical method**

Virtual spur gear transformation followed by gear rating checks shared with the spur gear module. Cone geometry computed from tooth counts and shaft angle; strength factors applied at mean section.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `pinionTeeth`, `gearTeeth` | Tooth counts |
| Shaft angle \( \Sigma \) | Usually 90° |
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
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
4. Maitra, G. M. *Handbook of Gear Design*, 2nd ed. McGraw-Hill.
5. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
