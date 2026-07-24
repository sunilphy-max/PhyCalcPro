---
seoTitle: "Plain Bearing Calculator – Sommerfeld Number, Film Thickness & ISO 7902 Analysis"
seoDescription: "Screen hydrodynamic journal and thrust bearings with Sommerfeld number, minimum film thickness, power loss, temperature rise, and ISO 7902/12130 code checks using PhyCalcPro."
guideHeadline: "Plain Bearing Design — Sommerfeld Number, Film Thickness & Lubrication Guide"
keywords: ["plain bearing calculator", "journal bearing", "Sommerfeld number", "minimum film thickness", "hydrodynamic lubrication", "ISO 7902", "bearing design", "power loss"]
---

### Plain Bearing Design Guide (`plain-bearings`)

## How engineers select plain bearings

Plain (journal) bearings support rotating shafts through a thin film of lubricant rather than rolling elements. When a shaft rotates inside a bushing, it drags oil into a converging wedge-shaped gap, generating hydrodynamic pressure that lifts the shaft off the bushing surface. This self-generated pressure support is called hydrodynamic lubrication.

The design objective is to ensure that the minimum oil film thickness exceeds the combined surface roughness of the shaft and bushing under all operating conditions — including startup, shutdown, and peak loads. If the film breaks down, metal-to-metal contact causes rapid wear, scoring, and ultimately seizure.

The Sommerfeld number is the central dimensionless parameter that characterizes bearing operation. It combines speed, viscosity, load, geometry, and clearance into a single value that maps onto charts giving eccentricity ratio, minimum film thickness, power loss, and flow rate.

## Types and configurations

| Bearing type | Geometry | Application |
|---|---|---|
| Full journal (360 deg) | Complete cylindrical sleeve | General machinery, turbines |
| Partial arc (120–180 deg) | Open arc bushing | Lightly loaded, easy assembly |
| Tilting-pad journal | Pivoting pads around shaft | High-speed, stable (no oil whirl) |
| Thrust pad | Flat pads on a collar | Axial load support |
| Tilting-pad thrust | Pivoting flat pads | High-speed axial loads |

Full journal bearings are the most common for moderate-speed industrial applications. Tilting-pad designs are used for high-speed turbomachinery where oil-whirl instability must be avoided.

## Engineering workflow

1. **Define operating conditions** — Shaft speed \( n \) (rpm), radial load \( W \) (N), desired L/D ratio, and ambient temperature.
2. **Select bearing geometry** — Journal diameter \( D \), bearing length \( L \), and radial clearance \( c \). Clearance ratio \( c/r \) is typically 0.001–0.003 (1–3 thousandths of radius).
3. **Select lubricant** — Choose an oil with the appropriate viscosity grade (ISO VG). Viscosity must be evaluated at the expected operating temperature, not the reference temperature.
4. **Compute Sommerfeld number** — \( S = (\mu\,n/p)(r/c)^2 \). A higher \( S \) means a thicker film and more power loss; a lower \( S \) means a thinner film with less loss but greater risk of boundary contact.
5. **Look up eccentricity and film thickness** — From Raimondi-Boyd charts or interpolation, determine \( \varepsilon \) and \( h_{\min} = c(1-\varepsilon) \).
6. **Verify film thickness** — \( h_{\min} \) must exceed the composite surface roughness by a factor of at least 2–4 (the film parameter \( \Lambda \)).
7. **Compute power loss and temperature rise** — Viscous shear loss heats the oil; verify that the temperature rise is acceptable and iterate viscosity if needed.

## Key quantities and formulas

**Sommerfeld number**

\[
S = \frac{\mu\,n}{p}\left(\frac{r}{c}\right)^2
\]

where \( \mu \) is dynamic viscosity (Pa-s), \( n \) is speed (rev/s), \( p = W/(2rL) \) is unit load (Pa), \( r \) is journal radius, and \( c \) is radial clearance.

**Minimum film thickness**

\[
h_{\min} = c\,(1 - \varepsilon)
\]

where \( \varepsilon \) is the eccentricity ratio obtained from Raimondi-Boyd charts as a function of \( S \) and \( L/D \).

**Petroff power loss (lightly loaded approximation)**

\[
P_{\mathrm{loss}} = \frac{4\pi^2\,\mu\,n^2\,r^3\,L}{c}
\]

This underestimates loss at high eccentricity; the full Raimondi-Boyd friction variable gives more accurate results.

**Film parameter**

\[
\Lambda = \frac{h_{\min}}{\sqrt{R_{q,\mathrm{shaft}}^2 + R_{q,\mathrm{bushing}}^2}}
\]

Full hydrodynamic lubrication requires \( \Lambda > 3 \); mixed lubrication occurs at \( 1 < \Lambda < 3 \); boundary lubrication at \( \Lambda < 1 \).

## Worked example

**Problem:** A journal bearing supports a 50 mm diameter shaft at 3000 rpm under a 5 kN radial load. Bearing length 50 mm (L/D = 1.0), radial clearance 0.050 mm (c/r = 0.002). Oil: ISO VG 32, viscosity at operating temperature estimated 0.020 Pa-s.

1. Unit load: \( p = 5000 / (2 \times 0.025 \times 0.050) = 2.0 \) MPa.
2. Speed: \( n = 3000/60 = 50 \) rev/s.
3. Sommerfeld number: \( S = (0.020 \times 50 / 2\,000\,000) \times (25/0.050)^2 = 5.0 \times 10^{-7} \times 250\,000 = 0.125 \).
4. From Raimondi-Boyd (L/D = 1.0, S = 0.125): \( \varepsilon \approx 0.68 \).
5. Minimum film thickness: \( h_{\min} = 0.050 \times (1 - 0.68) = 0.016 \) mm = 16 \( \mu \)m.
6. Surface roughness (ground shaft \( R_q = 0.4 \) \( \mu \)m, bushing \( R_q = 0.8 \) \( \mu \)m): \( \Lambda = 16/\sqrt{0.16+0.64} = 16/0.89 = 18 \) — excellent hydrodynamic film.
7. Petroff loss: \( P \approx 4\pi^2 \times 0.020 \times 2500 \times 1.56 \times 10^{-5} \times 0.050 / 5.0 \times 10^{-5} = 310 \) W.
8. Temperature rise (adiabatic estimate): \( \Delta T = P/(Q \rho c_p) \). With typical flow and oil properties, expect 15–25 C rise. Iterate viscosity at \( T_{\mathrm{op}} = T_{\mathrm{amb}} + \Delta T \).

## Common mistakes and checks

- **Using viscosity at wrong temperature** — Viscosity drops dramatically with temperature. Using the catalogue value at 40 C when the bearing runs at 70 C can overpredict film thickness by 2–3 times. Always evaluate viscosity at the expected operating temperature.
- **Ignoring thermal iteration** — Power loss heats the oil, reducing viscosity, which reduces film thickness, which increases loss. At least 2–3 iterations of temperature-viscosity equilibrium are necessary for a realistic design.
- **Clearance too tight or too loose** — Too-tight clearance raises power loss and temperature; too-loose clearance reduces film thickness and load capacity. Optimal clearance ratio is typically 0.001–0.002 for industrial bearings.
- **Neglecting startup and shutdown** — At zero or very low speed, the hydrodynamic film does not form. Bearing materials must be selected for boundary lubrication during these transients (bronze, babbitt, polymer-lined).
- **Omitting specific load check** — Even if the film is adequate, the specific load \( p \) must not exceed the bearing material's allowable PV limit or pressure rating.

## FAQ

### What is the Sommerfeld number and what values are typical?
The Sommerfeld number \( S \) is a dimensionless group that combines the key bearing parameters. Typical values range from 0.01 (heavily loaded, thin film) to 1.0 (lightly loaded, thick film). Industrial bearings usually operate at \( S = 0.05\text{--}0.30 \).

### How do I choose the radial clearance?
Start with a clearance ratio \( c/r = 0.001 \) for precision applications or \( c/r = 0.002 \) for general machinery. Manufacturers of bearing shells (bushings) provide recommended fits. PhyCalcPro's advisor suggests clearance based on shaft size and speed.

### What is the oil whirl/whip instability?
Oil whirl is a self-excited vibration caused by the circumferential oil flow in a full journal bearing at high speeds. The shaft orbits at approximately half the rotational speed. Tilting-pad bearings eliminate oil whirl by breaking the circumferential flow. This module screens for specific load and eccentricity but does not perform dynamic stability analysis.

### How does the oil catalog work?
PhyCalcPro includes approximately 25 ISO VG mineral, PAO, and ester lubricant grades with temperature-viscosity curves (Walther equation). Selecting an oil grade and entering the operating temperature automatically computes the dynamic viscosity used in the Sommerfeld calculation.

### When should I consider rolling element bearings instead?
Rolling element bearings (ball, roller) are preferred when speeds are very low (no hydrodynamic film), when starting and stopping is frequent, when space is limited axially, or when the application requires very low friction. Plain bearings excel at high speeds, high loads, and long continuous-duty operation.

## Use the PhyCalcPro calculator

Screen journal and thrust pad bearings with Sommerfeld, film, and thermal checks in the [Plain Bearing Calculator](/products/bearings/plain).

---

**Purpose**

Screen hydrodynamic journal and thrust pad bearings (ISO 7902 / ISO 12130 / ISO 12131 screening) with Sommerfeld number, minimum film thickness, power loss, and temperature rise. Supports preliminary bearing design before detailed Reynolds equation solution.

**Physics & theory**

In a journal bearing, the rotating shaft (journal) separates from the bushing by a lubricant film when sufficient speed generates hydrodynamic pressure. The Sommerfeld number \( S = (\mu\,n/p)(r/c)^2 \) characterizes operation, where \( \mu \) is viscosity, \( n \) is speed, \( p \) is unit load, \( r \) is radius, and \( c \) is radial clearance.

Minimum film thickness \( h_{\min} \) occurs near the maximum pressure arc; it must exceed composite surface roughness to avoid boundary contact. Eccentricity ratio \( \varepsilon \) is interpolated from Raimondi-Boyd \( \varepsilon(S) \) charts (full journal, \( L/D \approx 1 \) screening). Power loss is viscous shear in the film. Outlet temperature uses a 2-3 pass temperature-viscosity iteration (Walther screening scale on the user viscosity).

**Governing equations**

\[
S = \frac{\mu\,n}{p}\left(\frac{r}{c}\right)^2, \quad p = \frac{W}{2\,r\,L}
\]

\[
h_{\min} = c\,(1 - \varepsilon)
\]

\[
P_{\mathrm{loss}} = \frac{4\pi^2\,\mu\,n^2\,r^3\,L}{c}
\]

**Numerical method**

Sommerfeld + Raimondi-Boyd \( \varepsilon(S) \), iterative mean-film temperature viscosity. Inputs: diameter, length, clearance, load, speed, viscosity, ambient temperature. Outputs: \( S \), \( h_{\min} \), eccentricity, power loss, specific load, outlet T, shaft/housing fit recommendation.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Journal / pad diameter, length | Bearing geometry |
| Radial clearance \( c \) | Assembly clearance |
| `load`, `speed` | Operating W and rpm |
| Oil viscosity \( \mu \) | At ambient / stated reference temperature (or from oil catalog) |
| Oil catalog | ~25 ISO VG mineral/PAO/ester grades with viscosity-temperature curves |
| Bushing material | ~12 materials with specific-load / PV / temp limits |
| Ambient temperature | For temperature-viscosity iteration and outlet T |
| Bearing type | Journal / thrust pad / tilting pad |

**Outputs**

- Sommerfeld number, eccentricity ratio, minimum film thickness, film parameter / specific load, power loss, outlet temperature
- Live Design Summary rail (S, \( h_{\min} \), specific load, outlet T, status)
- Deterministic plain advisor (L/D, clearance, viscosity, pad count rationale + alternatives)
- Status banner with eccentricity, film ratio, load-limit highlights

**Design codes & checks**

- **ISO 7902** — Hydrodynamic plain journal screening
- **ISO 12130 / 12131** — Tilting-pad / thrust pad screening
- Specific load and temperature screening limits

**Assumptions & limitations**

- Full journal, steady-state; oil catalog + Walther viscosity-temperature model; light temperature-viscosity iteration (not full flow heat balance).
- Raimondi-Boyd eccentricity interpolated for L/D in {0.25...1.5} — not full finite-length Reynolds solution.
- No dynamic instability (oil whirl/whip) analysis.
- No detailed oil flow balance or cooling circuit modeling.

**Verification**

- CI: `plain-bearings-indicative-01.json` (where available)
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Hamrock, B. J., Schmid, S. R., & Jacobson, B. O. *Fundamentals of Fluid Film Lubrication*, 2nd ed., CRC Press.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 12.
3. ISO 7902-1:2020. *Hydrodynamic plain journal bearings under steady-state conditions*.
4. ISO 12130-1:2021. *Plain bearings — Hydrodynamic plain thrust pad bearings under steady-state conditions*.
5. Bassani, R., & Piccigallo, B. *Hydrostatic Lubrication*. Elsevier.
