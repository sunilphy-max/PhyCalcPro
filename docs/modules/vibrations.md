---
seoTitle: "Vibration Analysis Calculator – Natural Frequencies, Mode Shapes & Resonance"
seoDescription: "Compute natural frequencies and mode shapes of beam structures using Euler-Bernoulli FEM with damping and excitation separation margin per ISO 10816."
guideHeadline: "Engineering guide to vibration analysis and resonance avoidance"
keywords:
  - vibration calculator
  - natural frequency analysis
  - mode shape computation
  - resonance avoidance
  - Euler Bernoulli FEM
  - damping ratio analysis
  - ISO 10816 vibration
---

### Vibration Analysis (`vibrations`)

## How engineers avoid resonance in structures

Every structure has natural frequencies at which it vibrates with amplified response. When an operating excitation (motor speed, blade passing frequency, or reciprocating force) coincides with a natural frequency, resonance occurs — amplitudes can increase 10-50x, causing fatigue failure or excessive noise. Vibration analysis identifies these critical frequencies and mode shapes so engineers can design adequate separation margins.

## Analysis types and configurations

| Model | DOF | Application |
|-------|-----|-------------|
| Single DOF spring-mass | 1 | Equipment isolation, foundation |
| Euler-Bernoulli beam | Multi | Shaft, beam, pipe vibration |
| Timoshenko beam | Multi | Short, thick beams |
| Plate/shell modal | 2D/3D | Panel buzz, tank modes |

The module uses Euler-Bernoulli beam FEM for multi-mode analysis with optional damping.

## Engineering workflow

1. Define the beam geometry: length, cross-section properties (\( E, I, A, \rho \)).
2. Select boundary conditions (fixed-free, pinned-pinned, fixed-fixed, etc.).
3. Choose mesh density (more segments = higher accuracy for upper modes).
4. Run eigenvalue extraction for the first N natural frequencies and mode shapes.
5. Compare each natural frequency to excitation frequencies.
6. Calculate separation margin: \( SM = |f_{\text{exc}} - f_n| / f_n \).
7. If any margin is below 15–20%, redesign (add stiffness, change mass, or shift excitation frequency).

## Key quantities and formulas

Eigenvalue problem:

\[
(\mathbf{K} - \omega^2 \mathbf{M})\,\mathbf{v} = 0
\]

Natural and damped frequency:

\[
f_n = \frac{\omega_n}{2\pi}, \quad f_d = f_n\sqrt{1 - \zeta^2}
\]

Separation margin:

\[
SM = \frac{|f_{\text{exc}} - f_n|}{f_n}
\]

Transmissibility at resonance:

\[
TR_{\text{peak}} \approx \frac{1}{2\zeta}
\]

## Worked example

A simply supported steel beam, 2 m long, 100 x 50 mm rectangular section, must avoid resonance with a 25 Hz motor.

- \( I = 50 \times 100^3/12 = 4.167 \times 10^6 \) mm\(^4\), \( A = 5000 \) mm\(^2\), \( \rho = 7850 \) kg/m\(^3\), \( E = 200 \) GPa.
- First mode (pinned-pinned): \( f_1 = (\pi/L^2)\sqrt{EI/(\rho A)} = (\pi/4)\sqrt{200 \times 10^9 \times 4.167 \times 10^{-6}/(7850 \times 5 \times 10^{-3})} = 52.2 \) Hz.
- Separation margin: \( |25 - 52.2|/52.2 = 52\% \) — well above 20%, no resonance risk with the first mode.
- Check higher modes and subharmonics as appropriate.

## Common mistakes and checks

- **Checking only the first mode:** higher modes can coincide with harmonics of the excitation frequency.
- **Ignoring added mass:** instrumentation, flanges, or fluid inside pipes shifts natural frequencies downward.
- **Using too few mesh segments:** under-resolved FEM misses higher-order modes and overestimates lower frequencies.
- **Confusing damped and undamped frequencies:** for lightly damped systems (\( \zeta < 0.1 \)), the difference is small but still matters for margin calculations.

## FAQ

### What separation margin is considered safe?

ISO 10816 and general machinery practice require 15–20% margin between any operating excitation and a natural frequency.

### How does damping affect resonance severity?

Damping limits peak amplitude at resonance. The transmissibility peak is approximately \( 1/(2\zeta) \) — a system with \( \zeta = 0.02 \) amplifies by 25x at resonance.

### Can I use this module for rotating shafts?

Yes, for lateral vibration modes. However, gyroscopic effects on high-speed rotors require additional terms not included in the Euler-Bernoulli model.

### What boundary conditions should I use?

Match the physical support: cantilever for fixed-free, pinned-pinned for simply supported. Fixed-fixed is common for welded-in beams.

### How many mesh segments are needed for accurate results?

At least 8 segments for the first 2–3 modes. For modes above the 5th, use 30+ segments. The solver warns if mesh density is too low.

## Use the PhyCalcPro calculator

Open the [Vibration Analysis calculator](/products/dynamics/vibrations) to enter beam properties, boundary conditions, mesh density, damping ratio, and excitation frequency. The tool returns natural frequencies, mode shapes, damped frequencies, separation margins, and resonance warnings.

---

**Purpose**

Compute natural frequencies and mode shapes of beam-like structures using Euler-Bernoulli FEM with optional damping. Evaluates separation margin between operating excitation and resonances.

**Physics & theory**

Free vibration of elastic structures satisfies \( \mathbf{M}\ddot{\mathbf{u}} + \mathbf{K}\mathbf{u} = 0 \), yielding eigenvalue problem \( (\mathbf{K} - \omega^2 \mathbf{M})\mathbf{v} = 0 \). Natural frequencies depend on stiffness, mass, and boundary conditions. Damped natural frequency \( f_d = f_n\sqrt{1 - \zeta^2} \). Separation margin \( SM = |f_{\text{exc}} - f_n|/f_n \) should exceed 15–20%.

**Governing equations**

\[
(\mathbf{K} - \omega^2 \mathbf{M})\,\mathbf{v} = 0
\]

\[
f_n = \frac{\omega_n}{2\pi}, \quad f_d = f_n\sqrt{1 - \zeta^2}
\]

\[
SM = \frac{|f_{\text{exc}} - f_n|}{f_n}
\]

**Numerical method**

Euler-Bernoulli beam FEM: mesh up to 240 segments. Mass matrix from material density and cross-section. Eigenvalue extraction for first N modes; mode shapes normalized.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length`, `E`, `I`, `A`, `rho` | Beam properties |
| `support` | Boundary condition |
| `segments` | Mesh count (2–240) |
| `dampingRatio` \( \zeta \) | Optional damping |
| Excitation frequency | For separation margin |

**Outputs**

- Natural frequencies (undamped and damped), mode shapes, separation margin, resonance notes, solver warnings.

**Design codes & checks**

- **Indicative:** Natural frequency, excitation separation margin
- **ISO:** ISO 10816 mechanical vibration severity (context)

**Assumptions & limitations**

- 1D beam model; no plate/shell or 3D solid modes.
- Linear modal analysis; no geometric stiffness or spin softening.
- Damping is uniform modal fraction — not frequency-dependent.
- Low segment count (< 8) reduces accuracy; warning issued.

**References**

1. Rao, S. S. *Mechanical Vibrations*, 6th ed. Pearson.
2. Inman, D. J. *Engineering Vibration*, 5th ed. Pearson.
3. ISO 10816-1:1995. *Mechanical vibration — Evaluation of machine vibration*.
4. Timoshenko, S. P. *Vibration Problems in Engineering*, 5th ed.
