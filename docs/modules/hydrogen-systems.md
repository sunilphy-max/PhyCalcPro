---
seoTitle: "Hydrogen Systems Calculator: Storage Mass, Hoop Stress & Leak Flow"
seoDescription: "How engineers screen gaseous hydrogen storage mass, energy content, vessel hoop stress, leak flow, and vent area for preliminary H₂ system sizing."
guideHeadline: "How Engineers Size Hydrogen Storage Systems"
keywords: ["hydrogen storage", "hydrogen vessel", "hoop stress", "hydrogen leak", "vent area", "ideal gas"]
---

### Hydrogen Systems (`hydrogen-systems`)

## How engineers size hydrogen storage systems

Hydrogen energy systems — fuel cells, electrolysers, refuelling stations — require high-pressure gas storage, safe piping, and controlled venting. Engineers must estimate stored mass and energy content, verify vessel wall stress, and screen leak and vent scenarios. These first-pass calculations use ideal gas relations and thin-wall stress theory before detailed real-gas equations of state and code vessel design.

This guide covers gaseous hydrogen storage sizing, vessel stress screening, and leak/vent flow estimation.

## Hydrogen storage methods and applicability

| Method | Pressure / conditions | Model fit | Notes |
|--------|----------------------|-----------|-------|
| Compressed gas (Type I–III) | 35–70 MPa | Good — thin-wall + ideal gas | Compressibility correction above 10 MPa |
| Compressed gas (Type IV) | 35–70 MPa | Hoop stress approximate | Composite overwrap needs specialised rules |
| Liquid hydrogen | 20.3 K, ~1 atm | Not modelled | Cryogenic module more appropriate |
| Metal hydride | Low pressure, solid state | Not modelled | Absorption kinetics differ |
| LOHC (chemical carrier) | Ambient | Not modelled | Chemical engineering process |

## Engineering workflow

1. **Define storage requirement** — mass of H₂ or energy content (kWh).
2. **Set operating conditions** — pressure, temperature, vessel geometry.
3. **Compute stored mass** — from ideal gas law (with compressibility correction if > 10 MPa).
4. **Estimate energy content** — lower heating value \(\approx 120\) MJ/kg.
5. **Check vessel hoop stress** — thin-wall formula \(\sigma_h = Pr/t\) against material allowable.
6. **Screen leak flow** — orifice model for credible leak scenario.
7. **Size vent area** — for pressure relief or controlled depressurisation.

## Key quantities and formulas

Ideal gas storage mass:

\[
m = \frac{P\,V\,M}{R\,T}
\]

where \(M = 2.016 \times 10^{-3}\) kg/mol for H₂ and \(R = 8.314\) J/(mol·K).

Thin-wall hoop stress:

\[
\sigma_h = \frac{P\,r}{t}
\]

Orifice leak mass flow:

\[
\dot{m} = C_d\,A\,\sqrt{2\,\rho\,\Delta P}
\]

Energy content (LHV):

\[
E = m \times 120 \;\text{MJ/kg}
\]

## Worked example

**Given:** Type I steel vessel — 50 L internal volume, 35 MPa, 288 K. Vessel inner radius 150 mm, wall thickness 15 mm. Material allowable 300 MPa.

1. Stored mass: \(m = 35 \times 10^6 \times 0.05 \times 2.016 \times 10^{-3} / (8.314 \times 288) = 1.47\) kg. (At 35 MPa, real-gas compressibility \(Z \approx 1.2\); corrected mass \(\approx 1.47/1.2 = 1.23\) kg.)
2. Energy: \(1.23 \times 120 = 147\) MJ (\(\approx 40.9\) kWh).
3. Hoop stress: \(\sigma_h = 35 \times 150 / 15 = 350\) MPa — exceeds 300 MPa allowable. Increase wall to 18 mm: \(\sigma_h = 292\) MPa — acceptable.
4. Leak: 1 mm² orifice, \(C_d = 0.6\), density at 35 MPa \(\approx 24.6\) kg/m³, \(\Delta P = 35\) MPa: \(\dot{m} = 0.6 \times 10^{-6} \times \sqrt{2 \times 24.6 \times 35 \times 10^6} = 0.79\) g/s.

**Interpretation:** The ideal gas law overestimates stored mass at 35 MPa; always apply compressibility correction above 10 MPa. The initial wall thickness was insufficient — the hoop-stress screen caught it before detailed ASME analysis.

## Common mistakes and checks

- Using **ideal gas** without **compressibility factor** above 10 MPa — overstates stored mass by 15–30 %.
- Applying **thin-wall stress** to thick-wall vessels — when \(t/r > 0.1\), use Lame's equations.
- Ignoring **hydrogen embrittlement** — high-strength steels lose ductility in H₂ service; use ASME B31.12 material guidance.
- Confusing **HHV and LHV** — hydrogen's higher heating value is 142 MJ/kg, lower is 120 MJ/kg; fuel cell efficiency references LHV.
- Treating **orifice leak flow** as relief valve sizing — relief valves require certified sizing per API 520 / EN ISO 4126.
- Forgetting **permeation** through Type IV composite liners at high pressure.

## FAQ

### Why does ideal gas overestimate hydrogen mass at high pressure?

At pressures above 10 MPa, hydrogen molecules interact and the compressibility factor \(Z > 1\). The corrected equation is \(m = PVM/(ZRT)\). At 70 MPa, \(Z \approx 1.5\).

### What is the difference between Type I–IV vessels?

Type I: all-metal. Type II: metal liner with partial composite wrap. Type III: metal liner, full composite wrap. Type IV: polymer liner, full composite wrap. Types III and IV dominate automotive applications.

### How is hydrogen embrittlement addressed?

Use materials qualified for hydrogen service per ASME B31.12 or ISO 11114. Limit hardness and strength (e.g., HRC < 22 for carbon steel). Perform slow strain-rate testing in H₂ environment.

### What codes govern hydrogen vessel design?

ASME BPVC Section VIII for pressure vessels, ASME B31.12 for hydrogen piping, NFPA 2 for hydrogen technologies, and ISO 19880 for fuelling stations. This module provides screening — not code-compliant design.

### How do I estimate vent sizing for emergency relief?

The module back-calculates vent area from gas generation rate and target velocity. For code-compliant relief, use API 520 sizing methods with hydrogen-specific properties.

## Use the PhyCalcPro calculator

Open the [Hydrogen systems calculator](/products/advanced-systems/hydrogen-systems). Enter storage pressure, volume, temperature, vessel geometry, and leak/vent parameters. Review stored mass, energy content, hoop stress, gas density, leak flow, and vent area.

**Purpose**

Screen gaseous hydrogen storage mass, energy content, vessel hoop stress, leak mass flow, and vent area using ideal gas relations. Supports preliminary H₂ storage and vent line sizing with code awareness notes.

**Physics & theory**

Ideal gas storage: \(m = PVM/(RT)\). Lower heating value energy \(E \approx m \times 120\) MJ/kg for screening. Thin-wall hoop stress \(\sigma_h = Pr/t\). Leak through orifice: \(\dot{m} = C_d A\sqrt{2\rho\Delta P}\). High-pressure hydrogen deviates from ideal gas — compressibility factor \(Z\) needed above ~10 MPa.

**Governing equations**

\[
m = \frac{P\,V\,M}{R\,T}
\]

\[
\sigma_h = \frac{P\,r}{t}
\]

\[
\dot{m} = C_d\,A\,\sqrt{2\,\rho\,\Delta P}
\]

**Numerical method**

Ideal gas and thin-wall stress. Warning when pressure > 10 MPa recommends real-gas and code vessel checks. Vent area back-calculated from leak flow relation.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pressure, volume, temperature | Storage conditions |
| Vessel radius, wall thickness | Vessel geometry |
| Discharge coefficient, orifice area | Leak path |
| Vent differential pressure | Vent differential |

**Outputs**

- Stored mass (kg), energy content (J), hoop stress (Pa), gas density, leak mass flow, vent area.

**Design codes & checks**

- **Indicative:** Storage mass, hoop stress, leak/vent screening
- **ISO:** ISO 19880 hydrogen fuelling (context)
- **US:** ASME B31.12 hydrogen piping; NFPA 2 hydrogen technologies

**Assumptions & limitations**

- Ideal gas; high pressure requires compressibility correction.
- Thin-wall vessel; composite Type IV tanks need specialised rules.
- Leak flow is orifice model — not relief valve certified sizing.
- Material compatibility (hydrogen embrittlement) not evaluated.

**References**

1. NFPA 2:2020. *Hydrogen Technologies Code*.
2. ASME B31.12:2019. *Hydrogen Piping and Pipelines*.
3. ISO 19880-1:2020. *Gaseous hydrogen — Fuelling stations*.
4. SAE J2579. *Technical Information Report on Fuel Systems in Fuel Cell Vehicles*.
