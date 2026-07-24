# Module Physics & Auto-design Audit

**Date:** 2026-07-19  
**Focus:** Physics accuracy, Auto-design / Compare depth, MITCalc-style sizing quality  
**Related:** [Design-Workflow-Reference.md](./Design-Workflow-Reference.md) · [Product-Roadmap-Gaps.md](./Product-Roadmap-Gaps.md) · [validation-master-checklist.md](./validation-master-checklist.md)

## Summary

| Metric | Status (2026-07-21) |
|--------|---------------------|
| Workflow modes | Fleet-wide **Auto-design / Validate / Compare / Diagnose** |
| Diagnose engines | Dedicated: bearings suite + shafts, gears, bolts, welds, springs, beams, columns; generic `diagnoseFromChecks` elsewhere |
| Critical fix | `bearings` catalog category routes to `designMachineModule` |
| Residual `workflow` maturity | Promoted residual advanced/manufacturing screens to solver/catalog-backed with honest gaps |
| Next-tier deepen | Vendor gold, full ISO/ASME worksheets, quench/CAM/CFD (documented gaps) |

**Quality legend**

| Design quality | Meaning |
|----------------|---------|
| **deep** | Standard series × live loads × real engine SF; Apply fields match form |
| **solid** | Engine-backed sweep; catalog or 1D grid adequate for screening |
| **shallow** | Thin grid / proxy sizing; useful Compare but not MITCalc-complete |
| **none** | Validate-only or empty ranked set by design |

---

## Structural

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| beams | `structural/beams` | solver-backed | deep | yes | Rolled-section search (stress + deflection) | LTB / connection detail |
| columns | `structural/columns` | solver-backed | deep | yes | Catalog SF search | Inelastic / code curves |
| frames | `structural/frames` | solver-backed | solid | yes | Rolled-section proxy | Plastic hinge / connections |
| trusses | `structural/trusses` | solver-backed | solid | yes | Member area sweep | Joint detailing |
| plates | `structural/plates` | solver-backed | solid | yes | Thickness vs defl/stress | Orthotropic / stiffeners |
| circular-plates | `structural/circular-plates` | solver-backed | deep | yes | Thickness vs defl **and** stress; Roark check | Annular / variable t |
| shells | `structural/shells` | solver-backed | solid | yes | Wall thickness SF | Buckling modes |
| combined-loading | `structural/combinedLoading` | solver-backed | deep | yes | Round Ø sweep (**true circular A/I/J**) | Connection detail |

---

## Power transmission

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| v-belts | `powerTransmission/v-belts` | solver-backed | deep | yes | Section + pulley sizing | Vendor rating tables |
| timing-belts | `powerTransmission/timing-belts` | solver-backed | deep | yes | Pitch × teeth × width | Manufacturer power tables |
| roller-chains | `powerTransmission/roller-chains` | solver-backed | solid | yes | Pitch × strands | ISO life curves full set |
| multi-pulley | `powerTransmission/multi-pulley` | solver-backed | solid | yes | Closed 3-pulley wrap/length screen | Serpentine tensioner catalogs |

---

## Machine

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| gears | `machine/gears` | solver-backed | deep | yes | Tooth + module sweeps | Full ISO 6336 worksheet |
| shafts | `machine/shafts` | solver-backed | deep | yes | ISO diameters + live loads | Full DIN 743 / AGMA 6001 |
| bevel-gears | `machine/bevel-gears` | solver-backed | deep | yes | ISO 54 m × face width | Full AGMA bevel rating |
| worm-gears | `machine/worm-gears` | solver-backed | solid | yes | Module × z₂ | Efficiency maps |
| planetary-gears | `machine/planetary-gears` | solver-backed | solid | yes | Sun/planet ratio match | Load sharing |
| gear-ratio-design | `machine/gear-ratio-design` | solver-backed | solid | yes | Tooth-count optimizer | Multi-stage |
| internal-gears-rack | `machine/internal-gears-rack` | solver-backed | solid | yes | Dedicated Lewis + contact sweep | Full ISO rack worksheets |
| power-screws | `machine/power-screws` | solver-backed | solid | yes | Diameter×pitch live screw engine | Vendor lead-screw catalogs |
| flywheels | `machine/flywheels` | solver-backed | deep | yes | OD×thickness energy + hoop | Spoke / rim FEA |
| cams | `machine/cams` | solver-backed | solid | yes | Base radius vs α≤30° | Cam toolpath CAM link |
| brakes-clutches | `machine/brakes-clutches` | solver-backed | solid | yes | Disc Ø for torque | Thermal fade models |

---

## Bearings

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| bearings | `machine/bearings` | solver-backed | deep | yes | ISO 281 C + catalog rank (**routing fixed**) | Vendor gold ±5% |
| plain-bearings | `machine/plain-bearings` | solver-backed | deep | yes | Ø × L/D for h_min + p | Full ISO 7902 maps |
| housing | `machine/housing` | solver-backed | solid | yes | Bolt pattern / body SF | Cast housing FEA |

---

## Springs

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| compression-springs | springs engine | solver-backed | deep | yes | Wire/coil catalog pilot | EN 13906 nomograph |
| extension-springs | springs engine | solver-backed | solid | yes | Wire/coil + hook SF | Hook FEA |
| torsion-springs | springs engine | solver-backed | solid | yes | Wire/coil bend SF | Leg junction FEA |

---

## Fasteners

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| bolts | fasteners/bolts | solver-backed | solid | yes | ISO coarse thread shear | Full VDI 2230 system |
| welds | fasteners/welds | solver-backed | deep | yes | Leg catalog + eccentric throat | AWS/EN group worksheets |
| rivets | fasteners/rivets | solver-backed | solid | yes | Diameter catalog | Group patterns |
| keys-splines | fasteners/keys-splines | solver-backed | solid | yes | Parallel key sizes | Involute spline DIN |
| shaft-hubs | fasteners/shaft-hubs | solver-backed | solid | yes | Interference (mm) vs torque | Press-fit FEA |
| pins | fasteners/pins | solver-backed | solid | yes | Ø catalog shear/bearing | Clevis geometry |

---

## Materials

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| material-db | catalog service | catalog-backed | solid | — | Strength ranking | Temp/corrosion couple |
| sections / rolled-sections / profiles | engines | catalog-backed | solid | yes | I / rolled lookup | EN/UK aliases |
| fatigue | materials/fatigue | solver-backed | deep | yes | Ø sweep Sa∝1/d³ + Marin | Kt/Kf spectra |
| corrosion | materials/corrosion | catalog-backed | shallow | yes | Rate vs life | Environment DB |
| composites | materials/composites | catalog-backed | shallow | yes | Ply-count screen | CLT full |
| temperature-properties | materials/temperature | catalog-backed | shallow | yes | Derating screen | Full curves |

---

## Pressure

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| pipes | pressure/pipes | solver-backed | deep | yes | Schedule-like wall vs hoop | Full B31.3 worksheets |
| vessels | pressure/vessels | solver-backed | solid | yes | Wall vs hoop | ASME VIII / EN 13445 |
| hydraulics | pressure/hydraulics | solver-backed | solid | yes | Bore from F/p | Seal / buckling |
| heat-exchangers | pressure/heat-exchangers | solver-backed | shallow | yes | UA class screen | NTU geometry |

---

## Dynamics

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| motor | dynamics/motor | solver-backed | solid | yes | Pole/frame class | IEC frame catalog |
| vibrations | dynamics/vibrations | solver-backed | solid | yes | I for ≥20% separation | Full modal FEA |
| rotation | dynamics/rotation | solver-backed | shallow | yes | Radius vs centripetal | Rotor dynamics |
| impact | dynamics/impact | solver-backed | solid | yes | Area vs dynamic SF | Contact FEA |
| suspension | dynamics/suspension | solver-backed | solid | yes | Roll stiffness | Full vehicle model |

---

## Manufacturing

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| tolerance | manufacturing/tolerance | solver-backed | shallow | yes | Bilateral allocation | GD&T datum chain |
| fits | manufacturing/fits | solver-backed | solid | yes | ISO 286 class pick | Full fit tables |
| cost-estimator | manufacturing/cost | catalog-backed | solid | yes | Process/rate catalog vs live totalCost | Shop-rate DB |
| cam-toolpaths | manufacturing/cam-toolpaths | solver-backed | solid | yes | Feed×stepover vs live cut time | Full CAM kernel |

---

## Advanced systems

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| vacuum-engineering | advanced | solver-backed | shallow | yes | Pump/conductance screen | Coupled outgassing |
| cryogenic-engineering | advanced | solver-backed | shallow | yes | Heat leak / boil-off | MLI vendor data |
| magnetic-fields | advanced | solver-backed | shallow | yes | B / force / heat | FEA magnetics |
| battery-ev-systems | advanced | solver-backed | shallow | yes | Pack / cooling / busbar | Cell aging |
| superconducting-systems | advanced | solver-backed | solid | yes | Live current/energy sweep | Quench models |
| thermal-management | advanced | solver-backed | solid | yes | Live h sweep | CFD couple |
| hydrogen-systems | advanced | solver-backed | solid | yes | Live orifice sweep | Code compliance |
| precision-motion | advanced | solver-backed | solid | yes | Live flexure sweep | ISO 230 full |

---

## Tools

| Module | Validate engine | Maturity | Design quality | Verification | Physics / MITCalc notes | Remaining gaps |
|--------|-----------------|----------|----------------|--------------|-------------------------|----------------|
| unit-converter | tools | catalog-backed | none | yes | Validate-only by design | — |

\*Routed via `designFastenerModule` with diameter sweep; maturity remains catalog/tools family unless overridden.

---

## Apply-field unit contract (design solvers → form)

| Module | Field(s) | Unit in `fields` |
|--------|----------|------------------|
| welds | `weldSize` | m |
| rivets | `rivetDiameter` | m |
| pins | `pinDiameter` | mm |
| shaft-hubs | `interference` | mm |
| flywheels | `outerDiameter`, `thickness` | m |
| cams | `baseCircle` / `baseRadius` | m |
| timing-belts | `pitch`, `beltWidth` | mm |
| pipes / vessels | `thickness` | m |
| circular-plates | `thickness` | mm |
| combined-loading | `diameter`, `width`, `height` | m |
| fatigue | `alternatingStress` | MPa |
| bevel-gears | `module`, `faceWidth` | mm |

Regression: `src/lib/design-workflows/designModeRegistry.test.ts`.

---

## Recommended next physics work (not in this pass)

1. Engineer worksheet sign-off on shafts → bearings → gears → springs → beams/columns ([validation-master-checklist.md](./validation-master-checklist.md)).
2. True circular section properties in combined-loading (replace square proxy).
3. Vendor gold bearings cases (`pending_vendor_gold`).
4. Advanced-systems: promote only when dedicated reverse solvers exist (keep honest `workflow` until then).
5. Specialized code evaluators beyond beams/columns/gears/combined-loading/welds.
