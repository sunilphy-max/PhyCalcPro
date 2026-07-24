---
seoTitle: "Extension Spring Calculator – Initial Tension, Hook Stress & Fatigue Analysis"
seoDescription: "Design helical extension springs with initial tension, hook stress concentration, body shear stress, Wahl factor, and EN 13906-2 fatigue screening using PhyCalcPro."
guideHeadline: "Helical Extension Spring Design — Initial Tension, Hook Stress & Fatigue Guide"
keywords: ["extension spring calculator", "initial tension", "hook stress", "spring rate", "Wahl factor", "extension spring design", "EN 13906-2", "spring fatigue"]
---

### Extension Spring Design Guide (`extension-springs`)

## How engineers design extension springs

Extension (tension) springs pull rather than push. They are wound with coils touching, creating a built-in initial tension \( F_i \) that must be overcome before the coils begin to separate and the spring starts to deflect. This makes extension springs uniquely suited for applications requiring a preloaded pull force — door closers, trampolines, garage door counterbalances, and toggle mechanisms.

The critical design challenge unique to extension springs is the hook. Unlike compression springs where load is applied through flat end surfaces, extension springs transfer load through hooks or loops at each end. These hooks concentrate stress — often the hook is the weakest link, not the coil body. A successful design must check both body stress and hook stress and ensure the hook safety factor is acceptable.

## Types and configurations

| Hook type | Stress multiplier | Best for |
|---|---|---|
| Machine hook (full loop) | 1.0–1.3 | General purpose, moderate loads |
| Cross-over hook | 1.1–1.5 | Reduced hook stress, better fatigue |
| Extended hook (long shank) | 1.0–1.2 | Custom attachment geometry |
| Threaded insert | 1.0 | High-load applications, hook elimination |

The machine hook (full loop over center) is the most common and least expensive. Cross-over hooks reduce the bending stress at the hook-body junction and are preferred for fatigue applications.

## Engineering workflow

1. **Define requirements** — Target spring rate \( k \), initial tension \( F_i \), maximum extension \( x_{\mathrm{max}} \), and available space.
2. **Select wire material** — Same wire grades as compression springs (A228, A231, A313). Wire strength follows the size-dependent fit \( R_m = A/d^m \).
3. **Choose wire and coil geometry** — Spring index \( C = D/d \) between 4 and 12. Rate formula identical to compression springs: \( k = Gd^4/(8D^3 n) \).
4. **Set initial tension** — Typically 10–33 % of the maximum operating force. Must be within the manufacturable range (function of spring index and wire stress).
5. **Check body shear stress** — Wahl-corrected stress at maximum extension.
6. **Check hook stress** — Apply hook stress factor \( K_{\mathrm{hook}} \) to body stress. Hook stress often governs the design.
7. **Fatigue screening** — If cyclic, check the body stress range against EN 13906-2 fatigue limits.

## Key quantities and formulas

**Force-deflection relationship**

\[
F = F_i + k\,x, \quad k = \frac{G\,d^4}{8\,D^3\,n}
\]

The initial tension \( F_i \) offsets the force-deflection line. At zero extension, the spring exerts \( F_i \); this is the key difference from a compression spring.

**Body shear stress with Wahl factor**

\[
\tau_{\mathrm{body}} = K_w \frac{8\,F_{\mathrm{max}}\,D}{\pi\,d^3}
\]

\[
K_w = \frac{4C - 1}{4C - 4} + \frac{0.615}{C}
\]

**Hook stress**

\[
\tau_{\mathrm{hook}} = K_{\mathrm{hook}} \cdot \tau_{\mathrm{body}}
\]

where \( K_{\mathrm{hook}} \) is an empirical multiplier (1.0–1.5 depending on hook type and bend radius).

**Overall safety factor**

\[
SF = \min\!\left(\frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{body}}},\; \frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{hook}}}\right)
\]

## Worked example

**Problem:** Design an extension spring with rate 5 N/mm, initial tension 20 N, maximum extension 30 mm, maximum OD 18 mm. Material: music wire (A228), \( G = 81\,500 \) MPa.

1. Maximum force: \( F_{\mathrm{max}} = 20 + 5 \times 30 = 170 \) N.
2. Try \( d = 2.0 \) mm, \( D = 14 \) mm (OD = 16 mm, within limit). Spring index: \( C = 14/2 = 7.0 \).
3. Active coils: \( n = 81\,500 \times 16 / (8 \times 2744 \times 5) = 1\,304\,000/109\,760 = 11.9 \). Use \( n = 12 \).
4. Actual rate: \( k = 81\,500 \times 16 / (8 \times 2744 \times 12) = 4.96 \) N/mm.
5. Wahl factor: \( K_w = (28-1)/(28-4) + 0.615/7 = 1.125 + 0.088 = 1.213 \).
6. Body shear stress: \( \tau_{\mathrm{body}} = 1.213 \times 8 \times 170 \times 14 / (\pi \times 8) = 1.213 \times 19\,040/25.13 = 919 \) MPa.
7. Wire strength (\( d = 2 \) mm, A228): \( R_m \approx 2020 \) MPa. Allowable (static): \( 0.56 \times 2020 = 1131 \) MPa.
8. Body utilization: \( 919/1131 = 81\% \).
9. Hook stress (machine hook, \( K_{\mathrm{hook}} = 1.25 \)): \( \tau_{\mathrm{hook}} = 1.25 \times 919 = 1149 \) MPa.
10. Hook utilization: \( 1149/1131 = 102\% \) — marginally over. Consider a cross-over hook (\( K_{\mathrm{hook}} = 1.1 \)) or increase wire diameter to 2.2 mm.

## Common mistakes and checks

- **Ignoring initial tension limits** — Initial tension cannot be arbitrarily large; it is limited by the residual stress from coiling. Specifying \( F_i \) beyond the manufacturable limit results in a spring that relaxes to a lower value in service.
- **Neglecting hook stress** — The hook typically sees 10–50 % higher stress than the coil body. Designs that pass body stress checks may fail at the hook.
- **No fatigue check on hooks** — Hook bending fatigue is the dominant failure mode in cyclic extension springs. EN 13906-2 provides screening limits.
- **Excessive extension** — Over-extending an extension spring can cause permanent set. Maximum extension should leave at least 25 % margin below the stress at which set begins.
- **Mixing up total coils and active coils** — For extension springs, all body coils are active (no inactive end coils as in compression springs). The total body coil count equals the active coil count.

## FAQ

### What determines the initial tension?
Initial tension is the force built into the spring during coiling by winding the wire with a specific pre-stress. Its magnitude depends on the spring index and wire stress during forming. Typical values range from 10 % to 33 % of the maximum operating force. PhyCalcPro flags values outside the manufacturable estimate.

### How do I reduce hook stress?
Use a cross-over hook instead of a machine hook to reduce the bending stress at the hook-body junction. Alternatively, increase the hook bend radius, use a larger wire diameter, or replace the hook with a threaded insert for critical applications.

### Can extension springs be used in fatigue applications?
Yes, but fatigue life is limited by hook stress concentration. For high-cycle applications (above \( 10^5 \) cycles), use cross-over hooks or extended hooks, choose high-quality wire (quality grade 1 per EN 10270), and verify with EN 13906-2 fatigue screening.

### What is the difference between body length and free length?
Body length is the coil stack (number of coils times wire diameter). Free length includes the body plus both hooks. PhyCalcPro reports both and computes the extended length at maximum operating load.

### Does the auto-design feature handle extension springs?
Yes. The auto-design sweeps wire diameters and coil counts from the spring wire catalog to find combinations that satisfy the target rate and maximum force while maintaining acceptable body and hook safety factors.

## Use the PhyCalcPro calculator

Design helical extension springs with hook stress and fatigue checks in the [Extension Spring Calculator](/products/springs/extension-springs).

---

**Purpose**

Design helical extension (tension) springs including initial tension, hook stress, spring rate, EN 13906 fatigue screening, and wire catalog selection. Used for assemblies requiring pull force with near-zero free length.

**Physics & theory**

Extension springs are wound with initial coiled tension \( F_i \) that must be overcome before coils separate. Total force at extension \( x \) is \( F = F_i + kx \), with rate \( k = Gd^4/(8D^3 n) \) identical to compression spring formula.

Maximum shear stress in the body uses Wahl correction on the coil body load. Hook stress concentrations often govern failure; standard hooks (machine, cross-over, extended) use empirical stress factors \( K_{\mathrm{hook}} \). Initial tension is user-specified or estimated from the manufacturable limit (Shigley screening).

**Governing equations**

\[
F = F_i + k\,x, \quad k = \frac{G\,d^4}{8\,D^3\,n}
\]

\[
\tau_{\mathrm{body}} = K_w \frac{8\,(F_i + k\,x_{\mathrm{max}})\,D}{\pi\,d^3}, \quad
\tau_{\mathrm{hook}} = K_{\mathrm{hook}} \cdot \tau_{\mathrm{body}}
\]

\[
SF = \min\!\left(\frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{body}}},\; \frac{\tau_{\mathrm{allow}}}{\tau_{\mathrm{hook}}}\right)
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
- Load-extension plot (\( F = F_i + kx \))

**Design codes & checks**

- **Indicative:** Body shear utilization, hook stress SF, surge margin, fatigue life (when enabled)
- **EU:** EN 13906-2 extension springs (reference)

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
3. Wahl, A. M. *Mechanical Springs*, 2nd ed., McGraw-Hill.
4. Associated Spring Raymond. *Design Handbook*.
5. Spring Manufacturers Institute. *Handbook of Spring Design*.
