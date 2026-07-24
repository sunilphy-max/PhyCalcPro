---
seoTitle: "Fatigue Life Calculator – S-N Curve, Goodman Diagram & Marin Factor Analysis"
seoDescription: "Estimate fatigue life with S-N curves, Marin modification factors, and Goodman, Gerber, or Morrow mean-stress corrections for rotating bending, axial, and torsion loading."
guideHeadline: "Fatigue Life Assessment — S-N Curves, Goodman & Marin Factors Guide"
keywords: ["fatigue calculator", "S-N curve", "Goodman diagram", "Marin factors", "endurance limit", "fatigue life", "mean stress correction", "Basquin equation"]
---

### Fatigue Assessment Guide (`fatigue`)

## How engineers analyze fatigue life

Fatigue is the most common cause of mechanical failure — responsible for an estimated 80–90 % of all structural and machine component failures. Unlike static overload, fatigue failure occurs at stress levels well below the material's yield strength through the gradual accumulation of micro-damage over millions of load cycles.

The design process centers on the S-N curve, which relates the applied stress amplitude to the number of cycles to failure. For steels, a distinct endurance limit exists near \( 10^6 \) cycles: stress amplitudes below this level can theoretically be sustained indefinitely. But the raw endurance limit from a polished laboratory specimen must be corrected for real-world conditions — surface finish, component size, loading type, temperature, and reliability — using Marin modification factors.

When the component also sees a steady (mean) stress in addition to the alternating component, the allowable alternating stress decreases. The Goodman, Gerber, and Morrow diagrams provide different mean-stress correction models.

## Types and configurations

| Loading type | Stress pattern | Typical component |
|---|---|---|
| Rotating bending | Fully reversed (\( R = -1 \)) | Shafts, axles |
| Axial (push-pull) | Various \( R \)-ratios | Connecting rods, bolts |
| Torsion | Reversed or pulsating shear | Drive shafts, springs |
| Combined | Multiaxial alternating + mean | Crankshafts, gear teeth |

The module handles uniaxial fatigue with user-specified alternating and mean stress components. Multiaxial fatigue requires equivalent stress approaches (von Mises for proportional loading) before entry.

## Engineering workflow

1. **Determine loading** — Identify the alternating stress amplitude \( S_a \) and mean stress \( S_m \) at the critical location. For rotating bending, \( S_a \) equals the bending stress and \( S_m = 0 \).
2. **Get material data** — Ultimate tensile strength \( S_u \), and either the measured endurance limit or the estimate \( S_e' \approx 0.5\,S_u \) (for \( S_u \leq 1400 \) MPa steels).
3. **Apply Marin factors** — Surface finish \( k_a \), size \( k_b \), load type \( k_c \), temperature \( k_d \), and reliability \( k_e \) to get the modified endurance limit \( S_e \).
4. **Select mean-stress method** — Goodman (linear, moderately conservative), Gerber (parabolic, less conservative), or Morrow (uses true fracture strength).
5. **Check infinite life** — If \( S_a \leq S_e \) after mean-stress correction, the component has infinite life at the specified reliability.
6. **Estimate finite life** — If \( S_a > S_e \), use the Basquin equation to predict cycles to failure between \( 10^3 \) and \( 10^6 \).

## Key quantities and formulas

**Modified Goodman criterion**

\[
\frac{S_a}{S_e} + \frac{S_m}{S_u} = \frac{1}{SF}
\]

This is the most widely used mean-stress correction for steel machine components.

**Marin endurance limit**

\[
S_e = k_a\,k_b\,k_c\,S_e'
\]

where \( k_a = a\,S_u^b \) (surface finish, from Shigley Table 6-2), \( k_b \) depends on the characteristic dimension \( d \), and \( k_c \) depends on load type (1.0 bending, 0.85 axial, 0.59 torsion).

**Basquin finite-life equation**

\[
S_f = a\,N^b, \quad a = \frac{(f\,S_u)^2}{S_e}, \quad b = -\frac{1}{3}\log_{10}\!\left(\frac{f\,S_u}{S_e}\right)
\]

where \( f \approx 0.8\text{--}0.9 \) is the fatigue strength fraction at \( 10^3 \) cycles.

**Gerber parabola (alternative)**

\[
\frac{S_a}{S_e} + \left(\frac{S_m}{S_u}\right)^2 = 1
\]

## Worked example

**Problem:** A machined AISI 1040 steel shaft (\( S_u = 590 \) MPa) of 30 mm diameter experiences rotating bending with \( S_a = 180 \) MPa and steady torsion giving \( S_m = 50 \) MPa (von Mises equivalent).

1. Uncorrected endurance limit: \( S_e' = 0.5 \times 590 = 295 \) MPa.
2. Surface factor (machined): \( k_a = 4.51 \times 590^{-0.265} = 0.832 \).
3. Size factor (30 mm): \( k_b = 1.24 \times 30^{-0.107} = 0.862 \).
4. Load factor (bending): \( k_c = 1.0 \).
5. Modified endurance limit: \( S_e = 0.832 \times 0.862 \times 1.0 \times 295 = 211 \) MPa.
6. Goodman check: \( 180/211 + 50/590 = 0.853 + 0.085 = 0.938 \). Safety factor: \( 1/0.938 = 1.07 \) — marginal, may need diameter increase.
7. Finite life estimate: \( a = (0.9 \times 590)^2/211 = 1494 \), \( b = -\frac{1}{3}\log_{10}(531/211) = -0.133 \). \( N = (180/1494)^{1/-0.133} = 3.4 \times 10^5 \) cycles — finite but adequate for many applications.

## Common mistakes and checks

- **Using uncorrected endurance limit** — The textbook \( S_e' = 0.5\,S_u \) applies only to a polished 7.5 mm rotating-bending specimen. Real components require all Marin corrections; omitting surface finish alone can overpredict life by an order of magnitude.
- **Ignoring mean stress** — Preloaded bolts, pressurized components, and rotating shafts under gravity all have nonzero mean stress. Even a modest mean stress significantly reduces the allowable alternating stress.
- **Wrong load factor \( k_c \)** — Using bending factor for an axial loading case overstates the endurance limit by 18 %. Identify the actual loading type at the critical location.
- **Extrapolating beyond \( 10^6 \) cycles** — The Basquin equation is valid between \( 10^3 \) and \( 10^6 \) cycles. Beyond \( 10^6 \), the S-N curve flattens at the endurance limit for steels (but not for aluminum or other non-ferrous alloys).
- **Neglecting notch sensitivity** — Applying the full theoretical \( K_t \) to fatigue calculations is conservative. The fatigue concentration factor is \( K_f = 1 + q(K_t - 1) \), where notch sensitivity \( q < 1 \) for ductile materials at mild notches.

## FAQ

### What is the difference between Goodman, Gerber, and Soderberg?
Goodman uses a straight line from \( S_e \) on the alternating axis to \( S_u \) on the mean axis — moderately conservative. Gerber uses a parabola to the same intercept — less conservative and closer to experimental data for ductile steels. Soderberg uses yield strength instead of ultimate — the most conservative. Most machine design textbooks recommend modified Goodman.

### Does the endurance limit exist for all materials?
Steels and titanium alloys exhibit a distinct knee in the S-N curve near \( 10^6 \) cycles (endurance limit). Aluminum, copper, and most non-ferrous alloys do not — their S-N curves continue to decline, and a fatigue strength at a specified life (e.g., \( 5 \times 10^8 \) cycles) is used instead.

### How do I handle variable-amplitude loading?
For varying stress amplitudes, Miner's linear damage rule sums cycle ratios: \( \sum n_i/N_i \leq 1.0 \). This is a first-order approximation; load sequence effects and small-cycle thresholds are not captured.

### When should I use strain-life instead of stress-life?
Strain-life (Coffin-Manson) is appropriate for low-cycle fatigue (below \( 10^3 \) cycles) where significant plastic deformation occurs. The stress-life approach in this module applies to high-cycle fatigue (\( 10^3 \) to \( 10^7+ \) cycles) where stresses remain nominally elastic.

### Can I use this module for weld fatigue?
Weld fatigue follows different S-N curves classified by joint detail category (BS 7608, EN 1993-1-9). The Marin factor approach does not apply to welds. Use code-specific fatigue detail categories for welded joints.

## Use the PhyCalcPro calculator

Estimate fatigue life and mean-stress-adjusted endurance in the [Fatigue Assessment Calculator](/products/materials/fatigue).

---

**Purpose**

Estimate fatigue life and mean-stress-adjusted allowable alternating stress using S-N curves, Marin modification factors, and Goodman, Gerber, or Morrow mean-stress corrections. Supports rotating bending, axial, and torsion load types.

**Physics & theory**

Fatigue failure occurs below yield after many stress cycles. The S-N curve relates alternating stress amplitude \( S_a \) to life \( N \). Endurance limit \( S_e' \) at \( 10^6 \) cycles is modified by Marin factors: surface finish \( k_a \), size \( k_b \), load type \( k_c \), giving \( S_e = k_a\,k_b\,k_c\,S_e' \).

Mean stress \( S_m \) reduces allowable alternating stress. Modified Goodman: \( S_a/S_e + S_m/S_u = 1 \). Gerber uses parabolic mean-stress locus; Morrow uses true fracture strength. Basquin log-linear relation between \( 10^3 \) and \( 10^6 \) cycles predicts finite life: \( S_f = a\,N^b \).

**Governing equations**

\[
\frac{S_a}{S_e} + \frac{S_m}{S_u} = 1 \quad \text{(Modified Goodman)}
\]

\[
S_e = k_a\,k_b\,k_c\,S_e', \quad k_a = a\,S_u^b \quad \text{(surface finish)}
\]

\[
S_f = a\,N^b, \quad a = \frac{(f\,S_u)^2}{S_e}, \quad b = -\frac{1}{3}\log_{10}\!\left(\frac{f\,S_u}{S_e}\right)
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
- Marin factor breakdown

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
2. Dowling, N. E. *Mechanical Behavior of Materials*, 5th ed.
3. ISO 12107:2012. *Metallic materials — Fatigue testing — Statistical planning*.
4. Peterson, R. E. *Stress Concentration Factors*, 4th ed.
5. Bannantine, J. A., Comer, J. J., & Handrock, J. L. *Fundamentals of Metal Fatigue Analysis*.
