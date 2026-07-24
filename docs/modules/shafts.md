---
seoTitle: "Shaft Design Calculator – Von Mises, Goodman Fatigue & Critical Speed Analysis"
seoDescription: "Analyze rotating shafts under combined bending, torsion, and axial loads. Stepped geometry, Marin–Goodman fatigue, FEA critical speed, and bearing reactions with PhyCalcPro."
guideHeadline: "Shaft Stress, Fatigue & Critical Speed — Complete Engineering Guide"
keywords: ["shaft design", "von Mises stress", "Goodman fatigue", "critical speed", "rotating shaft calculator", "shaft deflection", "Marin factors", "shaft FEA"]
---

### Shaft Design Guide (`shafts`)

## How engineers design rotating shafts

Every power-transmission layout starts at the shaft. Motors, gearboxes, pumps, and compressors all rely on shafts to carry torque from a driver to a driven component while supporting radial loads from gears, pulleys, and couplings. A shaft must satisfy four concurrent requirements:

1. **Static strength** — peak von Mises stress at any section must stay below yield with an adequate safety factor.
2. **Fatigue endurance** — fully reversed bending from rotation plus steady torsion must not exceed the modified endurance limit (Goodman criterion).
3. **Stiffness** — deflection and slope at bearing seats and gear meshes must remain within coupling and mesh tolerances.
4. **Dynamic stability** — the first lateral critical speed must be well above (or well below) the operating speed to avoid resonance.

Design typically starts from the torque requirement, estimates a trial diameter from static strength, then iterates through fatigue, deflection, and critical-speed checks.

## Types and configurations

| Configuration | Typical use | Key feature |
|---|---|---|
| Solid uniform | Low-power drives, conveyor rollers | Simplest to manufacture |
| Stepped solid | Gearbox shafts, motor shafts | Shoulders locate bearings and gears |
| Hollow | Aerospace, high-speed spindles | Lower mass, higher critical speed per unit weight |
| Stub / overhung | Fan shafts, cantilever pumps | Load outboard of both bearings |

Stepped shafts introduce stress concentrations at fillets, keyways, and press-fit transitions. Each feature carries a theoretical stress concentration factor \( K_t \) that the fatigue analysis must account for.

## Engineering workflow

1. **Define loads** — Determine torque from power and speed (\( T = 9549\,P/n \) in N-m with P in kW), bending from belt pull or gear mesh forces, and any axial thrust.
2. **Lay out geometry** — Set bearing spans, shoulder locations, and preliminary diameters.
3. **Static check** — Compute von Mises equivalent stress at every critical section and compare to yield.
4. **Fatigue check** — Apply Marin surface, size, and load correction factors to the endurance limit; use modified Goodman to combine alternating bending with mean torsion.
5. **Deflection and slope** — Verify lateral deflection at gear meshes (typically less than 0.005 in per inch of gear face width) and bearing slope within coupling limits.
6. **Critical speed** — Calculate the first lateral natural frequency; ensure a critical-speed ratio of at least 2.0 for sub-critical designs.
7. **Iterate** — Adjust diameters, fillet radii, or bearing positions to satisfy all checks simultaneously.

## Key quantities and formulas

**Von Mises equivalent stress (static)**

\[
\sigma_{\mathrm{vm}} = \sqrt{\sigma_x^2 + 3\tau_{xy}^2}
\]

where \( \sigma_x = 32M/(\pi d^3) + 4F_a/(\pi d^2) \) for bending moment \( M \) and axial force \( F_a \), and \( \tau_{xy} = 16T/(\pi d^3) \) for torque \( T \).

**Modified Goodman fatigue criterion**

\[
\frac{\sigma_a}{S_e} + \frac{\sigma_m}{S_u} = \frac{1}{SF}
\]

Alternating component \( \sigma_a \) comes from fully reversed bending; mean component \( \sigma_m \) comes from steady torsion converted through von Mises.

**Marin endurance limit**

\[
S_e = k_a\,k_b\,k_c\,k_d\,k_e\,S_e'
\]

with surface factor \( k_a = a\,S_u^b \), size factor \( k_b \), load factor \( k_c \), temperature factor \( k_d \), and reliability factor \( k_e \).

**Critical speed (Rayleigh approximation)**

\[
\omega_{\mathrm{cr}} = \sqrt{\frac{g \sum w_i y_i}{\sum w_i y_i^2}}
\]

where \( w_i \) are lumped weights and \( y_i \) are static deflections at those stations.

## Worked example

**Problem:** A 45 mm diameter, 400 mm long AISI 1045 steel shaft carries a 1500 N gear force at midspan, transmits 12 kW at 1500 rpm, and is supported by two bearings at the ends.

1. Torque: \( T = 9549 \times 12 / 1500 = 76.4 \) N-m.
2. Bending moment at midspan: \( M = 1500 \times 0.200 / 2 = 150 \) N-m (simply supported).
3. Bending stress: \( \sigma = 32 \times 150 / (\pi \times 0.045^3) = 16.8 \) MPa.
4. Torsional shear: \( \tau = 16 \times 76.4 / (\pi \times 0.045^3) = 4.27 \) MPa.
5. Von Mises: \( \sigma_{\mathrm{vm}} = \sqrt{16.8^2 + 3 \times 4.27^2} = 18.4 \) MPa.
6. Static SF = \( 530 / 18.4 = 28.8 \) — amply safe; a smaller diameter can be explored.
7. Fatigue: with \( S_e \approx 280 \) MPa (machined, 45 mm), Goodman SF = \( 1 / (16.8/280 + 4.27 \times \sqrt{3}/530) = 14.2 \).
8. Critical speed check and deflection confirm viability at 1500 rpm.

## Common mistakes and checks

- **Ignoring stress concentrations** — A sharp fillet at a shoulder can reduce the fatigue safety factor by 50 % or more. Always apply \( K_f \) at every geometry transition.
- **Mixing up alternating and mean** — Bending in a rotating shaft is fully reversed (alternating); torque is usually steady (mean). Reversing this assignment gives dangerously wrong Goodman results.
- **Neglecting deflection limits** — A shaft can pass stress checks yet fail functionally because excessive slope misaligns a gear mesh or overloads a bearing.
- **Omitting critical speed** — Shafts operating near a natural frequency can vibrate catastrophically. Always compute the critical-speed ratio for high-speed machines.
- **Using uncorrected endurance limit** — The textbook value \( S_e' \approx 0.5\,S_u \) applies only to a polished 7.5 mm rotating-bending specimen. Real shafts require Marin corrections.

## FAQ

### What safety factor should I target for a shaft?
For general industrial machinery, a static SF of 2.0–3.0 on yield and a fatigue SF of 1.5–2.5 on the Goodman line are typical starting points. Critical applications (aerospace, nuclear) use higher factors or probabilistic methods.

### How do I handle a keyway in fatigue analysis?
Keyways introduce a stress concentration factor \( K_t \approx 2.0\text{–}3.0 \) (profile keyway). Convert to fatigue factor \( K_f \) using notch sensitivity \( q \): \( K_f = 1 + q(K_t - 1) \). Apply \( K_f \) to the alternating stress component.

### When should I use a hollow shaft?
Hollow shafts are advantageous when weight matters (rotating equipment, aerospace) or when internal passages are needed (coolant, wiring). A hollow shaft with \( d_i/d_o = 0.5 \) retains 94 % of the bending stiffness at 75 % of the weight.

### What is the difference between Goodman and Soderberg criteria?
Goodman uses ultimate strength for the mean-stress intercept, giving a moderately conservative result for ductile steels. Soderberg uses yield strength and is more conservative. Most textbooks recommend modified Goodman for steel shafts.

### How does the calculator estimate critical speed?
PhyCalcPro uses 1D FEA beam elements with lumped masses. The first two lateral eigenvalues are extracted and compared to the operating speed, reporting a critical-speed ratio and safety margin.

## Use the PhyCalcPro calculator

Run a full shaft analysis — static stress, Goodman fatigue, deflection, and critical speed — in the [Shaft Design Calculator](/products/machine/shafts).

---

**Purpose**

Analyze rotating shafts under combined bending, torsion, and axial loads using 1D FEA. Supports stepped/hollow geometry, configurable bearing supports, transverse forces, stress concentrations, fatigue screening (Marin + Goodman), FEA critical speed, and bearing reaction handoff.

**Physics & theory**

Power-transmitting shafts experience bending from belt/gear forces, torsion from transmitted torque, and occasional axial thrust. Stress at any section combines normal and bending stress with torsional shear; von Mises equivalent stress governs static yield checks for ductile materials.

Rotating shafts subject the outermost fiber to fully reversed bending stress each revolution, making fatigue the dominant failure mode for most industrial shafts. Torsion is typically steady. The modified Goodman diagram plots alternating stress against mean stress, with the endurance limit and ultimate strength as intercepts.

Critical (whirling) speed is the shaft rotational frequency that coincides with a lateral bending natural frequency. Operating near critical speed causes large vibration amplitudes and bearing damage. The Rayleigh method or FEA eigenvalue extraction identifies the first lateral modes.

**Governing equations**

\[
\sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2}
\]

\[
SF_{\mathrm{static}} = \frac{\sigma_y}{\sigma_{\mathrm{vm,max}}}, \quad
SF_{\mathrm{cr}} = \frac{\omega_{\mathrm{cr}}}{\omega_{\mathrm{operating}}}
\]

Fatigue (Indicative/US): modified Goodman on von Mises alternating/mean components with Marin factors (Shigley).

**Numerical method**

1D shaft FEM: Hermite beam elements (12 DOF) with axial, torsion, and biaxial bending. Stepped diameter and hollow sections via segment mesh. Pin or fixed supports at user-defined bearing positions. Lumped-mass eigen iteration for critical speed.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `geometry` | Uniform or stepped segments (length, OD, ID) |
| `supports` | Bearing positions — pin (journal) or fixed |
| `loads` | Torque, bending moment, transverse force, axial force at stations |
| `stressFeatures` | Shoulder fillet, keyway, or custom Kt |
| `operatingRpm` | Enables fatigue and critical speed margin |
| `material` | E, G, density, yield, ultimate strength |

**Outputs**

- T(x), M(x), V(x), \( \sigma_{\mathrm{vm}}(x) \), deflection, slope, critical speed, fatigue SF
- Bearing reactions and slope utilization
- Governing failure mode (static / fatigue / deflection / slope / whirling)

**Design codes & checks**

- **Indicative:** von Mises static, deflection, critical speed margin, Goodman fatigue
- **US:** AGMA 6001 interface loads (context via gear handoff)
- **EU:** DIN 743 full worksheet — *not yet implemented*; use Indicative fatigue for screening

**Assumptions & limitations**

- Linear elastic Timoshenko/Euler shaft model; no 3D fillet FEA
- Kt from Peterson/Shigley approximations, not DIN 743-2 tables
- Critical speed: first two lateral modes; gyroscopic/damping omitted
- DIN 743 influence factors (K1, K2, K3, beta, K_V) not yet integrated

**Verification**

- CI: `shafts-indicative-01.json`
- Vitest: `src/lib/machine/shafts/engine.test.ts`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md) (Machine — shafts)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
2. Peterson, R. E. *Stress Concentration Factors*, 4th ed.
3. DIN 743:2012. *Calculation of load capacity of shafts and axles*.
4. Norton, R. L. *Machine Design: An Integrated Approach*, 6th ed., Ch. 6.
5. AGMA 6001-E08. *Design and Selection of Components for Enclosed Gear Drives*.
