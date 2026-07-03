### Extension Springs (`extension-springs`)

**Purpose**

Design helical extension (tension) springs including initial tension, hook stress, spring rate, EN 13906 fatigue screening, and wire catalog selection. Used for assemblies requiring pull force with near-zero free length.

**Physics & theory**

Extension springs are wound with initial coiled tension \( F_i \) that must be overcome before coils separate. Total force at extension \( x \) is \( F = F_i + kx \), with rate \( k = Gd^4/(8D^3n) \) identical to compression spring formula.

Maximum shear stress in the body uses Wahl correction on the coil body load. Hook stress concentrations often govern failure; standard hooks (machine, cross-over, extended) use empirical stress factors \( K_{\mathrm{hook}} \). Initial tension is user-specified or estimated from the manufacturable limit (Shigley screening).

**Governing equations**

\[
F = F_i + k x, \quad k = \frac{G d^4}{8 D^3 n}
\]

\[
\tau_{\mathrm{body}} = K_w \frac{8 (F_i + k x_{\max}) D}{\pi d^3}, \quad
\tau_{\mathrm{hook}} = K_{\mathrm{hook}} \cdot \tau_{\mathrm{body}}
\]

\[
SF = \min\left(\frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{body}}}, \frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{hook}}}\right)
\]

**Numerical method**

Closed-form rate and body stress with Wahl factor. Hook factors from `wireStrength.ts`. Fatigue on body stress range when minimum extension is set. Auto-design sweeps catalog wire sizes and coil counts for target rate, hook SF, and optional fatigue margin.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Wire and coil geometry | \( d \), \( D \), \( n \) |
| `initialTension` | Coiled-in preload \( F_i \) |
| `hookType` | Machine, cross-over, extended, or body-only |
| Extension at load | Operating stroke |
| `wireType` / wire stock picker | Grade or catalog designation |
| `operatingFrequencyHz` | Surge margin (optional) |
| Fatigue panel | Life class, wire quality, minimum extension |

**Outputs**

- Spring rate, initial tension, max manufacturable \( F_i \), force at extension
- Body and hook shear stress and separate safety factors
- Coil bind length, extended length, surge frequency
- Optional fatigue SF; governing failure mode
- Load–extension plot (F = Fi + kx)

**Design codes & checks**

- **Indicative:** Body shear utilization, hook stress SF, surge margin, fatigue life (when enabled)
- **EU:** EN 13906-2 extension springs (reference)

**Design workflow**

- **Validate:** Forward check with hook type and Fi validation flag.
- **Auto-design:** Wire/coil sweep from `springWireCatalog` for target rate, max force, hook SF.
- **Handoff:** Fatigue module receives body shear as alternating stress input.

**Assumptions & limitations**

- Hook stress uses empirical factors — not a substitute for hook FEA on critical applications.
- Initial tension validated against manufacturable estimate; not auto-sized.
- Fatigue simplified per EN 13906-2 screening; full hook fatigue nomograph not embedded.

**Verification**

- CI: `extension-springs-indicative-01.json`
- Vitest: `src/lib/springs/extension-springs/engine.test.ts`
- Engineer sign-off: [spring-modules-user-tasks.md](./spring-modules-user-tasks.md)

**References**

1. EN 13906-2:2013. *Cylindrical helical springs — Part 2: Extension springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed.
4. Associated Spring Raymond. *Design Handbook*.
