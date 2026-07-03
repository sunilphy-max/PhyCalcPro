### Rotational Systems (`rotation`)

**Purpose**

Analyze rotational dynamics including angular acceleration, torque requirements, power, and kinetic energy for systems with inertia and speed profiles. Supports motor sizing and transient speed-up/down screening.

**Physics & theory**

Newton's law for rotation: \( T = I \alpha \), where \( I \) is mass moment of inertia and \( \alpha \) is angular acceleration. Kinetic energy \( E_k = \frac{1}{2} I \omega^2 \). Power \( P = T \omega \) relates torque and angular velocity.

Speed change from \( \omega_1 \) to \( \omega_2 \) requires work \( \Delta E = \frac{1}{2} I (\omega_2^2 - \omega_1^2) \). Time to accelerate depends on available torque net of load and friction. Reflected inertia through gear ratio \( i \): \( I_{\mathrm{eq}} = I / i^2 \) when referred to motor shaft.

Dynamic analysis requires careful identification of mass, stiffness, and damping distribution. Natural frequencies depend on boundary conditions — a cantilever beam has fundamentally different modes than a simply supported beam of the same dimensions.

Damping limits resonant amplification; lightly damped structures (( zeta < 0.05 )) can see transmissibility peaks exceeding 10 near resonance. Separation margin between operating excitation and natural frequency should typically exceed 15–20% for rotating machinery.

**Governing equations**

\[
T = I \alpha, \quad P = T \omega = \frac{T n}{9.55} \quad \text{(kW, rpm, N·m)}
\]

\[
E_k = \frac{1}{2} I \omega^2, \quad t_{\mathrm{accel}} = \frac{I \Delta \omega}{T_{\mathrm{net}}}
\]

**Numerical method**

Closed-form rotational dynamics (`engine`). User supplies inertia, torque, speed range; outputs acceleration time, peak power, energy. Optional gear ratio for reflected inertia.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `inertia` | Mass moment of inertia \( I \) |
| `torque` | Applied or motor torque |
| Speed range | Initial and final rpm |
| Load torque, friction | Resistive torques |
| Gear ratio (optional) | Inertia reflection |

**Outputs**

- Angular acceleration, acceleration time, kinetic energy change, power at speed, torque utilization.

**Design codes & checks**

- **Indicative:** Torque capacity utilization


**Assumptions & limitations**

- Rigid body rotation; no torsional compliance or backlash dynamics.
- Constant torque during transient unless torque profile specified.
- No gyroscopic effects on supported shafts.
- Motor thermal limits not evaluated.

**Verification**

- CI: `rotation-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 15.
2. Norton, R. L. *Design of Machinery*, 6th ed.
3. Rao, S. S. *Mechanical Vibrations*, 6th ed.
4. IEC 60034-12. *Rotating electrical machines* (motor sizing context).
5. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
