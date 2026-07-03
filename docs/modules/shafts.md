### Shaft Design (`shafts`)

**Purpose**

Analyze rotating shafts under combined bending, torsion, and axial loads using 1D FEA. Supports stepped/hollow geometry, configurable bearing supports, transverse forces, stress concentrations, fatigue screening (Marin + Goodman), FEA critical speed, and bearing reaction handoff.

**Physics & theory**

Power-transmitting shafts experience bending from belt/gear forces, torsion from transmitted torque, and occasional axial thrust. Stress at any section combines normal and bending stress with torsional shear; von Mises equivalent stress governs static yield checks for ductile materials.

Rotating shafts subject bending to fully reversed fatigue; torsion is typically steady. Critical (whirling) speed is estimated from FEA mass and bending stiffness (first lateral modes).

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
- DIN 743 influence factors (K₁, K₂, K₃, β, K_V) not yet integrated

**Verification**

- CI: `shafts-indicative-01.json`
- Vitest: `src/lib/machine/shafts/engine.test.ts`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md) (Machine → shafts)

**Cross-module handoff**

- Publishes alternating/mean stress to **fatigue** module after calculate
- Receives gear/pulley loads from upstream calculators (manual today)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 7.
2. Peterson, R. E. *Stress Concentration Factors*.
3. DIN 743:2012 (EU target standard — partial integration planned).
