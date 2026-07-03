### Torsion Springs (`torsion-springs`)

**Purpose**

Design helical torsion springs loaded by bending in the coil wire (typically via legs). Computes spring rate, curvature-corrected coil bending stress, leg stress estimate, EN 13906 fatigue screening, and wire catalog selection.

**Physics & theory**

Torsion springs store energy through wire bending rather than torsion shear along the coil axis. Spring rate in terms of angle \( \theta \) is:

\[
k = \frac{E d^4}{64 D n_a}
\]

(Shigley Eq. 10-37), for \( n_a \) active coils. Bending stress uses curvature factor \( K_b \) on the mean-diameter stress:

\[
\sigma = K_b \frac{32 M}{\pi d^3}
\]

Legs act as cantilever beams; leg bending stress is estimated separately. Allowable bending stress screening uses \( \sigma_{\mathrm{zul}} = 0.8 R_m \).

**Governing equations**

\[
k = \frac{E d^4}{64 D n_a}, \quad M = k \theta
\]

\[
\sigma_{\mathrm{coil}} = K_b \frac{32 M}{\pi d^3}
\]

\[
K_b = \frac{4C^2 - C - 1}{4C(C-1)}, \quad C = D/d
\]

**Numerical method**

Closed-form bending-based rate and stress with Shigley curvature factor. Optional EN 13906 bending fatigue when minimum wind angle is specified. Auto-design sweeps wire diameter, coil count, and leg length for target rate and bending SF.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `wireDiameter`, `meanDiameter` | Coil geometry |
| `activeCoils` | Active coil count |
| `legLength` | Leg geometry |
| `deflectionAngleDeg` | Operating wind angle |
| `wireType` / wire stock picker | Grade or catalog designation |
| Fatigue panel | Life class, wire quality, minimum angle (deg) |

**Outputs**

- Spring rate (N·m/rad), torque at angle, coil bending stress with \( K_b \)
- Leg force and leg bending stress estimate, static SF
- Optional fatigue SF; spring index, governing failure mode
- Torque–angle and stress–angle plots

**Design codes & checks**

- **Indicative:** Coil bending stress utilization, fatigue life (when enabled)
- **EU:** EN 13906-3 torsion springs (reference)

**Design workflow**

- **Validate:** Forward check on entered geometry and angle.
- **Auto-design:** Wire/coil/leg sweep for target rate (N·m/rad) and bending SF.
- **Handoff:** Fatigue module receives coil bending stress.

**Assumptions & limitations**

- Circular wire; rectangular wire requires different section modulus.
- Leg stress uses simplified cantilever model; coil–leg junction not FEA’d.
- Rate formula updated to Shigley Eq. 10-37 (re-baseline saved projects from older builds).
- Fatigue simplified per EN 13906-3 screening.

**Verification**

- CI: `torsion-springs-indicative-01.json`
- Vitest: `src/lib/springs/torsion-springs/engine.test.ts`
- Engineer sign-off: [spring-modules-user-tasks.md](./spring-modules-user-tasks.md)

**References**

1. EN 13906-3:2013. *Cylindrical helical springs — Part 3: Torsion springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed.
4. Spring Manufacturers Institute. *Handbook of Spring Design*.
