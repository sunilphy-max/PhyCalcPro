# PhyCalcPro — Master validation checklist

Use this document to validate **physics, standards mapping, and design outputs** across calculator modules. Automated CI covers modules with verification JSON; everything else needs your engineer sign-off.

## Before you start

1. Run automated regression:
   ```bash
   npm run test:verification
   ```
   **67 solvers** are registered; **86** committed benchmark cases (see [Verification status](#verification-status) below). Trust `npm run test:verification` / `last-run.json` if counts drift.

2. For each module you rely on in production, complete the **Physics** and **Standards** columns in the tables below.

3. Add your own worksheet cases to `src/data/verification/{moduleId}-indicative-*.json` and re-run CI (see `src/data/verification/README.md`).

4. Module theory docs: `docs/modules/{moduleId}.md`  
   Spring-specific checklist: `docs/modules/spring-modules-user-tasks.md`

---

## Final pre-launch pass (2026-07-16)

Critical-path polish vs rolling-bearings baseline:

| Area | Change |
|------|--------|
| Physics | Combined loading von Mises includes RSS torsion + transverse shear; keys case sourced to Shigley-style formulas |
| Plots | EngineeringPlot on gears, timing/v-belts, roller-chains, multi-pulley, combined-loading, circular-plates, bolt pattern, keys-splines, pins |
| Standards | Catalog limitations stress **screening** on critical path (gears, bearings, shafts, bolts, springs, belts, chains, keys, pins, columns) |
| Metrics | Residual `toFixed` polish on bearings suite (catalog/duplex/recommendations), shafts dashboard, v-belts, springs, housing |
| Housing / plain bearings | Screening limitations added to Calculation Spec catalog |
| Vendor gold | Bearings SKF/MITCalc ±5% cases remain `pending_vendor_gold` until pasted |

Engineer sign-off still required for production-critical modules (Physics/Standards columns below).

---

## Validation workflow (per module)

| Step | Action |
|------|--------|
| A | Run module in **Check** mode with a known textbook / code example |
| B | Compare key outputs (SF, stress, deflection, life, rate) to reference within stated tolerance |
| C | Toggle **Design** mode (if available) and confirm auto-size returns sensible geometry |
| D | Confirm **Calculation spec** panel lists expected standard checks |
| E | Export CSV/PDF and archive inputs + assumption log with the project |
| F | Add or update verification JSON if the case should stay in CI |

---

## Verification status

| Symbol | Meaning |
|--------|---------|
| **CI** | Has passing case in `src/data/verification/` |
| **Solver** | Engine registered in `moduleSolverRegistry.ts` — add JSON anytime |
| **Browse** | Catalog / reference UI — manual validation only |

---

## Structural (8 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **beams** | CI | Cross-check max moment/deflection vs closed-form (simply supported / cantilever). Verify AISC/EC3 checks if using code mode. LTB not fully embedded. |
| **frames** | CI | Compare 2–3 bay frame reactions to hand frame analysis or SAP2000. |
| **trusses** | CI | Pratt/Warren example — member forces vs method of joints. |
| **columns** | CI | Euler + code curve SF vs AISC/EC3 worksheet. Inelastic buckling partial. |
| **plates** | CI | Rectangular plate deflection vs Roark for simply supported case. |
| **combined-loading** | CI | Von Mises / Tresca vs textbook combined stress example. |
| **load-case-manager** | CI | Envelope max/min matches manual load combination. |
| **circular-plates** | CI | Uniform pressure — deflection/moment vs Roark Table. |

---

## Power transmission (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **v-belts** | CI | Cross-check belt speed, wrap, power vs Gates manual example. |
| **timing-belts** | CI | Tooth count / center distance vs manufacturer datasheet. |
| **roller-chains** | CI | Chain tension vs ANSI B29.1 power table. |
| **multi-pulley** | CI | Belt length / wrap angles vs CAD layout. |

---

## Machine (12 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **shafts** | CI | DIN 743 / Shigley shaft example — bending, torsion, Kt, critical speed. |
| **gears** | CI | ISO 6336 / AGMA bending + contact vs MITCalc or vendor software. |
| **bearings** | CI | ISO 281 Lnm / L10, ISO 76 static, speed margin. Also `npm run test:bearings-gold` (screening_reference; paste vendor gold for ±5% SKF/MITCalc). |
| **housing** | CI | Cantilever housing screen vs hand bracket moment; bolt loads vs VDI pattern. |
| **cams** | CI | Displacement/velocity/acceleration vs polynomial cam design text. |
| **flywheels** | CI | Energy storage vs ½Iω² hand calc. |
| **bevel-gears** | CI | Gleason/Klingelnberg screening — verify cone distance and forces. |
| **worm-gears** | CI | Efficiency and thermal load vs vendor rating. |
| **planetary-gears** | CI | Willis equation + planet load sharing assumption. |
| **gear-ratio-design** | CI | Stage ratios and center distances vs layout drawing. |
| **plain-bearings** | CI | Sommerfeld / Raimondi–Boyd chart comparison. |
| **brakes-clutches** | CI | Torque capacity vs friction coefficient × normal force. |

---

## Springs (3 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **compression-springs** | CI (×2) | EN 13906-1 static + fatigue vs nomograph. See `spring-modules-user-tasks.md`. |
| **extension-springs** | CI | Hook stress + Fi vs MITCalc extension spring. |
| **torsion-springs** | CI | Rate `k=Ed⁴/(64Dn)` vs Shigley Ex. 10-4; re-baseline old projects. |

---

## Fasteners (7 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **bolts** | CI | VDI 2230 / AISC joint example — preload, slip, fatigue. |
| **welds** | CI | AISC/AWS fillet throat stress vs manual calc. |
| **rivets** | CI | Single-shear / bearing vs MIL-HDBK or Shigley. |
| **safety-factor** | CI | Combined SF definitions match your company standard. |
| **keys-splines** | CI | Key shear/bearing vs ISO 3912 / Shigley. |
| **shaft-hubs** | CI | Interference / clearance fit pressure vs DIN 7190. |
| **pins** | CI | Double shear pin vs Shigley Table. |

---

## Materials (8 modules)

Central catalog: `src/data/materials.ts` (~80+ grades). Module pickers use `MaterialSelect` with profile filters (`src/lib/materials/materialProfiles.ts`). No local `MATERIALS` maps in product pages (`npm run validate:materials`).

| Grade coverage (user-requested) | Catalog id | Typical modules |
|--------------------------------|------------|-----------------|
| ASTM A36 | `astm-a36` | beams, columns, frames, plates |
| ASTM A572 Gr.50 / Gr.60 | `astm-a572-50`, `astm-a572-60` | structural |
| 4140 / 4340 Q&T | `42crmo4-4140`, `34crnimo6-4340` | shafts, gears, fatigue handoff |
| AW-6061 T6 / AW-7075 T6 | `al-6061`, `al-7075` | structural, dynamics, machine |
| Stainless 304 / 316 / 316L / 2205 | `ss-304`, `ss-316`, `ss-316l`, `ss-2205` | structural, pressure, welds |
| Plastics POM / PA66 / PEEK / ABS | `pom-c`, `pa66`, `peek`, `abs` | dynamics (E, ρ) |
| Weld filler E6013 / E7018 | `weld-e6013`, `weld-e7018` | welds (throat allowable) |

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **material-db** | CI | Spot-check E, ν, Sy against MMPDS / matweb for alloys you use. Cross-calc links apply `?material=` to beams/shafts/columns. |
| **sections** | CI | Area properties vs CAD section properties. |
| **rolled-sections** | CI | W/HSS designation lookup vs AISC Steel Construction Manual. |
| **profiles** | CI | Custom polygon I/A/c vs hand composite sections. |
| **composites** | CI | CLT stiffness vs Jones textbook lamina example. |
| **temperature-properties** | CI | Interpolated strength derating vs code table. |
| **fatigue** | CI | Goodman/Gerber + Marin vs Shigley Ex. 6-1. |
| **corrosion** | CI | Corrosion allowance vs API 510 / company spec. |

Verification JSON cases with named grades: `beams-a36-01`, `shafts-4140-01`, `vibrations-s275-01`.

---

## Pressure (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **pipes** | CI | Barlow hoop stress vs ASME B31.3 example. |
| **vessels** | CI | Thin/thick cylinder vs ASME VIII Div.1 UG-27. |
| **hydraulics** | CI | Cylinder force vs manufacturer catalog. |
| **heat-exchangers** | CI | LMTD / NTU vs Bell–Delaware screening example. |

---

## Dynamics (5 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **motor** | CI | Rated torque T=P/ω vs motor nameplate; frame class indicative only. |
| **vibrations** | CI | Natural frequency vs analytical beam ω₁. |
| **rotation** | CI | Centripetal force / KE vs textbook. |
| **impact** | CI | Impulse–momentum average force vs energy method. |
| **suspension** | CI | Roll angle / load transfer vs vehicle dynamics text. |

---

## Manufacturing (4 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **tolerance** | CI | Stack-up RSS vs worst-case drawing review. |
| **fits** | CI | ISO 286 hole/shaft fit vs tolerance table. |
| **cost-estimator** | CI | Order-of-magnitude only — calibrate to your shop rates. |
| **cam-toolpaths** | CI | Toolpath length/time vs CAM post output. |

---

## Advanced systems (8 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **vacuum-engineering** | CI | Pump-down time vs vendor curve; replace bootstrap with your chamber. |
| **cryogenic-engineering** | CI | Heat leak / boil-off vs cryo supplier data. |
| **magnetic-fields** | CI | B-field vs Biot–Savart / FEM for simple coil. |
| **superconducting-systems** | CI | Critical current margin vs material Ic(B,T). |
| **thermal-management** | CI | Junction temperature vs 1D thermal resistance network. |
| **battery-ev-systems** | CI | Pack energy / C-rate vs cell datasheet. |
| **hydrogen-systems** | CI | Storage pressure / flow vs safety case. |
| **precision-motion** | CI | Stage error budget vs encoder resolution + backlash. |

---

## Tools (2 modules)

| Module | Auto | Your validation tasks |
|--------|------|------------------------|
| **formula-reference** | CI | Spot-check 5 formulas against Roark / Shigley. |
| **unit-converter** | CI | NIST conversion factors for critical unit pairs. |

---

## Priority order (recommended)

Work top-down by product risk and maturity:

1. **Production-critical machine design:** shafts → bearings → gears → springs → fasteners  
2. **Structural sign-off:** beams → columns → combined-loading  
3. **Power train:** v-belts → timing-belts → roller-chains  
4. **Pressure systems:** pipes → vessels → hydraulics  
5. **Remaining modules** as your product roadmap requires  

---

## Adding CI coverage for a module

```bash
# 1. Add seed to src/lib/qa/verificationSeeds.ts (or write JSON by hand)
# 2. Generate file:
npx tsx scripts/bootstrap-verification.ts
# 3. Replace source field with your worksheet reference
npm run test:verification
# 4. Commit JSON + last-run.json
```

---

## Infrastructure reference

| File | Purpose |
|------|---------|
| `src/lib/qa/moduleSolverRegistry.ts` | All automated solvers (65 modules) |
| `src/lib/qa/benchmarkRunner.ts` | CI runner |
| `src/lib/standards/evaluators/generic.ts` | Result field → standard check mapping |
| `src/lib/standards/moduleCatalog.ts` | Per-module check definitions |
| `docs/modules/*.md` | Theory and equations per module |

---

*Last updated: 2026-07 — 70 CI cases, 64 modules with benchmarks, 65 solver registry entries.*

---

## Connected power-train workflow (sign-off)

Run the full chain with **Projects → Start power train design** or `/products/dynamics/motor?assembly=new`:

1. **Motor** — frame class and rated speed; handoff to V-belts applies power and service factor.
2. **V-Belts** — belt sizing; handoff applies torque and radial load to shaft.
3. **Multi-Pulley** (optional skip) — layout publishes diameters to V-belts.
4. **Shafts** — FEM check; handoff to keys and bearings.
5. **Bearings** — L10 life; handoff bore and loads to housing.
6. **Keys & Splines** — shear/bearing SF from shaft torque.
7. **Housing** — body and bolt loads; handoff to bolts.
8. **Bolts** — VDI or pattern; handoff reaction to frame.
9. **Frames** — mount frame check with imported joint load.

Confirm each **Apply to inputs** banner (or auto-apply when using the stepper) populates the expected fields.

---

## Related documents

- [VerificationGuide.md](./VerificationGuide.md) — CI commands and JSON schema
- [manual-engineer-signoff.md](./manual-engineer-signoff.md) — MITCalc / worksheet validation template
- [manual-release-tier-guide.md](./manual-release-tier-guide.md) — promoting modules on `/status`
- [modules/spring-modules-user-tasks.md](./modules/spring-modules-user-tasks.md) — spring-specific tasks
- [Design-Workflow-Reference.md](./Design-Workflow-Reference.md) — Auto-design / Validate / Compare
