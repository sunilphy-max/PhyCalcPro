---
seoTitle: "Compression Spring Calculator – Spring Rate, Wahl Factor & EN 13906 Fatigue"
seoDescription: "Design helical compression springs with spring rate, Wahl stress correction, buckling screening, surge frequency, and EN 13906-1 fatigue life analysis using PhyCalcPro."
guideHeadline: "Helical Compression Spring Design — Rate, Stress & Fatigue Guide"
keywords: ["compression spring calculator", "spring rate", "Wahl factor", "spring design", "EN 13906", "spring fatigue", "helical spring", "buckling"]
---

### Compression Spring Design Guide (`compression-springs`)

## How engineers design compression springs

Helical compression springs are the most common type of mechanical spring, found in everything from ballpoint pens to automotive suspensions. They store energy by deflecting under axial compressive load, with a linear force-deflection characteristic defined by the spring rate.

Designing a compression spring involves simultaneously satisfying rate, stress, space, and life requirements. The engineer must select a wire diameter and coil diameter that produce the target spring rate within the available space, while keeping the maximum shear stress below the allowable limit — accounting for curvature effects through the Wahl factor — and avoiding buckling and surge resonance.

## Types and configurations

| End condition | Total coils | Solid height | Buckling tendency |
|---|---|---|---|
| Plain (open) | \( n \) | \( (n+1)d \) | High |
| Plain and ground | \( n+1 \) | \( nd \) | Moderate |
| Squared (closed) | \( n+2 \) | \( (n+3)d \) | Moderate |
| Squared and ground | \( n+2 \) | \( (n+2)d \) | Low |

Squared and ground ends are the most common for precision applications because they provide a flat bearing surface and predictable solid height.

## Engineering workflow

1. **Define requirements** — Target spring rate \( k \), maximum operating force \( F_{\mathrm{max}} \), free length \( L_0 \), and available space (maximum OD, minimum ID, or maximum solid height).
2. **Select wire material** — Music wire (ASTM A228), hard-drawn (A227), chrome-vanadium (A231), or stainless (A313). Wire grade sets the ultimate tensile strength \( R_m \) as a function of diameter via the power-law fit \( R_m = A/d^m \).
3. **Choose wire diameter and mean coil diameter** — The spring index \( C = D/d \) should be between 4 and 12 for practical manufacturing. Indices below 4 are difficult to coil; above 12 tend to tangle.
4. **Compute active coils** — From the rate equation: \( n = Gd^4/(8D^3 k) \).
5. **Check shear stress** — Maximum stress with Wahl correction must not exceed the allowable: \( \tau \leq 0.56\,R_m \) (EN 13906-1 for static cold-coiled springs).
6. **Check buckling** — Free length to mean diameter ratio must stay below the critical value for the end condition.
7. **Check surge frequency** — Natural frequency of the spring must be at least 10 times the forcing frequency to avoid resonance.
8. **Fatigue screening** — If cyclic loading is specified, check the alternating shear stress against the characteristic fatigue strength for the selected life class.

## Key quantities and formulas

**Spring rate**

\[
k = \frac{G\,d^4}{8\,D^3\,n}
\]

where \( G \) is the shear modulus, \( d \) is wire diameter, \( D \) is mean coil diameter, and \( n \) is active coils.

**Maximum shear stress with Wahl factor**

\[
\tau = K_w \frac{8\,F\,D}{\pi\,d^3}
\]

\[
K_w = \frac{4C - 1}{4C - 4} + \frac{0.615}{C}, \quad C = \frac{D}{d}
\]

The Wahl factor \( K_w \) corrects for the non-uniform shear stress distribution caused by coil curvature and direct shear. It ranges from about 1.1 for \( C = 12 \) to 1.6 for \( C = 4 \).

**Buckling screen**

\[
\frac{L_0}{D} \leq \frac{2.63}{\nu}
\]

where \( \nu \) is the end-condition coefficient (0.5 for both ends fixed, 1.0 for one end free).

**Surge frequency**

\[
f_{\mathrm{surge}} = \frac{1}{2}\sqrt{\frac{k}{m_{\mathrm{active}}}}
\]

where \( m_{\mathrm{active}} \) is the mass of the active coils.

## Worked example

**Problem:** Design a compression spring: rate 25 N/mm, max force 500 N, free length 60 mm, maximum OD 35 mm. Material: music wire (ASTM A228), \( G = 81\,500 \) MPa.

1. Maximum deflection: \( \delta = F/k = 500/25 = 20 \) mm.
2. Loaded length: \( L_1 = 60 - 20 = 40 \) mm.
3. Try \( d = 4.0 \) mm, \( D = 25 \) mm (OD = 29 mm, within limit). Spring index: \( C = 25/4 = 6.25 \).
4. Active coils: \( n = 81\,500 \times 4^4 / (8 \times 25^3 \times 25) = 20\,864\,000 / 3\,125\,000 = 6.68 \). Use \( n = 7 \).
5. Actual rate: \( k = 81\,500 \times 256 / (8 \times 15\,625 \times 7) = 20\,864\,000 / 875\,000 = 23.8 \) N/mm (close to target).
6. Wahl factor: \( K_w = (25-1)/(25-4) + 0.615/6.25 = 1.143 + 0.098 = 1.241 \).
7. Max shear stress: \( \tau = 1.241 \times 8 \times 500 \times 25 / (\pi \times 64) = 1.241 \times 100\,000 / 201.1 = 617 \) MPa.
8. Wire strength (\( d = 4 \) mm, A228): \( R_m \approx 1740 \) MPa. Allowable: \( 0.56 \times 1740 = 974 \) MPa. Utilization: 63 % — safe.
9. Solid height (squared/ground): \( (7+2) \times 4 = 36 \) mm. Clearance at max load: \( 40 - 36 = 4 \) mm — adequate.
10. Buckling: \( L_0/D = 60/25 = 2.4 \). Critical ratio for both ends constrained: \( 2.63/0.5 = 5.26 \). Ratio 2.4 < 5.26 — no buckling concern.

## Common mistakes and checks

- **Ignoring the Wahl factor** — Using the uncorrected formula \( \tau = 8FD/(\pi d^3) \) underestimates peak stress by 10–60 % depending on the spring index. Always apply \( K_w \).
- **Coiling to solid without clearance** — Springs that bottom out in service see impact loads at solid height. Maintain at least 10–15 % clash allowance between loaded length and solid height.
- **Buckling-prone proportions** — Springs with \( L_0/D > 4 \) and one free end are prone to buckling. Either reduce free length, increase \( D \), or add a guide rod.
- **Neglecting surge** — If the forcing frequency approaches the surge frequency, spring coils can clash destructively. Maintain a surge margin of at least 10:1.
- **Wrong wire strength curve** — Wire tensile strength decreases with increasing diameter. Using a fixed \( R_m \) value instead of the size-dependent fit \( R_m = A/d^m \) can give incorrect allowable stresses for larger wire sizes.

## FAQ

### What spring index range is recommended?
A spring index \( C = D/d \) between 5 and 10 is ideal. Below 5, coiling becomes difficult and residual stresses are high. Above 12, the spring is flimsy and prone to tangling during handling and installation.

### How does the Wahl factor differ from the Bergstrasser factor?
Both correct for curvature. Wahl: \( K_w = (4C-1)/(4C-4) + 0.615/C \). Bergstrasser: \( K_B = (4C+2)/(4C-3) \). They give nearly identical results for practical spring indices. PhyCalcPro uses the Wahl formulation per Shigley.

### When should I enable fatigue screening?
Enable fatigue analysis whenever the spring experiences cyclic loading — valve springs, suspension springs, reciprocating mechanisms. EN 13906-1 defines life classes: VL (very long, \( > 10^7 \)), LH (long, \( 10^6 \)), MH (medium, \( 10^5 \)), HH (high, \( 10^4 \)).

### Can the auto-design feature size a spring for me?
Yes. PhyCalcPro's auto-design sweeps the wire catalog (EN 10270 / ASTM stock) for wire diameters and active coil counts that satisfy the target rate within the maximum OD constraint, ranking results by stress utilization and material cost.

### What is the difference between static and fatigue allowable stress?
Static allowable is \( 0.56\,R_m \) (EN 13906-1) — the stress at which no permanent set occurs. Fatigue allowable is lower and depends on the life class, wire quality, and the ratio of minimum to maximum stress. Fatigue failure occurs well below the static set limit.

## Use the PhyCalcPro calculator

Design helical compression springs with rate, stress, and fatigue screening in the [Compression Spring Calculator](/products/springs/compression-springs).

---

**Purpose**

Design helical compression springs per EN 13906-1 and Shigley methods: spring rate, solid height, shear stress, buckling screen, surge frequency, and optional EN 13906 fatigue screening. Supports ASTM spring wire grades, EN 10270 wire catalog picker, and Auto-design wire/coil sweeps.

**Physics & theory**

A helical compression spring wound from wire diameter \( d \) on mean coil diameter \( D \) with \( n \) active coils behaves as a linear spring with rate \( k = Gd^4/(8D^3 n) \), where \( G \) is shear modulus. Wahl factor \( K_w = (4C-1)/(4C-4) + 0.615/C \) with spring index \( C = D/d \) corrects for curvature and direct shear in maximum wire shear stress \( \tau = K_w \cdot 8FD/(\pi d^3) \).

EN 13906-1 allowable shear for cold-coiled springs is \( \tau_{\mathrm{zul}} = 0.56\,R_m \), where \( R_m \) follows size-effect fit \( R_m = A/d^m \) for standard wire grades. Buckling occurs when free length \( L_0 \) exceeds \( 2.63\,D/\nu \) with end condition coefficient \( \nu \).

Optional fatigue screening uses characteristic shear fatigue strength \( \tau_{k0} \) with life-class reduction and Goodman mean-stress correction when minimum deflection is specified (life classes VL/LH/MH/HH).

**Governing equations**

\[
k = \frac{G\,d^4}{8\,D^3\,n}
\]

\[
\tau = K_w \frac{8\,F\,D}{\pi\,d^3} \leq 0.56\,R_m
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
| Wire stock picker | Optional catalog designation for auto-fill of \( d \), \( G \), \( R_m \) |
| `endCondition` | Buckling end condition (\( \nu \) coefficient) |
| `operatingFrequencyHz` | Forcing frequency for surge margin (target 10x) |
| Fatigue panel | Life class, wire quality 1-3, minimum deflection |

**Outputs**

- Spring rate, solid height, loaded length, solid height clearance, max load, shear stress, static SF
- Surge frequency and margin, buckling limit, spring index, Wahl factor
- Optional fatigue SF and utilization; governing failure mode
- Load-deflection and stress plots; spring outline preview

**Design codes & checks**

- **Indicative:** Shear stress utilization, solid height, surge margin, fatigue life (when enabled)
- **EU:** EN 13906-1 cold-coiled helical compression springs
- **US:** SAE AMS spring wire specifications (reference)

**Assumptions & limitations**

- Circular wire, closed and ground ends (solid height includes 2d end allowance).
- Fatigue uses simplified \( \tau_{k0} \) + Goodman screening — verify critical designs against EN 13906 nomographs.
- Surge margin requires operating frequency input; default 10x margin target.
- Not for extension or torsion springs (see dedicated modules).

**Verification**

- CI: `compression-springs-indicative-01.json`, `compression-springs-indicative-fatigue-01.json`
- Vitest: `src/lib/springs/compression-springs/engine.test.ts`, `en13906Fatigue.test.ts`
- Engineer sign-off: [spring-modules-user-tasks.md](./spring-modules-user-tasks.md), [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. EN 13906-1:2013. *Cylindrical helical springs — Part 1: Compression springs*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 10.
3. Wahl, A. M. *Mechanical Springs*, 2nd ed., McGraw-Hill.
4. ASTM A228/A227/A229. *Steel Wire for Mechanical Springs*.
5. Spring Manufacturers Institute. *Handbook of Spring Design*.
