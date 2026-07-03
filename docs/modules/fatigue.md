### Fatigue Assessment (`fatigue`)

**Purpose**

Estimate fatigue life and mean-stress-adjusted allowable alternating stress using S–N curves, Marin modification factors, and Goodman, Gerber, or Morrow mean-stress corrections. Supports rotating bending, axial, and torsion load types.

**Physics & theory**

Fatigue failure occurs below yield after many stress cycles. The S–N curve relates alternating stress amplitude \( S_a \) to life \( N \). Endurance limit \( S_e' \) at \( 10^6 \) cycles is modified by Marin factors: surface finish \( k_a \), size \( k_b \), load type \( k_c \), giving \( S_e = k_a k_b k_c S_e' \).

Mean stress \( S_m \) reduces allowable alternating stress. Modified Goodman: \( S_a/S_e + S_m/S_u = 1 \). Gerber uses parabolic mean-stress locus; Morrow uses true fracture strength. Basquin log-linear relation between \( 10^3 \) and \( 10^6 \) cycles predicts finite life: \( S_f = a N^b \).

Notch sensitivity and stress concentrations are not computed in this module — apply fatigue stress concentration factors to nominal stresses before entry when needed.

**Governing equations**

\[
\frac{S_a}{S_e} + \frac{S_m}{S_u} = 1 \quad \text{(Modified Goodman)}
\]

\[
S_e = k_a k_b k_c S_e', \quad k_a = a S_u^b \quad \text{(surface finish)}
\]

\[
S_f = a N^b, \quad a = \frac{(f S_u)^2}{S_e}, \quad b = -\frac{\log_{10}(f S_u / S_e)}{3}
\]

**Numerical method**

Closed-form Marin factors (Shigley Table 6-2), mean-stress correction, and Basquin life prediction (`engine`). Surface finish, size, load type, and method selectable. Infinite life flagged when \( S_a \leq S_e \) after mean-stress correction.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `alternatingStress`, `meanStress` | \( S_a \), \( S_m \) |
| `ultimateStrength`, `enduranceLimit` | Material fatigue data |
| `surfaceFinish`, `loadType` | Marin factors |
| `characteristicDiameter` | Size factor (rotating bending) |
| `meanStressMethod` | goodman, gerber, or morrow |

**Outputs**

- Modified endurance limit, allowable alternating stress, predicted cycles to failure, infinite-life flag
- Marin factor breakdown.

**Design codes & checks**

- **Indicative:** Modified Goodman utilization, estimated fatigue life
- **ISO:** ISO 12107 fatigue of metallic materials
- **US:** ASME VIII-2 fatigue screening (reference)


**Assumptions & limitations**

- Uniaxial stress state; multiaxial fatigue needs equivalent stress approaches.
- No notch sensitivity \( K_f \) unless user adjusts endurance limit.
- Constant amplitude loading; variable amplitude needs Miner's rule extension.
- No environmental corrosion-fatigue interaction.

**Verification**

- CI: `fatigue-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 6.
2. ISO 12107:2012. *Metallic materials — Fatigue testing — Statistical planning*.
3. Dowling, N. E. *Mechanical Behavior of Materials*, 5th ed.
4. Peterson, R. E. *Stress Concentration Factors*.
5. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
