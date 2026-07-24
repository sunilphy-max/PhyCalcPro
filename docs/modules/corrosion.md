---
seoTitle: "Corrosion Allowance Calculator: Wall Thickness, Remaining Life & Rate"
seoDescription: "How engineers calculate required wall thickness with corrosion allowance and estimate remaining service life from inspection data and corrosion rate."
guideHeadline: "How Engineers Account for Corrosion in Design"
keywords: ["corrosion allowance", "remaining life", "corrosion rate", "wall thickness", "ASME corrosion", "piping inspection"]
---

### Corrosion Allowance (`corrosion`)

## How engineers account for corrosion

Corrosion progressively removes material from exposed surfaces. Engineers must add a corrosion allowance to the minimum structural or pressure thickness so the component survives its design life. During service, inspection thickness readings estimate remaining life and schedule the next inspection or replacement.

This guide covers uniform general corrosion models, how corrosion allowance enters pressure vessel and piping design, and how to interpret inspection-based remaining-life estimates.

## Corrosion types and when to apply this model

| Type | Character | This module? |
|------|-----------|-------------|
| Uniform general | Even metal loss over surface | Yes — primary model |
| Pitting | Localised deep attack | Qualitative — increase allowance |
| Crevice | Attack in tight gaps | Qualitative — increase allowance |
| Galvanic | Dissimilar metals in contact | Not modelled — material selection issue |
| Stress corrosion cracking | Cracking under stress + environment | Not modelled — requires fracture mechanics |
| Erosion-corrosion | Flow-accelerated metal loss | Qualitative — increase rate input |

## Engineering workflow

1. **Establish corrosion rate** — from service experience, corrosion coupons, or literature for the fluid/metal pair. Typical carbon steel in mildly corrosive service: 0.1–0.5 mm/year.
2. **Set design life** — years of intended service (e.g., 20 years for process piping).
3. **Compute corrosion allowance** — \(CA = r \times t_{\mathrm{life}}\).
4. **Add to minimum thickness** — \(t_{\mathrm{required}} = t_{\mathrm{pressure}} + CA\).
5. **During service** — measure wall thickness by UT inspection; compute remaining life from excess above minimum.
6. **Schedule action** — replace, repair, or re-inspect before remaining life expires.

## Key quantities and formulas

Corrosion allowance:

\[
CA = r \cdot t_{\mathrm{design\_life}}
\]

Required wall thickness:

\[
t_{\mathrm{required}} = t_{\mathrm{pressure}} + CA
\]

Remaining life from inspection:

\[
t_{\mathrm{remaining\_life}} = \frac{t_{\mathrm{now}} - t_{\mathrm{min}}}{r}
\]

## Worked example

**Given:** Carbon steel pipe in cooling water service. Corrosion rate 0.15 mm/year. Design life 25 years. Minimum pressure thickness 4.5 mm. After 10 years, UT inspection reads 6.2 mm.

1. Corrosion allowance: \(CA = 0.15 \times 25 = 3.75\) mm.
2. Required nominal thickness: \(t = 4.5 + 3.75 = 8.25\) mm. Specify 8.56 mm (Sch 40 pipe or next standard wall).
3. After 10 years: remaining life \(= (6.2 - 4.5) / 0.15 = 11.3\) years — still adequate but schedule next inspection in 5 years.

**Interpretation:** The pipe is consuming allowance faster than the uniform model if initial wall was 8.56 mm; actual rate may be \((8.56 - 6.2)/10 = 0.236\) mm/year — update the rate.

## Common mistakes and checks

- Using a **literature corrosion rate** without validating against actual service data.
- Applying the **uniform model** to localised pitting — underestimates depth.
- Forgetting that **corrosion rate can change** over service life (inhibitor loss, temperature change).
- Not adding corrosion allowance to **structural minimum** in addition to pressure minimum.
- Inspecting **only accessible areas** — hidden spots may corrode faster.

## FAQ

### What is a typical corrosion allowance for carbon steel piping?

Common values are 1.5–3.0 mm for mildly corrosive water services and 3.0–6.0 mm for more aggressive environments. ASME B31.3 and client specifications set minimums.

### How is corrosion rate determined?

From corrosion coupon programmes, historical UT thickness surveys, or published data for the specific fluid/metal/temperature combination. Rates should be validated against field measurements.

### Does this module handle coatings or CRA liners?

No. Coatings and corrosion-resistant alloy liners reduce the effective corrosion rate — enter a reduced rate to reflect the protection.

### When should I increase the allowance above the calculated value?

When localised attack (pitting, crevice, under-deposit) is expected, when inspection access is limited, or when the consequence of failure is severe.

## Use the PhyCalcPro calculator

Open the [Corrosion allowance calculator](/products/materials/corrosion). Enter corrosion rate, design life, and minimum structural thickness. Optionally add an inspection measurement to compute remaining service life and thickness utilisation.

**Purpose**

Calculate required wall thickness including corrosion allowance and estimate remaining service life based on corrosion rate. Used for piping, vessels, and structural steel in corrosive environments.

**Physics & theory**

Corrosion progressively removes material at rate \(r\) (mm/year). Design thickness must satisfy pressure/stress requirements at end of service life: \(t_{\mathrm{design}} = t_{\mathrm{min}} + CA\). Remaining life from inspection: \(t_{\mathrm{remaining}} = (t_{\mathrm{measured}} - t_{\mathrm{min}})/r\). Galvanic, pitting, and crevice corrosion require higher allowances than the uniform model.

**Governing equations**

\[
CA = r \cdot t_{\mathrm{design\_life}}
\]

\[
t_{\mathrm{required}} = t_{\mathrm{pressure}} + CA
\]

\[
t_{\mathrm{remaining\_life}} = \frac{t_{\mathrm{now}} - t_{\mathrm{min}}}{r}
\]

**Numerical method**

Closed-form allowance and life equations. User supplies corrosion rate, design life, minimum structural thickness, and optional measured thickness for remaining life.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Corrosion rate | Material loss rate (mm/year) |
| Design life | Intended service years |
| Minimum thickness | Structural/pressure minimum |
| Measured thickness (optional) | Current inspection reading |
| Environment class | Informative severity |

**Outputs**

- Corrosion allowance, required thickness, remaining life margin, thickness utilisation.

**Design codes & checks**

- **Indicative:** Remaining life margin, required thickness margin
- **US:** ASME B31.3 corrosion allowance guidance
- **US:** ASME VIII-1 UG-25 corrosion allowance

**Assumptions & limitations**

- Uniform general corrosion; localised pitting not modelled.
- Constant corrosion rate over life — no inhibition or passivation change.
- Does not select CRA materials or coatings.
- Inspection interval planning is user responsibility.

**References**

1. ASME B31.3:2022. *Process Piping*, corrosion allowance.
2. ASME BPVC Section VIII, Division 1, UG-25.
3. NACE SP0169. *Control of External Corrosion on Underground Pipelines*.
4. API 570. *Piping Inspection Code*.
