### Torsion Springs (`torsion-springs`)

**Purpose**

Design helical torsion springs loaded by bending in the coil wire (typically via legs). Computes spring rate from leg geometry, bending stress in coils and legs, and angular deflection capacity.

**Physics & theory**

Torsion springs store energy through wire bending rather than torsion shear along the coil axis. Spring rate in terms of angle \( \theta \) is \( k = \frac{Ed^4}{64 D n_a} \) for \( n_a \) active coils (formulas vary with end-leg configuration). Bending stress in the coil is \( \sigma = \frac{32M}{\pi d^3} \) with moment from leg force and radius.

Legs act as cantilever beams adding deflection and stress concentration at the coil–leg junction. Inside vs outside coil stress differs due to curvature — mean-diameter stress is commonly used for screening.

Spring wire strength exhibits a size effect: smaller diameter wire achieves higher ultimate tensile strength per ASTM spring wire specifications. The module applies Shigley Table 10-4 fits (Sut = A/d^m) for standard wire grades when selected instead of custom ultimate strength.

Surge frequency must remain well above the forcing frequency to avoid coil resonance and fatigue failure. Buckling of compression springs occurs when the free length exceeds a critical slenderness ratio dependent on end condition — EN 13906-1 provides the screening limit used here.

**Governing equations**

\[
k = \frac{E d^4}{64 D n_a}
\]

\[
\sigma_{\mathrm{coil}} = \frac{32 M}{\pi d^3}, \quad M = F \cdot r_{\mathrm{leg}}
\]

\[
\theta = \frac{M_{\mathrm{total}}}{k}
\]

**Numerical method**

Closed-form bending-based rate and stress. Leg contribution added to total angular deflection. Safety factor vs material allowable bending stress at full wind angle.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `wireDiameter`, `meanDiameter` | Coil geometry |
| `activeCoils` | Active coil count |
| Leg length, force point | Leg geometry |
| `deflectionAngle` | Operating wind angle |
| Material \( E \), allowable \( \sigma \) | Spring material |

**Outputs**

- Spring rate (torque/angle), coil bending stress, leg stress estimate, safety factor, max wind angle margin.

**Design codes & checks**

- **Indicative:** Bending stress utilization
- **EU:** EN 13906-3 torsion springs (reference)


**Assumptions & limitations**

- Circular wire; rectangular wire requires different section modulus.
- Leg stress uses simplified cantilever model.
- No fatigue rating without cycle count and EN class.
- Assumes legs in same plane as coil body (flat torsion spring variant simplified).

**References**

1. EN 13906-3:2013. *Cylindrical helical springs — Part 3: Torsion springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed.
4. Spring Manufacturers Institute. *Handbook of Spring Design*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
