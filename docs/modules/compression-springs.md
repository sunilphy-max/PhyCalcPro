### Compression Springs (`compression-springs`)

**Purpose**

Design helical compression springs per EN 13906-1 and Shigley methods: spring rate, solid height, shear stress, buckling screen, and surge frequency. Supports ASTM spring wire grades with size-effect ultimate strength.

**Physics & theory**

A helical compression spring wound from wire diameter \( d \) on mean coil diameter \( D \) with \( n \) active coils behaves as a linear spring with rate \( k = Gd^4/(8D^3n) \), where \( G \) is shear modulus. Wahl factor \( K_w = (4C-1)/(4C-4) + 0.615/C \) with spring index \( C = D/d \) corrects for curvature and direct shear in maximum wire shear stress \( \tau = K_w \cdot 8FD/(\pi d^3) \).

EN 13906-1 allowable shear for cold-coiled springs is \( \tau_{\mathrm{zul}} = 0.56 R_m \), where \( R_m \) follows size-effect fit \( R_m = A/d^m \) for standard wire grades. Buckling when free length \( L_0 \) exceeds \( 2.63D/\nu \) with end condition coefficient \( \nu \).

Spring wire strength exhibits a size effect: smaller diameter wire achieves higher ultimate tensile strength per ASTM spring wire specifications. The module applies Shigley Table 10-4 fits (Sut = A/d^m) for standard wire grades when selected instead of custom ultimate strength.

Surge frequency must remain well above the forcing frequency to avoid coil resonance and fatigue failure. Buckling of compression springs occurs when the free length exceeds a critical slenderness ratio dependent on end condition — EN 13906-1 provides the screening limit used here.

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

Closed-form EN 13906-1 / Shigley equations. Wire ultimate from Shigley Table 10-4 fits (music, hard-drawn, oil-tempered, chrome-vanadium, chrome-silicon). Active coil mass computed for surge frequency. Buckling flag for slenderness \( L_0/D \).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `wireDiameter`, `meanDiameter` | \( d \), \( D \) |
| `activeCoils` | Active turn count |
| `modulus` \( G \) | Shear modulus |
| `deflection`, `freeLength` | Operating deflection and \( L_0 \) |
| `wireType` | ASTM wire grade or custom \( R_m \) |

**Outputs**

- Spring rate, solid height, max load, shear stress, allowable stress, safety factor, surge frequency, buckling risk
- Wahl factor.

**Design codes & checks**

- **Indicative:** Shigley Ch. 10 screening
- **EU:** EN 13906-1 cold-coiled helical compression springs
- **US:** SAE AMS spring wire specifications (reference)


**Assumptions & limitations**

- Circular wire, closed and ground ends (solid height includes 2d end allowance).
- Static or moderate-cycle loading; fatigue not fully per EN 13906 fatigue classes.
- Surge frequency assumes fixed-fixed end mass model.
- Not for extension or torsion springs (see dedicated modules).

**References**

1. EN 13906-1:2013. *Cylindrical helical springs — Part 1: Compression springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed. McGraw-Hill.
4. ASTM A228/A227/A229. *Steel Wire for Mechanical Springs*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
