### Vibration Analysis (`vibrations`)

**Purpose**

Compute natural frequencies and mode shapes of beam-like structures using Euler–Bernoulli FEM with optional damping. Evaluates separation margin between operating excitation frequency and resonances per ISO 10816 context.

**Physics & theory**

Free vibration of elastic structures satisfies \( \mathbf{M}\ddot{\mathbf{u}} + \mathbf{K}\mathbf{u} = 0 \), yielding eigenvalue problem \( (\mathbf{K} - \omega^2 \mathbf{M})\mathbf{v} = 0 \). Natural frequencies \( f_n = \omega_n/(2\pi) \) depend on stiffness distribution, mass, and boundary conditions.

Damped natural frequency \( f_d = f_n \sqrt{1 - \zeta^2} \) for damping ratio \( \zeta \). Resonance occurs when excitation frequency matches \( f_n \); separation margin \( SM = |f_{\mathrm{excitation}} - f_n|/f_n \) should exceed code guidance (often 10–20% for machinery).

Dynamic analysis requires careful identification of mass, stiffness, and damping distribution. Natural frequencies depend on boundary conditions — a cantilever beam has fundamentally different modes than a simply supported beam of the same dimensions.

Damping limits resonant amplification; lightly damped structures (( zeta < 0.05 )) can see transmissibility peaks exceeding 10 near resonance. Separation margin between operating excitation and natural frequency should typically exceed 15–20% for rotating machinery.

**Governing equations**

\[
(\mathbf{K} - \omega^2 \mathbf{M}) \mathbf{v} = 0
\]

\[
f_n = \frac{\omega_n}{2\pi}, \quad f_d = f_n \sqrt{1 - \zeta^2}
\]

\[
SM = \frac{|f_{\mathrm{exc}} - f_n|}{f_n}
\]

**Numerical method**

Euler–Bernoulli beam FEM (`euler-bernoulli-fem` solver): mesh up to 240 segments. Mass matrix from material density and cross-section. Eigenvalue extraction for first N modes; mode shapes normalized. Physics checks verify positive, monotonic frequencies.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length`, `E`, `I`, `A`, `rho` | Beam properties |
| `support` | Boundary condition |
| `segments` | Mesh count (2–240) |
| `dampingRatio` \( \zeta \) | Optional Rayleigh damping |
| Excitation frequency | For separation margin |

**Outputs**

- Natural frequencies (undamped and damped), mode shapes, separation margin, resonance notes, solver warnings.

**Design codes & checks**

- **Indicative:** Natural frequency, excitation separation margin
- **ISO:** ISO 10816 mechanical vibration severity (context)


**Assumptions & limitations**

- 1D beam model; no plate/shell or 3D solid modes.
- Linear modal analysis; no geometric stiffness or spin softening.
- Damping is uniform modal fraction — not frequency-dependent material damping.
- Low segment count (< 8) reduces accuracy warning issued.

**References**

1. Rao, S. S. *Mechanical Vibrations*, 6th ed. Pearson.
2. Inman, D. J. *Engineering Vibration*, 5th ed. Pearson.
3. ISO 10816-1:1995. *Mechanical vibration — Evaluation of machine vibration*.
4. Timoshenko, S. P. *Vibration Problems in Engineering*, 5th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
