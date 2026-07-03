### Compression Springs (`compression-springs`)

**Purpose**

Design helical compression springs per EN 13906-1 and Shigley methods: spring rate, solid height, shear stress, buckling screen, surge frequency, and optional EN 13906 fatigue screening. Supports ASTM spring wire grades, EN 10270 wire catalog picker, and Auto-design wire/coil sweeps.

**Physics & theory**

A helical compression spring wound from wire diameter \( d \) on mean coil diameter \( D \) with \( n \) active coils behaves as a linear spring with rate \( k = Gd^4/(8D^3n) \), where \( G \) is shear modulus. Wahl factor \( K_w = (4C-1)/(4C-4) + 0.615/C \) with spring index \( C = D/d \) corrects for curvature and direct shear in maximum wire shear stress \( \tau = K_w \cdot 8FD/(\pi d^3) \).

EN 13906-1 allowable shear for cold-coiled springs is \( \tau_{\mathrm{zul}} = 0.56 R_m \), where \( R_m \) follows size-effect fit \( R_m = A/d^m \) for standard wire grades. Buckling when free length \( L_0 \) exceeds \( 2.63D/\nu \) with end condition coefficient \( \nu \).

Optional fatigue screening uses characteristic shear fatigue strength \( \tau_{k0} \) with life-class reduction and Goodman mean-stress correction when minimum deflection is specified (life classes VL/LH/MH/HH).

**Governing equations**

\[
k = \frac{G d^4}{8 D^3 n}
\]

\[
\tau = K_w \frac{8 F D}{\pi d^3} \leq 0.56 R_m
\]

\[
f_{\mathrm{surge}} = \frac{1}{2}\sqrt{\frac{k}{m_{\mathrm{active}}}}
\]

\[
\frac{L_0}{D} \leq \frac{2.63}{\nu} \quad \text{(buckling screen)}
\]

**Numerical method**

Closed-form EN 13906-1 / Shigley equations. Wire ultimate from Shigley Table 10-4 fits or `springWireCatalog.ts` (EN 10270 / ASTM stock). Active coil mass computed for surge frequency. Fatigue via `en13906Fatigue.ts` when enabled.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `wireDiameter`, `meanDiameter` | \( d \), \( D \) |
| `activeCoils` | Active turn count |
| `modulus` \( G \) | Shear modulus |
| `deflection`, `freeLength` | Operating deflection and \( L_0 \) |
| `wireType` | ASTM wire grade or custom \( R_m \) |
| Wire stock picker | Optional catalog designation → auto-fill \( d \), \( G \), \( R_m \) |
| `endCondition` | Buckling end condition (ν coefficient) |
| `operatingFrequencyHz` | Forcing frequency for surge margin (target 10×) |
| Fatigue panel | Life class, wire quality 1–3, minimum deflection |

**Outputs**

- Spring rate, solid height, loaded length, solid height clearance, max load, shear stress, static SF
- Surge frequency and margin, buckling limit, spring index, Wahl factor
- Optional fatigue SF and utilization; governing failure mode
- Load–deflection and stress plots; spring outline preview

**Design codes & checks**

- **Indicative:** Shear stress utilization, solid height, surge margin, fatigue life (when enabled)
- **EU:** EN 13906-1 cold-coiled helical compression springs
- **US:** SAE AMS spring wire specifications (reference)

**Design workflow**

- **Validate:** Forward check on entered geometry.
- **Auto-design:** Sweeps `springWireCatalog` wire diameters and active coils within max OD for target rate and stress.
- **Compare:** Ranked wire/coil alternatives with Apply.

**Assumptions & limitations**

- Circular wire, closed and ground ends (solid height includes 2d end allowance).
- Fatigue uses simplified τk0 + Goodman screening — verify critical designs against EN 13906 nomographs.
- Surge margin requires operating frequency input; default 10× margin target.
- Not for extension or torsion springs (see dedicated modules).

**Verification**

- CI: `compression-springs-indicative-01.json`, `compression-springs-indicative-fatigue-01.json`
- Vitest: `src/lib/springs/compression-springs/engine.test.ts`, `en13906Fatigue.test.ts`
- Engineer sign-off: [spring-modules-user-tasks.md](./spring-modules-user-tasks.md), [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. EN 13906-1:2013. *Cylindrical helical springs — Part 1: Compression springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed. McGraw-Hill.
4. ASTM A228/A227/A229. *Steel Wire for Mechanical Springs*.
