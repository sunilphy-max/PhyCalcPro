---
seoTitle: "Engineering Material Encyclopedia: Properties, Composition & Selection"
seoDescription: "Look up graded material datasheets — mechanical, thermal, electrical, composition, corrosion, and alternatives — then push properties into PhyCalcPro calculators."
guideHeadline: "How Engineers Select and Compare Materials"
keywords: ["material properties", "Young's modulus", "yield strength", "material selection", "density", "thermal expansion", "material datasheet"]
---

### Material Database (`material-db`)

## How engineers look up material properties

Every stress, deflection, and thermal calculation starts with material data. Engineers need elastic moduli to predict stiffness, yield and ultimate strengths to set allowable loads, density for weight budgets, and thermal expansion coefficients for fit-at-temperature checks. A centralized encyclopedia eliminates transcription errors and ensures every module in a project uses the same property set.

PhyCalcPro's Material Database combines browse/screen of the graded catalog, per-grade datasheets (overview through alternatives at `/products/materials/database/[id]`), and one-click `?material=` handoff into calculators.

This guide covers how to navigate alloy families, open datasheets, compare candidates, and push selected properties into downstream solvers.

## Material families and when to use them

| Family | Typical application | Key selection drivers |
|--------|--------------------|-----------------------|
| Carbon & alloy steel | Shafts, gears, structural frames | High strength-to-cost, weldability |
| Stainless steel | Corrosive environments, food/pharma | Corrosion resistance, hygiene |
| Aluminium alloys | Aerospace, lightweight structures | Low density, machinability |
| Copper alloys | Electrical conductors, bearings | Conductivity, wear resistance |
| Titanium alloys | Aerospace, medical implants | High strength-to-weight, biocompatibility |
| Nickel superalloys | Gas turbines, high-temperature service | Creep resistance above 500 °C |
| Engineering polymers | Housings, insulators, bushings | Low density, electrical insulation |
| Cast iron | Machine bases, engine blocks | Damping, compressive strength |

**Selection tip:** Start from the operating environment — temperature, corrosion, load — then filter by strength, stiffness, and cost per kilogram.

## Engineering workflow

1. **Define requirements** — operating temperature range, load type (static / fatigue / impact), corrosion environment, weight target.
2. **Screen families** — eliminate classes that cannot meet one or more hard constraints.
3. **Compare candidates** — rank by \(\sigma_y / \rho\), \(E / \rho\), cost per kg, machinability, and availability.
4. **Open a datasheet** — review mechanical and secondary properties, standards, and alternatives for flagship grades.
5. **Retrieve properties** — use “Use in …” links or the Materials workspace tab to pull \(E\), \(G\), \(\sigma_y\), \(\sigma_u\), \(\rho\), \(\alpha\) into design modules.
6. **Verify provenance** — confirm values against mill test reports or code-approved tables for certified work.

## Key quantities and formulas

Shear modulus from elastic constants:

\[
G = \frac{E}{2(1+\nu)}
\]

Thermal strain under temperature change \(\Delta T\):

\[
\varepsilon_{\mathrm{th}} = \alpha \,\Delta T
\]

Specific stiffness and specific strength for weight-critical selection:

\[
\frac{E}{\rho}, \quad \frac{\sigma_y}{\rho}
\]

Weight of a component with volume \(V\):

\[
W = \rho \, V \, g
\]

## Worked example

**Given:** Select a shaft material for a 600 rpm pump. Shaft OD 50 mm, must not yield under 200 N·m torque. Mildly corrosive (pH 5 water). Target mass < 8 kg for a 0.6 m length.

1. Shear stress at surface: \(\tau = 16T / (\pi d^3) = 16 \times 200 / (\pi \times 0.05^3) \approx 8.1\) MPa — modest.
2. Corrosion rules out plain carbon steel without coating. Filter to 316 stainless (\(\sigma_y = 205\) MPa, \(\rho = 8000\) kg/m³) and duplex 2205 (\(\sigma_y = 450\) MPa, \(\rho = 7800\) kg/m³).
3. Shaft mass \(\approx \rho \pi d^2 L / 4 \approx 8000 \times 1.18 \times 10^{-3} = 9.4\) kg — exceeds target. Consider Al 7075-T6 (\(\rho = 2810\) kg/m³, \(\sigma_y = 503\) MPa): mass drops to 3.3 kg.
4. Open the AW-7075 T6 datasheet for composition and corrosion notes, then Use in Shafts.

## Common mistakes and checks

- Using **handbook averages** for certified pressure equipment — always confirm against code-approved tables.
- Confusing **0.2 % proof stress** (metals) with **yield stress** (code-dependent definition).
- Ignoring **heat-treatment condition** — 6061-O vs 6061-T6 differ by a factor of five in yield.
- Applying room-temperature properties at **elevated temperature** without derating.
- Forgetting that **cast** vs **wrought** forms of the same alloy have different strengths.

## FAQ

### What is Young's modulus and why does it matter?

Young's modulus \(E\) is the ratio of stress to strain in the elastic range. It controls deflection and stiffness — two parts with the same geometry but different \(E\) will deflect differently under load.

### How do I convert between E and G?

For isotropic materials: \(G = E / [2(1+\nu)]\). Poisson's ratio \(\nu\) is typically 0.27–0.33 for metals. The database stores both; if only \(E\) is listed, the converter applies the standard relation.

### Are database values safe for certified design?

No. The database provides indicative reference values for screening and trade studies. Certified design requires values from mill test certificates, MMPDS, or the applicable design code.

### How does temperature affect listed properties?

Most metals lose strength and stiffness above roughly 200 °C. Link to the Temperature Properties module for derating factors from code tables (ASME, EN). Cryogenic service can increase yield but reduce ductility.

### Can I add custom materials?

Yes — enter custom \(E\), \(\sigma_y\), \(\sigma_u\), \(\rho\), \(\alpha\), and \(\nu\). Custom entries are carried through to every downstream solver that consumes material data.

## Use the PhyCalcPro calculator

Open the [Material encyclopedia](/products/materials/database). Search or browse by alloy family; open a datasheet for full sections; select a material to auto-populate downstream calculators with consistent \(E\), \(G\), \(\sigma_y\), \(\rho\), and \(\alpha\`.

**Purpose**

Searchable encyclopedia for engineering material properties — elastic moduli, strength, density, thermal expansion, composition, and selection guidance — used as defaults across PhyCalcPro modules. Centralizes material selection for consistent handoff to solvers.

**Physics & theory**

Material properties govern every stress, deflection, and thermal calculation. Young's modulus \(E\) and shear modulus \(G\) define elastic stiffness; yield \(\sigma_y\) and ultimate \(\sigma_u\) set strength limits. Density \(\rho\) enters dynamic and weight calculations. Thermal expansion coefficient \(\alpha\) drives thermal strain \(\varepsilon_{\mathrm{th}} = \alpha \Delta T\). The database stores room-temperature baseline values with optional temperature derating hooks to the Temperature Properties module. Properties are indicative — certified design requires mill test reports or code-approved tabulated values.

**Governing equations**

\[
G = \frac{E}{2(1+\nu)}, \quad \sigma = E\,\varepsilon
\]

\[
W = \rho \, V \, g
\]

**Numerical method**

Reference lookup: keyed access to material records by name or alloy designation. No numerical solve — property retrieval and unit conversion to module base SI units.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Material name / alloy | e.g., Steel 4140, Al 6061-T6 |
| Property requested | \(E\), \(G\), \(\sigma_y\), \(\rho\), etc. |
| Temperature (optional) | For derated lookup via Temperature Properties |

**Outputs**

- Property values in selected units, source note, temperature derating factor if linked.

**Design codes & checks**

- **Indicative:** Property reference lookup
- **US:** MMPDS / ASM material datasheets (reference)
- **EU:** EN material standards (reference)

**Assumptions & limitations**

- Room-temperature defaults unless temperature module linked.
- Not a substitute for certified material test certificates.
- Cast vs wrought, grain direction, and heat treatment variants may differ.
- Database completeness varies by alloy family.

**References**

1. ASM International. *ASM Handbook Volume 2 — Properties and Selection*.
2. MMPDS-15. *Metallic Materials Properties Development and Standardization*.
3. MatWeb Material Property Data (reference methodology).
4. ISO 6892-1:2019. *Metallic materials — Tensile testing*.
