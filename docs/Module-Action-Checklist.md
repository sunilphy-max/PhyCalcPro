# Module-by-module action checklist

**Date:** 2026-07-19  
**Audience:** You (engineer / product owner) — what to validate and finish per module  
**Related:** [validation-master-checklist.md](./validation-master-checklist.md) · [Module-Physics-Design-Audit.md](./Module-Physics-Design-Audit.md) · [VerificationGuide.md](./VerificationGuide.md) · [manual-release-tier-guide.md](./manual-release-tier-guide.md)

## How to use this

For each module you care about in production:

1. Run **Validate** with a known textbook / code / vendor example.
2. Run **Auto-design** and confirm geometry is sensible; **Compare → Apply** once.
3. Check Calculation Spec / limitations text matches what you believe.
4. Tick **Physics** / **Standards** / **Design** below when signed off.
5. Add a verification JSON if the case should stay in CI (`src/data/verification/`).
6. Promote `validationStatus` only after sign-off ([manual-release-tier-guide.md](./manual-release-tier-guide.md)).

| Priority | Meaning |
|----------|---------|
| **P0** | Production-critical path — do first |
| **P1** | Important for credibility / common workflows |
| **P2** | Screening / long-tail — as needed |

| Status field | Meaning |
|--------------|---------|
| **CI** | Passing cases in `src/data/verification/` (fleet: 86/86 as of last run) |
| **Design** | Auto-design maturity / quality |
| **Spec eval** | Specialized code evaluator (only beams, columns, gears, combined-loading, welds) |
| **Catalog** | Public `validationStatus` (mostly `indicative`; beta on a few flagships; draft on cost/cam-toolpaths) |

**Fleet gaps to know up front**

- No modules are **`verified`** yet — engineer worksheets still required.
- **`material-db`** is the only module without a CI solver + verification JSON.
- Specialized evaluators exist for **5 modules only**; the rest use generic screening mapping.
- Bearings vendor gold (`pending_vendor_gold`) still needs SKF/MITCalc paste.

---

## Recommended sequence (do these first)

1. Close CI hole: **material-db**
2. Power-train critical path: **shafts → bearings (+ vendor gold) → gears → springs → bolts / keys**
3. Structural: **beams → columns → combined-loading**
4. Belts/drives: **motor → v-belts → timing-belts → roller-chains**
5. Pressure: **pipes → vessels**
6. Promote signed-off modules `beta` → `verified`
7. Long-tail P2 only as customers pull you there

---

## Structural

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **beams** | P0 | yes (~2) | deep / solver | beta | yes | Closed-form M/δ (SS + cantilever); AISC/EC3 spot-check if used | Document LTB exclusion or add check; worksheet → promote **verified** | [ ] Physics [ ] Standards [ ] Design |
| **columns** | P0 | yes | deep / solver | beta | yes | Euler + AISC/EC3 curve SF vs worksheet | Flag inelastic buckling as partial; Auto-design SF spot-check; → **verified** | [ ] P [ ] S [ ] D |
| **combined-loading** | P0 | yes | deep / solver | beta | yes | Von Mises/Tresca vs textbook; confirm RSS torsion+shear | Replace square Ø proxy with true circular section props; → **verified** | [ ] P [ ] S [ ] D |
| **frames** | P1 | yes | solid | indicative | no | 2–3 bay reactions vs hand or SAP2000 | Keep plastic hinge / connections out of scope in UI copy | [ ] P [ ] S [ ] D |
| **trusses** | P1 | yes | solid | indicative | no | Pratt/Warren forces vs method of joints | Confirm joint detailing limitation text | [ ] P [ ] S [ ] D |
| **plates** | P1 | yes | solid | indicative | no | Roark simply-supported deflection | Orthotropic/stiffeners remain gaps | [ ] P [ ] S [ ] D |
| **circular-plates** | P1 | yes | deep | indicative | no | Uniform pressure vs Roark table | Annular / variable-t out of scope; archive FDM vs Roark sign-off | [ ] P [ ] S [ ] D |
| **shells** | P1 | yes | solid | indicative | no | Thin-shell hoop/axial/bending textbook | Buckling modes not embedded — document | [ ] P [ ] S [ ] D |

---

## Power transmission

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **v-belts** | P0 | yes | deep | indicative | no* | Gates/OEM power-table example | Vendor rating tables; motor→shaft handoff; consider → beta after sign-off | [ ] P [ ] S [ ] D |
| **timing-belts** | P0 | yes | deep | indicative | no* | Tooth count / C vs manufacturer datasheet | Manufacturer power tables; Apply units = mm | [ ] P [ ] S [ ] D |
| **roller-chains** | P1 | yes | solid | indicative | no | Tension vs ANSI B29.1 table | Full ISO life curves incomplete | [ ] P [ ] S [ ] D |
| **multi-pulley** | P1 | yes | shallow | indicative | no | Belt length/wrap vs CAD | Closed-loop layout (open chain today); set maturity override → solver-backed | [ ] P [ ] S [ ] D |

\*Has check templates, not a specialized code evaluator.

---

## Machine

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **shafts** | P0 | yes (~2) | deep | indicative | no | DIN 743 / Shigley (bend, torsion, Kt, n_cr) | Full DIN 743 / AGMA 6001 partial; handoff → keys/bearings; raise catalog → beta | [ ] P [ ] S [ ] D |
| **gears** | P0 | yes | deep | beta | yes | ISO 6336/AGMA vs MITCalc/vendor | Full worksheet out of scope; AGMA micropitting planned; → **verified** | [ ] P [ ] S [ ] D |
| **bevel-gears** | P1 | yes | deep | indicative | no | Cone distance/forces vs Gleason screen | Full AGMA bevel rating gap | [ ] P [ ] S [ ] D |
| **worm-gears** | P1 | yes | solid | indicative | no | Efficiency + thermal vs vendor | Efficiency maps gap | [ ] P [ ] S [ ] D |
| **planetary-gears** | P1 | yes | solid | indicative | no | Willis equation + load-share assumption | Load sharing not modeled | [ ] P [ ] S [ ] D |
| **internal-gears-rack** | P1 | yes (~2) | shallow | indicative | no | Internal spur path OK | Rack contact geometry indicative only — don’t overclaim | [ ] P [ ] S [ ] D |
| **power-screws** | P1 | yes (~2) | shallow | indicative | no | Efficiency/torque vs lead-screw catalog | Dedicated lead-screw catalog (proxy sizing today) | [ ] P [ ] S [ ] D |
| **cams** | P1 | yes | solid | indicative | no | s/v/a vs polynomial cam text | CAM toolpath link; baseRadius Apply = m | [ ] P [ ] S [ ] D |
| **flywheels** | P1 | yes | deep | indicative | no | Energy vs ½Iω² | Spoke/rim FEA out of scope; OD/t Apply = m | [ ] P [ ] S [ ] D |
| **brakes-clutches** | P1 | yes | solid | indicative | no | Torque vs μ×N | Thermal fade models gap | [ ] P [ ] S [ ] D |
| **gear-ratio-design** | P2 | yes | solid | indicative | no | Stage ratios vs layout drawing | Multi-stage optimizer gap | [ ] P [ ] S [ ] D |

---

## Bearings

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **bearings** | P0 | yes (~12) | deep | beta | no | ISO 281 Lnm/L10, ISO 76, speed margin | **Paste SKF/MITCalc ±5% vendor gold**; `npm run test:bearings-gold`; → **verified** | [ ] P [ ] S [ ] D |
| **plain-bearings** | P1 | yes (~3) | deep | indicative | no | Sommerfeld / Raimondi–Boyd chart | Full ISO 7902 maps gap | [ ] P [ ] S [ ] D |
| **housing** | P1 | yes | solid | indicative | no | Bracket moment + bolt loads vs hand/VDI | Cast FEA out of scope; handoff → bolts | [ ] P [ ] S [ ] D |

---

## Springs

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **compression-springs** | P0 | yes (~2) | deep | indicative | no* | EN 13906-1 static + fatigue vs nomograph | See `docs/modules/spring-modules-user-tasks.md`; nomograph digitization gap; → beta | [ ] P [ ] S [ ] D |
| **extension-springs** | P0 | yes | solid | indicative | no* | Hook stress + Fi vs MITCalc | Hook FEA / EN 13906-2 gap | [ ] P [ ] S [ ] D |
| **torsion-springs** | P0 | yes | solid | indicative | no* | Rate k=Ed⁴/(64Dn) vs Shigley Ex. 10-4 | Re-baseline old projects; leg junction FEA gap | [ ] P [ ] S [ ] D |

---

## Fasteners

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **bolts** | P0 | yes | solid | indicative | no | VDI 2230 / AISC joint example | Full multi-bolt VDI still screening-depth; pattern share spot-check | [ ] P [ ] S [ ] D |
| **welds** | P0 | yes | deep | beta | yes | AWS/EN throat + eccentric vs hand | Full group worksheets partial; → **verified** | [ ] P [ ] S [ ] D |
| **keys-splines** | P0 | yes | solid† | indicative | no* | Key shear/bearing vs ISO 3912 / Shigley | Involute spline DIN gap; set maturity override → solver-backed | [ ] P [ ] S [ ] D |
| **rivets** | P1 | yes | solid | indicative | no | Single-shear/bearing vs Shigley/MIL | Group patterns gap | [ ] P [ ] S [ ] D |
| **shaft-hubs** | P1 | yes | solid | indicative | no | Interference pressure vs DIN 7190 | Press-fit FEA out of scope; interference Apply = mm | [ ] P [ ] S [ ] D |
| **pins** | P1 | yes | solid | indicative | no | Double shear vs Shigley table | Clevis geometry detail; pinDiameter Apply = mm | [ ] P [ ] S [ ] D |

†Audit lists solver-backed; confirm maturity override is set.

---

## Materials & sections

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **material-db** | P0 | **no** | catalog | indicative | no | Spot-check E/ν/Sy vs MMPDS for alloys you ship | **Add CI solver + verification JSON** (only fleet hole); temp/corrosion couple | [ ] P [ ] S [ ] D |
| **fatigue** | P0 | yes | deep | indicative | no | Goodman/Gerber + Marin vs Shigley Ex. 6-1 | Kt/Kf spectra not automatic; Sa Apply = MPa | [ ] P [ ] S [ ] D |
| **rolled-sections** | P1 | yes | catalog | indicative | no | W/HSS vs AISC manual | EN/UK designation aliases (roadmap) | [ ] P [ ] S [ ] D |
| **sections** | P2 | yes | catalog | indicative | no | I/A/c vs CAD | — | [ ] P [ ] S [ ] D |
| **profiles** | P2 | yes | catalog | indicative | no | Polygon I/A/c vs hand | — | [ ] P [ ] S [ ] D |
| **composites** | P2 | yes | shallow | indicative | no | CLT vs Jones lamina screen | Full CLT gap | [ ] P [ ] S [ ] D |
| **temperature-properties** | P2 | yes | shallow | indicative | no | Derating vs code table | Full curves gap | [ ] P [ ] S [ ] D |
| **corrosion** | P2 | yes | shallow | indicative | no | Allowance vs API 510 / company spec | Environment DB gap | [ ] P [ ] S [ ] D |

---

## Pressure

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **pipes** | P0 | yes | deep | indicative | no | Barlow / B31.3 categories vs example | Full B31.3 worksheets partial; thickness Apply = m | [ ] P [ ] S [ ] D |
| **vessels** | P0 | yes | solid | indicative | no | Thin/thick vs ASME VIII UG-27 | Full ASME VIII / EN 13445 worksheets gap | [ ] P [ ] S [ ] D |
| **hydraulics** | P1 | yes | solid | indicative | no | Force vs catalog | Seal/buckling gap | [ ] P [ ] S [ ] D |
| **heat-exchangers** | P2 | yes | shallow | indicative | no | LMTD/NTU screen vs reference | NTU geometry gap | [ ] P [ ] S [ ] D |

---

## Dynamics

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **motor** | P0 | yes | solid | indicative | no | T=P/ω vs nameplate | IEC frame catalog; power-train entry sign-off | [ ] P [ ] S [ ] D |
| **vibrations** | P1 | yes (~2) | solid | indicative | no | ω₁ vs analytical beam; ζ / damped fn | Full modal FEA out of scope | [ ] P [ ] S [ ] D |
| **impact** | P1 | yes | solid | indicative | no | Impulse vs energy method | Contact FEA out of scope | [ ] P [ ] S [ ] D |
| **rotation** | P2 | yes | shallow | indicative | no | Centripetal/KE textbook | Rotor dynamics gap | [ ] P [ ] S [ ] D |
| **suspension** | P2 | yes | solid | indicative | no | Roll angle / load transfer | Full vehicle model gap | [ ] P [ ] S [ ] D |

---

## Manufacturing

| Module | Pri | CI | Design | Catalog | Spec eval | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|-----------|------------------|--------------------------------|------|
| **fits** | P1 | yes | solid | indicative | no | ISO 286 hole/shaft vs tables | Expand fit tables if customers need more classes | [ ] P [ ] S [ ] D |
| **tolerance** | P2 | yes | shallow | indicative | no | RSS vs worst-case drawing | GD&T datum chain gap | [ ] P [ ] S [ ] D |
| **cost-estimator** | P2 | yes | shallow / workflow | **draft** | no | Calibrate to shop rates | Cost DB; keep **draft** until calibrated | [ ] P [ ] S [ ] D |
| **cam-toolpaths** | P2 | yes | shallow / workflow | **draft** | no | Path length/time vs CAM post | No CAM kernel — keep **draft** | [ ] P [ ] S [ ] D |

---

## Advanced systems

Treat as **screening** until you have vendor/test data. Keep `workflow` modules honest until reverse solvers exist.

| Module | Pri | CI | Design | Catalog | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|------------------|--------------------------------|------|
| **vacuum-engineering** | P2 | yes | shallow | indicative | Pump-down vs vendor curve | Coupled outgassing | [ ] P [ ] S [ ] D |
| **cryogenic-engineering** | P2 | yes | shallow | indicative | Heat leak/boil-off vs supplier | MLI vendor data | [ ] P [ ] S [ ] D |
| **magnetic-fields** | P2 | yes | shallow | indicative | B vs Biot–Savart/simple FEM | FEA magnetics | [ ] P [ ] S [ ] D |
| **battery-ev-systems** | P2 | yes | shallow | indicative | Pack energy/C-rate vs cell datasheet | Cell aging | [ ] P [ ] S [ ] D |
| **superconducting-systems** | P2 | yes | workflow | indicative | Ic(B,T) margin vs material | Quench models; stay workflow | [ ] P [ ] S [ ] D |
| **thermal-management** | P2 | yes | workflow | indicative | Junction T vs 1D R network | CFD couple; stay workflow | [ ] P [ ] S [ ] D |
| **hydrogen-systems** | P2 | yes | workflow | indicative | Storage P/flow vs safety case | B31.12/NFPA 2 incomplete | [ ] P [ ] S [ ] D |
| **precision-motion** | P2 | yes | workflow | indicative | Error budget vs encoder/backlash | ISO 230 full; stay workflow | [ ] P [ ] S [ ] D |

---

## Tools

| Module | Pri | CI | Design | Catalog | Your validations | Improvements / pending actions | Done |
|--------|-----|----|--------|---------|------------------|--------------------------------|------|
| **load-case-manager** | P1 | yes | catalog | indicative | Envelope max/min vs manual combos | Full LC matrix gap | [ ] P [ ] S [ ] D |
| **safety-factor** | P1 | yes | catalog* | indicative | SF definitions match company standard | Diameter sweep exists via design path | [ ] P [ ] S [ ] D |
| **formula-reference** | P2 | yes | none | indicative | Spot-check 5 formulas vs Roark/Shigley | Validate-only by design | [ ] P [ ] S [ ] D |
| **unit-converter** | P2 | yes | none | indicative | NIST factors for critical pairs | Validate-only by design | [ ] P [ ] S [ ] D |

\*Diameter sweep via fastener design routing.

---

## Cross-cutting backlog (not module-specific)

| Action | Why |
|--------|-----|
| Engineer worksheet sign-off → promote beta → verified | Marketing honesty / PE trust |
| Paste bearings vendor gold ±5% | Closes highest-visibility gold gap |
| Add specialized evaluators beyond 5 flagships | Standards panel accuracy |
| True circular section in combined-loading | Physics accuracy of Auto-design |
| Closed-loop multi-pulley | Layout completeness |
| EN/UK rolled-section aliases | Catalog usability |
| Keep advanced `workflow` modules from overclaiming | Trust |

---

## Sign-off log (optional)

| Date | Module | Reference (book/code/vendor) | Tolerance | Signed |
|------|--------|------------------------------|-----------|--------|
| | | | | |
| | | | | |
