---
seoTitle: "Bearing System Designer Guide: How Engineers Select Bearings"
seoDescription: "Application System Designer for rolling bearings: stations, duty, ISO 281 L10, catalog size, lubrication, fits, and service diagnosis."
guideHeadline: "How Engineers Select Bearings"
keywords: ["bearing system designer", "bearing selection", "L10 life", "ISO 281", "dynamic load rating", "equivalent bearing load", "bearing lubrication"]
---

### Bearing System Designer Guide (`bearings`)

## How engineers select bearings

Rolling-element bearing selection is a load–life–speed–fit problem. Engineers size bearings so that the **basic or modified rating life** meets the duty, static safety is adequate at peak load, speed stays below catalog limits, and the arrangement (locating / floating, O / X / T) matches thermal growth and stiffness needs.

PhyCalcPro’s **Bearing Application System Designer** (`/products/bearings/designer`) is the primary workspace. It supports two URL-addressable intents on one project object:

- **Design** (`?intent=design`) — System → Duty → Size → Verify → Report
- **Service** (`?intent=service`) — Identify → Duty → Evaluate → Diagnose → Actions

Legacy URLs (`/life`, `/loads`, `/speed`, `/lubrication`, `/mounting`, `/arrangement`, `/selection`) permanently redirect into Designer panels. Catalog database, failure guide, plain bearings, and housings remain sibling modules.

## Bearing types and when to use them

| Family | Typical use | Load character |
|--------|-------------|----------------|
| Deep groove ball | General radial, light–moderate axial | Combined; versatile |
| Angular contact ball | Axial + radial; paired O/X/T | High axial capacity when duplexed |
| Cylindrical roller (NU/NJ/NUP) | High radial; some axial via flanges | Mostly radial |
| Tapered roller | Combined loads; adjustable preload | High radial + axial |
| Spherical roller | Misalignment + heavy radial | High radial; some axial |
| Needle | Compact radial envelopes | High radial, low speed |
| Thrust (ball/roller) | Primarily axial | Axial dominant |
| Self-aligning ball | Moderate misalignment | Light–moderate combined |

**Selection tip:** Start from the load vector (Fr, Fa), speed, and whether shafts need locating+floating or rigid duplex pairs. Space limits and sealing (open / ZZ / 2RS) often decide series before life does.

## Engineering workflow (System Designer)

1. **System** — Choose dynamic topology: single station, locating+floating, or duplex O / X / T. Optional shaft handoff for station reactions.
2. **Duty** — Fr, Fa (or spectrum), speed \(n\), required life \(L_{10h}\).
3. **Size** — Catalog filters and designation (or auto-design ranking).
4. **Verify** — Method ladder (ISO 281 → ISO 16281 screen → stress-life screen → OEM/FEA), lubrication \(\kappa\) / \(e_C\), clearance, misalignment, speed / min load.
5. **Report** — Decision strip (Pass / Marginal / Fail), station table, export.

**Service intent** starts from an installed designation, emphasizes diagnosis, interchange, grease life, and defect frequencies.

**Method ladder:** climb only as far as the decision needs. ISO 16281 and stress-life paths are **screening** — not full FEA, GBLM, or Bearinx.

## Key quantities and formulas

Basic rating life (revolutions) and life in hours:

\[
L_{10} = \left(\frac{C}{P}\right)^p, \quad
L_{10h} = \frac{10^6}{60 n}\left(\frac{C}{P}\right)^p
\]

where \(p = 3\) (ball) or \(10/3\) (roller), \(C\) is the basic dynamic load rating, and \(P\) is the dynamic equivalent load.

Modified rating life (ISO 281 screening):

\[
L_{nm} = a_1 \, a_{\mathrm{ISO}} \, \left(\frac{C}{P}\right)^p \frac{10^6}{60 n}
\]

Reliability factor \(a_1\) scales life for reliability other than 90%. The life modification factor \(a_{\mathrm{ISO}}\) (often called \(a_{\mathrm{SKF}}\) in catalog practice) depends on viscosity ratio \(\kappa = \nu/\nu_1\), contamination \(e_C\), and fatigue load limit \(P_u\).

Static safety (ISO 76):

\[
s_0 = \frac{C_0}{P_0}
\]

Dynamic utilization is commonly reported as \(P/C\) (lower is more conservative for a fixed life target).

## Worked examples

### 1. Conveyor roller (deep groove)

**Given:** Deep-groove application, \(F_r = 4.5\,\mathrm{kN}\), \(F_a = 1.2\,\mathrm{kN}\), \(n = 1800\,\mathrm{rpm}\), target \(L_{10h} = 20{,}000\,\mathrm{h}\), grease, moderate cleanliness, 90% reliability.

1. Form equivalent dynamic load \(P\) from Fr, Fa and the type’s X, Y factors (calculator / catalog). Suppose \(P \approx 5.1\,\mathrm{kN}\).
2. Required \(C\) for ball bearing (\(p=3\)):

\[
\left(\frac{C}{P}\right)^3 = L_{10h}\cdot\frac{60 n}{10^6}
= 20000\cdot\frac{60\cdot 1800}{10^6} = 2160
\quad\Rightarrow\quad
\frac{C}{P} \approx 12.9
\quad\Rightarrow\quad
C \approx 66\,\mathrm{kN}
\]

3. Screen catalog deep-groove bearings with bore matching the shaft, \(C \gtrsim 66\,\mathrm{kN}\), check \(C_0/P_0\), limiting speed, and grease life.
4. Apply modified life if \(\kappa\) and \(e_C\) are known; a low \(\kappa\) can cut \(L_{nm}\) well below basic \(L_{10h}\).

**Try it:** [System Designer](/products/bearings/designer?intent=design&type=deep_groove)

**Interpretation:** Meeting basic \(L_{10h}\) on paper is not enough if lubricant film or contamination is poor—always review \(a_{\mathrm{ISO}}\) factors.

### 2. Electric motor L₁₀ (high speed)

**Given:** Deep-groove motor bearing, \(F_r = 2.0\,\mathrm{kN}\), \(F_a = 0.4\,\mathrm{kN}\), \(n = 3600\,\mathrm{rpm}\), target \(L_{10h} = 40{,}000\,\mathrm{h}\), grease-filled 2RS, clean enclosure.

1. Check Fa/Fr against type factor \(e\); form \(P\).
2. Back-calculate required \(C\) at 3600 rpm (life in hours shrinks as \(n\) rises for the same \(C/P\)).
3. Verify limiting / reference speed for grease, min load against skidding, and relubrication interval if open.
4. Prefer sealed deep-groove with adequate C3 clearance when thermal growth is expected.

**Try it:** [Service check](/products/bearings/designer?intent=service&type=deep_groove&example=motor)

### 3. Angular contact / ballscrew (duplex)

**Given:** Angular-contact pair for a ballscrew support, \(F_r = 1.5\,\mathrm{kN}\), \(F_a = 3.0\,\mathrm{kN}\), \(n = 2500\,\mathrm{rpm}\), target \(L_{10h} = 10{,}000\,\mathrm{h}\), O (back-to-back) arrangement with light preload.

1. Use angular-contact X, Y factors; Fa usually dominates → combined \(P\).
2. Size for duplex life (Weibull combination of stations) and check Ka / moment stiffness for the O arrangement.
3. Confirm preload class vs thermal growth; face-to-face (X) if misalignment dominates.
4. Hand off designation into Selection Expert mode for κ, contamination, and fits.

**Try it:** [Designer (angular)](/products/bearings/designer?intent=design&type=angular_contact)

## Standards scope (ISO 281 / 76 / 492 / ABMA)

### ISO 281 — Dynamic load ratings and rating life
Defines basic and modified rating life, equivalent dynamic load \(P\), reliability factor \(a_1\), and life modification \(a_{\mathrm{ISO}}\) from \(\kappa\), \(e_C\), and \(P_u\). PhyCalcPro’s Life and Selection tools use this screening form. **Limits:** not a substitute for full elastic FEA (ISO 16281) or vendor GBLM.

### ISO 76 — Static load ratings
Defines basic static load rating \(C_0\), equivalent static load \(P_0\), and safety factor \(s_0 = C_0/P_0\). Use for peak / shock / start-up checks even when life is adequate.

### ISO 492 — Dimensional and running accuracy (radial bearings)
Tolerance classes (Normal, P6, P5, …) for bore, OD, width, and running accuracy. Selection of P5/P4 is a manufacturing / precision decision — the calculator screens life and load; specify accuracy class on the purchase order.

### ABMA / ANSI (inch series)
ABMA standards cover inch designations, load ratings conventions, and US customary presentation. PhyCalcPro’s catalog includes inch-series entries with geometry in inches where authored; physics remains ISO 281/76 screening unless an ABMA-specific method is stated.

## Common mistakes and checks

- Ignoring **axial load** on deep-groove bearings (understates \(P\)).
- Using **basic life only** when grease viscosity or contamination is harsh.
- Selecting on \(C\) alone without **static safety** at shock / start-up peaks.
- Forgetting **minimum load** (skidding risk at high speed / light load).
- Locating both ends rigidly without thermal **float** clearance.
- Trusting representative catalog C / C₀ without checking the OEM datasheet for the exact designation.
- Treating ISO 16281 or stress-life screens as full FEA / vendor GBLM.

## FAQ

### What is L10 bearing life?

\(L_{10}\) is the basic rating life: the life that 90% of a large group of identical bearings are expected to exceed under the stated load and speed. \(L_{10h}\) expresses that life in operating hours.

### How do I calculate equivalent bearing load P?

Combine radial and axial loads with type-specific factors X and Y from ISO 281 / catalog tables: \(P = X F_r + Y F_a\) (with rules for when axial load is negligible). PhyCalcPro applies the factors for the selected family.

### What is the difference between C and C0?

\(C\) is the **basic dynamic load rating** used for life. \(C_0\) is the **basic static load rating** used for permanent deformation / static safety \(s_0 = C_0/P_0\).

### When should I use modified life instead of basic L10?

Use modified life whenever lubricant viscosity ratio, cleanliness, or reliability targets matter—i.e. most industrial greases and contaminated environments. Basic \(L_{10}\) assumes reference conditions that are often optimistic.

### How does duplex O vs X arrangement differ?

Back-to-back (O) generally offers higher moment stiffness; face-to-face (X) can be more tolerant of misalignment; tandem (T) shares axial load in one direction. Preload and thermal growth must be checked for all three.

### Can I hand off loads from a shaft model?

Yes. The shaft module can publish bearing reactions and slopes; the bearings calculator can auto-apply Fr and misalignment inputs for ISO 281 screening (axial Fa from gears may still need entry).

## Use the PhyCalcPro calculator

Open the [Bearing Engineering Suite hub](/products/bearings) or the [System Designer](/products/bearings/designer). Use **Design a system** or **Check / diagnose**. Sibling tools: [Database](/products/bearings/database), [Failure guide](/products/bearings/failure), [Plain](/products/bearings/plain), [Housings](/products/bearings/housing). Enter stations and duty; run Calculate; review the decision strip, Verify accordion, and (in Service) Diagnose before freezing the BOM.

**Purpose**

Rolling-element bearing screening per ISO 281 (basic and modified rating life) and ISO 76 static load check. Multi-manufacturer catalog (SKF, FAG, NSK, Timken, NTN) with application profiles, series/sealing filters, and representative C, C₀, geometry, and limiting speed.

**Physics & theory**

Basic rating life L₁₀ is the life in revolutions (or hours at speed n) exceeded by 90% of bearings under constant equivalent load P:

\[
L_{10h} = \frac{a_1 \cdot 10^6}{60 n} \left(\frac{C}{P}\right)^p, \quad p = 3 \text{ (ball)}, \; 10/3 \text{ (roller)}
\]

Modified rating life (ISO 281:2007 / SKF):

\[
L_{nm} = a_1 \cdot a_{\mathrm{SKF}} \cdot (C/P)^p \cdot 10^6 / (60n), \quad a_{\mathrm{SKF}} \equiv a_{\mathrm{ISO}}
\]

where **aSKF** (ISO 281 **aISO**) is computed from viscosity ratio \(\kappa = \nu/\nu_1\), contamination factor eC (\(\eta_c\)), and fatigue load limit Pu (catalog datasheet Pu when available; otherwise estimated as 0.025C for ball, 0.03C for roller).

**Life model ceiling (screening, opt-in):**

| Method | Behavior |
|--------|----------|
| ISO 281 (default) | Lnm = a₁ · aISO · (C/P)^p; optional misalignment life derate a_mis |
| ISO 16281 screen | Adjusts P to P_adj = P · f_clearance · f_misalign · f_distrib (not full ISO 16281:2025 FEA) |
| Stress-life screen | Lnm uses a₁ · aISO · a_stress · … — transparent PhyCalcPro curve; **not SKF GBLM / AFC** |
| Hybrid / full ceramic | ISO 20056-inspired C / speed / life factors on rolling elements |

Shaft FEM handoff can publish bearing slopes (rad) as misalignment (mrad) for the ceiling path.

Static safety (ISO 76): \(s_0 = C_0/P_0\) where \(P_0\) is the equivalent static load.

**Paired arrangements (O / X / T):** treated as first-class engineering objects with preload, stiffness Ka/Kr/Km, axial displacement, thermal preload shift, and rigidity comparison. Loads are split per bearing; system life uses Weibull combination of station modified lives.

**Variable load (ISO 281-1):** optional spectrum computes equivalent load and Palmgren-Miner combined life.

**Governing equations**

\[
L_{10h} = \frac{10^6}{60 n}\left(\frac{C}{P}\right)^p, \quad
L_{nm} = a_1 a_{\mathrm{ISO}} L_{10h,\mathrm{basic}}, \quad
s_0 = \frac{C_0}{P_0}
\]

\[
P = X F_r + Y F_a \quad (\text{type-specific } X,Y)
\]

**Numerical method**

Closed-form ISO 281 / ISO 76 screening over a filtered catalog. Auto-design ranks candidates by life utilization, static safety, and speed margin within bore and type constraints. Optional spectrum and arrangement models adjust P and combine station lives. Defect frequencies use kinematic geometry (Z, Bd, Pd, \(\alpha\)).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Fr, Fa | Radial and axial loads |
| n | Operating speed (rpm) |
| L₁₀h target | Required rating life |
| Application profile | General radial, combined loads, heavy shock, high speed, space limited, thrust, locating/floating |
| Manufacturer | SKF, FAG, NSK, Timken, NTN |
| Bearing family / type | Deep groove, angular contact, NU/NJ/NUP cylindrical, tapered, spherical, needle, self-aligning, thrust |
| Series & sealing | Catalog series and open/shielded/sealed |
| Reliability a₁ | 90–99% |
| Lubricant | Oil or grease (ISO VG) + operating temperature |
| Contamination eC | ISO 281 cleanliness classes |
| Life method | ISO 281 / ISO 16281 screen / stress-life screen |
| Misalignment | Manual mrad and/or shaft FEM slopes |
| Mounting arrangement | Single, O / X / T duplex |
| Variable load spectrum | Optional ISO 281-1 steps |
| Max bore | Shaft diameter constraint for auto-selection |

**Outputs**

- Equivalent loads P and P₀; modified Lnm and basic L₁₀ with a₁, aISO, \(\kappa\), eC, \(\nu/\nu_1\), Pu/P
- Arrangement analysis: preload, Ka/Kr/Km, \(\delta_a\), thermal checks, O/X/T comparison
- Defect frequencies BPFO / BPFI / BSF / FTF (screening)
- Grease life / relubrication; speed margin; friction energy screening
- Catalog recommendation with Explain Recommendation narrative
- Fits, clearance guidance, cross-OEM interchange candidates
- Governing failure mode

**Design codes & checks**

- **ISO 281:2007** — Basic and modified rating life
- **ISO 76** — Static load rating screening
- Catalog limiting speed (grease) and reference speed (oil) where listed
- Defect frequencies — kinematic screening (verify Z, Bd against OEM for CM)

**Assumptions & limitations**

- Constant load and speed unless variable spectrum is enabled
- Pu from catalog with explicit datasheet vs C₀-ratio provenance; user override available
- Representative catalog — not full vendor databases
- Friction is screening Mrr/Msl — not full SKF four-component model
- ISO 16281 and stress-life paths are **screening** only — not vendor GBLM, AFC, Bearinx, or full ISO 16281:2025
- Housing SKUs are screening-class — not full OEM mounted-product databases
- Temperature derating on C above 120 °C (screening factor)

**Verification**

- CI: `bearings-indicative-*.json` (multiple rolling cases)
- Gold harness: `npm run test:bearings-gold` / Vitest `bearingsGold.test.ts`
- Vitest: `engine.test.ts`, `industryParity.test.ts`, `lifeModelCeiling.test.ts`, `auxMounted.test.ts`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md) (Machine / bearings)

**References**

1. ISO 281:2007 — Dynamic load ratings and rating life.
2. ISO 76 — Static load ratings.
3. ISO 492 — Rolling bearings — Radial bearings — Geometrical product specifications (GPS) and tolerance values.
4. ABMA / ANSI B3.x — Inch bearing load ratings and dimensional practices (presentation / designation).
5. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 11.
6. SKF Rolling Bearings Catalogue — application factors and lubrication guidance.
