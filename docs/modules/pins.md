---
seoTitle: "Pin & Clevis Joint Calculator – Shear, Bearing & Safety Factor Analysis"
seoDescription: "Analyze pins, clevis joints, and shear connections for single and double shear failure modes with bearing capacity and safety factors for linkage and lug design."
guideHeadline: "Engineering guide to pin and clevis joint design"
keywords:
  - pin calculator
  - clevis joint analysis
  - pin shear stress
  - bearing stress pin
  - lifting lug design
  - double shear pin
  - linkage pin sizing
---

### Pins & Clevis (`pins`)

## How engineers design pin connections

Pins are cylindrical fasteners loaded primarily in shear, connecting linkages, clevises, hinges, and lifting lugs. Unlike bolts, pins are not preloaded — they carry direct transverse load through shear across one or two planes. The analysis checks pin shear stress and plate bearing stress, then reports the governing mode and overall safety factor. Pin connections are found throughout mechanical linkages, hydraulic cylinder mounts, and structural connections.

## Joint types and configurations

| Configuration | Shear planes | Description |
|--------------|-------------|-------------|
| Single shear | 1 | Pin between two plates, one failure plane |
| Double shear (clevis) | 2 | Fork-and-tongue, two failure planes |
| Knuckle joint | 2 | Symmetrical fork and eye |
| Lifting lug | 1 or 2 | Pad eye or shackle connection |

## Engineering workflow

1. Determine the applied load and load direction.
2. Select pin diameter from standard sizes or stress requirements.
3. Identify single or double shear configuration.
4. Calculate pin shear stress on the relevant number of shear planes.
5. Calculate bearing stress on each plate in contact with the pin.
6. Compare both stresses to material allowables.
7. Report the governing failure mode and safety factor.
8. If pin bending is significant (wide gap between clevis ears), add bending stress.

## Key quantities and formulas

Pin shear stress:

\[
\tau_{\text{pin}} = \frac{F}{n_s \, A_{\text{pin}}} \leq \tau_{\text{allow}}
\]

Bearing stress on plate:

\[
\sigma_{\text{bearing}} = \frac{F}{d \, t} \leq \sigma_{\text{b,allow}}
\]

Overall safety factor:

\[
SF = \min\!\left(\frac{\tau_{\text{allow}}}{\tau_{\text{pin}}},\; \frac{\sigma_{\text{b,allow}}}{\sigma_{\text{bearing}}}\right)
\]

## Worked example

A clevis joint (double shear) carries 25 kN with a 20 mm pin. Fork plates: 12 mm each, tongue plate: 15 mm. Pin shear allowable 150 MPa, plate bearing allowable 300 MPa.

- Pin area: \( A = \pi \times 20^2/4 = 314 \) mm\(^2\).
- Shear stress: \( \tau = 25000 / (2 \times 314) = 39.8 \) MPa. SF(shear) = 3.77.
- Bearing on tongue (thinnest): \( \sigma_b = 25000 / (20 \times 15) = 83.3 \) MPa. SF(bearing) = 3.60.
- Governing mode: bearing on tongue plate. Overall SF = 3.60.

## Common mistakes and checks

- **Neglecting pin bending:** if the gap between clevis ears is larger than the pin diameter, bending stress can exceed shear stress.
- **Using tensile area instead of shank area:** pins are not threaded — use the full cross-sectional area.
- **Forgetting to check both plates:** bearing stress must be checked on the thinnest plate, not just the thickest.
- **Ignoring edge distance:** insufficient material between hole edge and plate boundary causes tear-out.

## FAQ

### When does pin bending matter?

When the unsupported span (gap between bearing surfaces) exceeds about 1.5 times the pin diameter. In that case, treat the pin as a simply supported beam with central load.

### Can hardened pins be used to increase capacity?

Yes — a hardened pin increases shear allowable but does not help if bearing on softer plates governs. Use hardened bushings in the plates for balanced design.

### What is the difference between a pin and a bolt in a connection?

A bolt is preloaded axially and may carry shear through friction; a pin carries load entirely through shear and bearing with no axial clamp.

### How does ASME BTH-1 apply to pin connections?

ASME BTH-1 covers below-the-hook lifting devices and specifies design factors for pin connections in lifting lugs, shackles, and rigging hardware.

### Should I use a cotter pin or snap ring to retain the pin?

Either works for retention. Cotter pins are standard for field-replaceable connections; snap rings are cleaner but harder to inspect.

## Use the PhyCalcPro calculator

Open the [Pins & Clevis calculator](/products/fasteners/pins) to enter pin diameter, plate thicknesses, shear configuration, applied force, and material allowables. The tool returns pin shear stress, bearing stress, safety factors, and governing mode.

---

**Purpose**

Analyze pins, clevis joints, and shear connections for double or single shear failure modes including pin shear and plate bearing capacity.

**Physics & theory**

A pin in double shear carries load on two shear planes: \( \tau = F/(2A) \). Single shear has one plane. Bearing stress on clevis plates is \( \sigma_b = F/(d t) \) per plate thickness in contact. Governing capacity is the minimum of pin shear strength and plate bearing strength.

**Governing equations**

\[
\tau_{\text{pin}} = \frac{F}{n_s \, A_{\text{pin}}} \leq \tau_{\text{allow}}
\]

\[
\sigma_{\text{bearing}} = \frac{F}{d \, t} \leq \sigma_{\text{b,allow}}
\]

\[
SF = \min\!\left(\frac{\tau_{\text{allow}}}{\tau_{\text{pin}}},\; \frac{\sigma_{\text{b,allow}}}{\sigma_{\text{bearing}}}\right)
\]

**Numerical method**

Closed-form shear and bearing screening. User selects single or double shear, pin diameter, plate thickness, and material allowables.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pin diameter \( d \) | Pin size |
| Plate thickness(es) | Clevis ear thickness |
| Shear planes | Single or double |
| Applied force \( F \) | Joint load |
| Allowables | Pin shear, plate bearing |

**Outputs**

- Pin shear stress, bearing stress, safety factors, governing mode.

**Design codes & checks**

- **Indicative:** Pin shear and bearing safety factors
- **US:** ASME BTH-1 pin connections (lifting context)

**Assumptions & limitations**

- Pin bending neglected for standard short clevis proportions.
- No wear or fretting on pin bore.
- Static load; fatigue not computed.
- Assumes aligned holes without eccentricity.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
2. ASME BTH-1-2020. *Design of Below-the-Hook Lifting Devices*.
3. MIL-HDBK-5 (MMPDS) — pin and joint allowables (reference).
4. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*.
