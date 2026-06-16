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

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Design practice note**

Screening results from this module inform preliminary sizing and design reviews. Final designs subject to applicable regulations, customer specifications, and qualified engineering approval should use full code-compliant methods, manufacturer data, and test validation beyond the indicative checks shown in PhyCalcPro.

**Assumptions & limitations**

- Rigid body rotation; no torsional compliance or backlash dynamics.
- Constant torque during transient unless torque profile specified.
- No gyroscopic effects on supported shafts.
- Motor thermal limits not evaluated.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 15.
2. Norton, R. L. *Design of Machinery*, 6th ed.
3. Rao, S. S. *Mechanical Vibrations*, 6th ed.
4. IEC 60034-12. *Rotating electrical machines* (motor sizing context).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
