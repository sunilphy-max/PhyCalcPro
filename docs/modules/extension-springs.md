### Extension Springs (`extension-springs`)

**Purpose**

Design helical extension (tension) springs including initial tension, spring rate, stress at full extension, and loop/end fitting considerations. Used for assemblies requiring pull force with near-zero free length.

**Physics & theory**

Extension springs are wound with initial coiled tension \( F_i \) that must be overcome before coils separate. Total force at extension \( x \) is \( F = F_i + kx \), with rate \( k = Gd^4/(8D^3n) \) identical to compression spring formula but stress includes additional bending at hook transitions.

Maximum shear stress in the body uses Wahl correction on the coil body load. Hook stress concentrations often govern failure; standard hooks (machine, cross-over, extended) have empirical stress factors. Initial tension is set during coiling and limited by material and index.

Spring wire strength exhibits a size effect: smaller diameter wire achieves higher ultimate tensile strength per ASTM spring wire specifications. The module applies Shigley Table 10-4 fits (Sut = A/d^m) for standard wire grades when selected instead of custom ultimate strength.

Surge frequency must remain well above the forcing frequency to avoid coil resonance and fatigue failure. Buckling of compression springs occurs when the free length exceeds a critical slenderness ratio dependent on end condition — EN 13906-1 provides the screening limit used here.

**Governing equations**

\[
F = F_i + k x, \quad k = \frac{G d^4}{8 D^3 n}
\]

\[
\tau_{\mathrm{body}} = K_w \frac{8 (F_i + k x_{\max}) D}{\pi d^3}
\]

\[
SF = \frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{body}}}
\]

**Numerical method**

Closed-form rate and body stress with Wahl factor. Initial tension user-specified or estimated from manufacturing range. Hook stress screening via empirical factors when hook type selected.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Wire and coil geometry | \( d \), \( D \), \( n \) |
| `initialTension` | Coiled-in preload \( F_i \) |
| Extension at load | Operating stroke |
| Material \( G \), allowable \( \tau \) | Spring wire properties |
| Hook type | End configuration |

**Outputs**

- Spring rate, force at full extension, body shear stress, safety factor, solid length estimate.

**Design codes & checks**

- **Indicative:** Body shear stress utilization
- **EU:** EN 13906-2 extension springs (reference)


**Assumptions & limitations**

- Body stress only unless hook factors applied.
- Initial tension within manufacturable range not auto-validated.
- No fatigue life per EN 13906-2 class without extended inputs.
- Assumes uniform coil spacing at full extension.

**References**

1. EN 13906-2:2013. *Cylindrical helical springs — Part 2: Extension springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed.
4. Associated Spring Raymond. *Design Handbook*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
