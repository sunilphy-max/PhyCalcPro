# Unit coverage audit — Auto-design, Validate, Compare

Last updated: 2026-06-18

## Summary

PhyCalcPro stores all numeric inputs internally in SI base units and converts at the UI boundary. **Validate** mode uses `ModuleUnitSelect` on each module’s `*Inputs` form. **Auto-design** and **Compare** use the cyan **Design targets** panel (`DesignTargetFields`) unless the module embeds targets inline.

### Root cause (shaft example)

Shafts (and several other machine modules) previously fell back to the generic **machine** category template, which only exposed **power** and **rpm** — not torque, bending moment, or axial load. Design-target unit dropdowns were also restricted to short lists from `moduleProfiles` instead of the full physics catalog.

### Fixes applied

1. **`DesignTargetFields`** — uses `ModuleUnitSelect` without `restrictToProfile`, so every compatible unit for the physics dimension is available (same rule as Validate per `AGENTS.md`).
2. **`designInputFieldRegistry.ts`** — per-module overrides for machine, dynamics, pressure, and spring modules (shafts now: power, rpm, torque, bending moment, SF).
3. **`moduleProfiles.ts`** — expanded defaults (e.g. `kN·m`, `rad/s`, `energy`, `speed` on plain bearings / cams / rotation).
4. **`machineDesign.resolveShaftLoads`** — torque `0` or unset + power/rpm → derived torque.
5. **`designTargetUnits.ts`** — added `energy`, `mass`, `velocity` dimensions.

---

## How units work by mode

| Mode | UI location | Unit control | Available units |
|------|-------------|--------------|-----------------|
| **Validate** | Module `*Inputs` | `ModuleUnitSelect` | All units for the field’s physics dimension (unless `restrictToProfile` — not used today) |
| **Auto-design** | Cyan “Design targets” box | `ModuleUnitSelect` or `UnitSelector` | Full physics catalog for that dimension |
| **Compare** | Same as Auto-design | Same | Same |
| **Inline targets** | Inside `*Inputs` (beams, columns, compression springs, v-belts) | `ModuleUnitSelect` on those fields | Full catalog |

Profile entries in `moduleProfiles.ts` set **default units** when the design code changes (via `useDesignCodeUnits`). They no longer limit dropdown choices in design-target mode.

---

## Physics dimensions reference

| Dimension | Example units (full list in `src/lib/physics/units.ts`) |
|-----------|-----------------------------------------------------------|
| length | m, mm, cm, µm, ft, in |
| force | N, kN, lbf |
| stress / pressure | Pa, kPa, MPa, GPa, bar, psi, ksi |
| moment / torque | N·m, kN·m, lbf·ft |
| power | W, kW, hp |
| frequency | Hz, kHz, rpm, rad/s |
| time | s, min, hr, year |
| energy | J, kJ, ft·lbf |
| mass | kg, lb |
| velocity | m/s, ft/s, km/h, mm/s |
| temperature | °C, K, °F |
| area | m², mm², cm², in², ft² |
| inertia | m⁴, mm⁴, in⁴ |
| density | kg/m³, g/cm³, lb/ft³ |
| volume flow | m³/s, L/min, gpm |
| force per length | N/m, kN/m, lbf/ft |
| inverse temperature | 1/°C, 1/K, 1/°F |

---

## Per-module design targets (Auto-design / Compare)

Modules with **inline** targets (no cyan box): `beams`, `columns`, `compression-springs`, `v-belts`.

| Module | Design target fields | Key units |
|--------|---------------------|-----------|
| **shafts** | Power, speed, torque (optional), bending moment, SF | kW/W/hp, rpm/Hz/rad/s, N·m/kN·m/lbf·ft |
| **gears** | Power, pinion speed, ratio, SF | kW, rpm, — |
| **bevel-gears** | Power, speed, ratio, SF | kW, rpm |
| **worm-gears** | Power, speed, ratio, SF | kW, rpm |
| **planetary-gears** | Power, speed, ratio, SF | kW, rpm |
| **gear-ratio-design** | Target ratio, tolerance | — |
| **bearings** | Radial load, axial load, speed, L10 life, reliability | N/kN/lbf, rpm, hr/s/min/year |
| **plain-bearings** | Radial load, journal speed, SF | N, rpm |
| **flywheels** | Stored energy, speed, SF | J/kJ/ft·lbf, rpm |
| **cams** | Peak lift, cam speed, margin | mm/m/in, rpm |
| **brakes-clutches** | Actuation force, torque, slip speed, SF | N, N·m, rpm |
| **roller-chains** | Power, driver speed, ratio, service factor | kW, rpm |
| **multi-pulley** | Power, driver speed, service factor | kW, rpm |
| **timing-belts** | Power, driver speed, ratio, service factor | kW, rpm |
| **pipes** | Design pressure, temperature, SF | Pa/MPa/bar/psi, °C |
| **vessels** | Design pressure, temperature, joint efficiency | Pa/MPa/bar/psi, °C |
| **hydraulics** | Required force, system pressure, margin | kN/N/lbf, bar/MPa/psi |
| **heat-exchangers** | Heat duty, log-mean ΔT, UA margin | kW/W, °C |
| **fatigue** | Alternating stress, mean stress, cycles, SF | MPa/Pa/psi/ksi |
| **bolts** | Target SF, load factor | — |
| **keys-splines** | Torque, utilization | N·m/kN·m/lbf·ft |
| **extension-springs** | Rate (N/m), max force, max OD | N, mm |
| **torsion-springs** | Torque, max OD, SF | N·m, mm |
| **rotation** | Mass, shaft power, speed, SF | kg/lb, kW, rpm |
| **impact** | Mass, velocity change, duration, SF | kg, m/s, s |
| **suspension** | Sprung mass, lateral accel, roll target | kg, m/s² |
| **vibrations** | Excitation Hz, damping ratio, separation margin | Hz, — |

All other workflow modules use their **category template** (structural, fasteners, materials, manufacturing, advanced-systems, tools) with the same full-unit rule.

---

## Validate-mode fields (representative)

Validate forms expose the full physics of each solver. Examples:

| Module | Validated quantities with unit selectors |
|--------|------------------------------------------|
| **shafts** | Length, diameter, E, G, torque, bending moment, axial force per load case |
| **gears** | Module, face width, power, speed, torque, stress |
| **bearings** | Radial load, speed, life |
| **beams** | Length, forces, UDL, inertia, moment, stress |
| **columns** | Length, axial load, area, inertia, modulus |
| **compression springs** | Wire OD, mean D, free length, deflection, force, G, ultimate strength |

See each `src/components/**/**Inputs.tsx` for the authoritative field list.

---

## Known gaps and follow-ups

| Gap | Notes |
|-----|-------|
| **Spring rate (N/m)** | Design targets use fixed `N/m` label; no `forcePerLength` dimension in design-target registry yet |
| **Acceleration (m/s²)** | Suspension lateral acceleration is dimensionless in UI; no `acceleration` physics dimension |
| **Milliseconds** | Impact Validate UI may show ms; physics `time` table uses s/min/hr/year — prefer seconds in design targets |
| **Heat duty vs power** | Heat exchangers use `power` dimension (W/kW) for thermal duty — correct numerically, label says “Heat duty” |
| **Hydraulics pressure default** | Design default 160 bar matches common industrial systems; Validate may use different defaults |
| **Advanced-systems modules** | Use category template + `formValues` snapshot; unit coverage follows each calculator’s internal fields |
| **`restrictToProfile`** | Reserved for legacy; not enabled on product pages — all modules should stay on full catalog |

---

## Files to change when adding a module field

1. `src/lib/physics/units.ts` — if a new dimension or unit is needed  
2. `src/lib/units/moduleProfiles.ts` — default unit for design-code profiles  
3. `src/lib/design-workflows/designInputFieldRegistry.ts` — Auto-design / Compare targets  
4. `src/lib/design-workflows/designTargetUnits.ts` — unit key mapping  
5. `src/lib/design-workflows/userInputs.ts` — typed input + `*Unit` keys  
6. Module `*Inputs.tsx` — Validate mode fields  

---

## Verification checklist

- [ ] Shaft Auto-design: power (kW/W/hp), speed (rpm/Hz/rad/s), torque, bending moment all selectable  
- [ ] Bearing Auto-design: radial + axial force in N/kN/lbf  
- [ ] Flywheel Auto-design: energy in J/kJ/ft·lbf  
- [ ] Compare mode shows same unit dropdowns as Auto-design  
- [ ] Validate mode unchanged — still full `ModuleUnitSelect` per field  
