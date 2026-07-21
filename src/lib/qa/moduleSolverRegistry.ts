/**
 * Central solver registry for CI verification benchmarks.
 * Maps moduleId → solver function (flat numeric result fields).
 */

import { getAdvancedSystemCalculator, type AdvancedCalculatorId } from "@/lib/advanced-systems/calculators";
import { solveCamToolpathsEngine } from "@/lib/manufacturing/camToolpaths/engine";
import { solveCostEstimatorEngine } from "@/lib/manufacturing/costEstimator/engine";
import { solveFitsEngine, solveToleranceEngine } from "@/lib/manufacturing/engine";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import { solveRotationEngine } from "@/lib/dynamics/rotation/engine";
import { solveMotorEngine } from "@/lib/dynamics/motor/engine";
import { solveSuspensionEngine } from "@/lib/dynamics/suspension/engine";
import { solveVibrationEngine } from "@/lib/dynamics/vibrations/engine";
import { solveScrewEngine } from "@/lib/fasteners/bolts/engine";
import { solveBoltPattern } from "@/lib/fasteners/bolts/boltPattern";
import { solveKeysSplinesEngine } from "@/lib/fasteners/keys-splines/engine";
import { solvePinEngine } from "@/lib/fasteners/pins/engine";
import { solveRivetEngine } from "@/lib/fasteners/rivets/engine";
import { solveShaftHubEngine } from "@/lib/fasteners/shaft-hubs/engine";
import { solveWeldEngine } from "@/lib/fasteners/welds/engine";
import { solveGearEngine } from "@/lib/machine/gears/engine";
import { solveBevelGearEngine } from "@/lib/machine/bevel-gears/engine";
import { solveBrakesClutchesEngine } from "@/lib/machine/brakes-clutches/engine";
import { solveCamEngine } from "@/lib/machine/cams/engine";
import { solveFlywheelEngine } from "@/lib/machine/flywheels/engine";
import { solveGearRatioDesignEngine } from "@/lib/machine/gear-ratio-design/engine";
import { solveInternalGearsRackEngine } from "@/lib/machine/internal-gears-rack/engine";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import { solvePlanetaryGearEngine } from "@/lib/machine/planetary-gears/engine";
import { solveWormGearEngine } from "@/lib/machine/worm-gears/engine";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import { solveHousingEngine } from "@/lib/machine/housing/engine";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import { solveCompositeEngine } from "@/lib/materials/composites/engine";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import { solveSectionEngine } from "@/lib/materials/engine";
import { solveRolledSectionsEngine } from "@/lib/materials/rolled-sections/engine";
import { solveTemperaturePropertiesEngine } from "@/lib/materials/temperatureProperties/engine";
import { solveHeatExchangerEngine } from "@/lib/pressure/heat-exchangers/engine";
import { solveHydraulicsEngine } from "@/lib/pressure/hydraulics/engine";
import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import { solvePressureVesselEngine } from "@/lib/pressure/vessels/engine";
import { solveMultiPulley } from "@/lib/powerTransmission/multi-pulley/engine";
import { solveRollerChainDrive } from "@/lib/powerTransmission/roller-chains/engine";
import { solveTimingBeltDrive } from "@/lib/powerTransmission/timing-belts/engine";
import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";
import { solveAreaPropertiesEngine } from "@/lib/profiles/engine";
import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import { solveExtensionSpringEngine } from "@/lib/springs/extension-springs/engine";
import { solveTorsionSpringEngine } from "@/lib/springs/torsion-springs/engine";
import { solveBeamEngine } from "@/lib/structural/beams/engine";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import { solveCircularPlateEngine } from "@/lib/structural/circular-plates/engine";
import { solveShellEngine } from "@/lib/structural/shells/engine";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import { solvePlateEngine } from "@/lib/structural/plates/engine";
import { solveTrussEngine } from "@/lib/structural/trusses/engine";
import { solveUnitConverterEngine } from "@/lib/tools/unit-converter/engine";

export type ModuleSolverFn = (inputs: Record<string, unknown>) => Record<string, unknown>;

function wrapAdvanced(id: AdvancedCalculatorId): ModuleSolverFn {
  return (inputs) => {
    const calc = getAdvancedSystemCalculator(id);
    const numeric: Record<string, number> = {};
    for (const field of calc.fields) {
      const raw = inputs[field.key];
      numeric[field.key] = typeof raw === "number" ? raw : field.defaultValue;
    }
    const result = calc.solve(numeric);
    const flat: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(result)) {
      if (typeof v === "number" && Number.isFinite(v)) flat[k] = v;
    }
    return flat;
  };
}

/** All modules with automated numeric solvers for verification CI. */
export const MODULE_SOLVER_REGISTRY: Record<string, ModuleSolverFn> = {
  beams: (i) => solveBeamEngine(i as never) as Record<string, unknown>,
  frames: (i) => solveFrameEngine(i as never) as Record<string, unknown>,
  trusses: (i) => solveTrussEngine(i as never) as Record<string, unknown>,
  columns: (i) => solveBucklingEngine(i as never) as Record<string, unknown>,
  plates: (i) => solvePlateEngine(i as never) as Record<string, unknown>,
  "combined-loading": (i) => solveCombinedLoadingEngine(i as never) as Record<string, unknown>,
  "circular-plates": (i) => solveCircularPlateEngine(i as never) as Record<string, unknown>,
  shells: (i) => solveShellEngine(i as never) as Record<string, unknown>,
  "v-belts": (i) => solveVBeltDrive(i as never) as Record<string, unknown>,
  "timing-belts": (i) => solveTimingBeltDrive(i as never) as Record<string, unknown>,
  "roller-chains": (i) => solveRollerChainDrive(i as never) as Record<string, unknown>,
  "multi-pulley": (i) => solveMultiPulley(i as never) as Record<string, unknown>,
  shafts: (i) => solveShaftEngine(i as never) as Record<string, unknown>,
  gears: (i) => solveGearEngine(i as never) as Record<string, unknown>,
  bearings: (i) => solveBearingEngine(i as never) as Record<string, unknown>,
  housing: (i) => solveHousingEngine(i as never) as Record<string, unknown>,
  cams: (i) => solveCamEngine(i as never) as Record<string, unknown>,
  flywheels: (i) => solveFlywheelEngine(i as never) as Record<string, unknown>,
  "bevel-gears": (i) => solveBevelGearEngine(i as never) as Record<string, unknown>,
  "worm-gears": (i) => solveWormGearEngine(i as never) as Record<string, unknown>,
  "planetary-gears": (i) => solvePlanetaryGearEngine(i as never) as Record<string, unknown>,
  "gear-ratio-design": (i) => solveGearRatioDesignEngine(i as never) as Record<string, unknown>,
  "internal-gears-rack": (i) => solveInternalGearsRackEngine(i as never) as Record<string, unknown>,
  "power-screws": (i) => solveScrewEngine(i as never) as Record<string, unknown>,
  "plain-bearings": (i) => solvePlainBearingEngine(i as never) as Record<string, unknown>,
  "brakes-clutches": (i) => solveBrakesClutchesEngine(i as never) as Record<string, unknown>,
  "compression-springs": (i) => solveCompressionSpringEngine(i as never) as Record<string, unknown>,
  "extension-springs": (i) => solveExtensionSpringEngine(i as never) as Record<string, unknown>,
  "torsion-springs": (i) => solveTorsionSpringEngine(i as never) as Record<string, unknown>,
  bolts: (i) =>
    "patternRadius" in i || "positions" in i
      ? (solveBoltPattern(i as never) as Record<string, unknown>)
      : (solveScrewEngine(i as never) as Record<string, unknown>),
  welds: (i) => solveWeldEngine(i as never) as Record<string, unknown>,
  rivets: (i) => solveRivetEngine(i as never) as Record<string, unknown>,
  "keys-splines": (i) => solveKeysSplinesEngine(i as never) as Record<string, unknown>,
  "shaft-hubs": (i) => solveShaftHubEngine(i as never) as Record<string, unknown>,
  pins: (i) => solvePinEngine(i as never) as Record<string, unknown>,
  sections: (i) => solveSectionEngine(i as never) as Record<string, unknown>,
  "rolled-sections": (i) => solveRolledSectionsEngine(i as never) as Record<string, unknown>,
  profiles: (i) => solveAreaPropertiesEngine(i as never) as Record<string, unknown>,
  composites: (i) => solveCompositeEngine(i as never) as Record<string, unknown>,
  "temperature-properties": (i) => solveTemperaturePropertiesEngine(i as never) as Record<string, unknown>,
  fatigue: (i) => solveFatigueEngine(i as never) as Record<string, unknown>,
  corrosion: (i) => solveCorrosionEngine(i as never) as Record<string, unknown>,
  pipes: (i) => solvePressurePipeEngine(i as never) as Record<string, unknown>,
  vessels: (i) => solvePressureVesselEngine(i as never) as Record<string, unknown>,
  hydraulics: (i) => solveHydraulicsEngine(i as never) as Record<string, unknown>,
  "heat-exchangers": (i) => solveHeatExchangerEngine(i as never) as Record<string, unknown>,
  vibrations: (i) => solveVibrationEngine(i as never) as Record<string, unknown>,
  rotation: (i) => solveRotationEngine(i as never) as Record<string, unknown>,
  motor: (i) => solveMotorEngine(i as never) as Record<string, unknown>,
  impact: (i) => solveImpactEngine(i as never) as Record<string, unknown>,
  suspension: (i) => solveSuspensionEngine(i as never) as Record<string, unknown>,
  tolerance: (i) => solveToleranceEngine(i as never) as Record<string, unknown>,
  fits: (i) => solveFitsEngine(i as never) as Record<string, unknown>,
  "cost-estimator": (i) => solveCostEstimatorEngine(i as never) as Record<string, unknown>,
  "cam-toolpaths": (i) => solveCamToolpathsEngine(i as never) as Record<string, unknown>,
  "vacuum-engineering": wrapAdvanced("vacuum-engineering"),
  "cryogenic-engineering": wrapAdvanced("cryogenic-engineering"),
  "magnetic-fields": wrapAdvanced("magnetic-fields"),
  "superconducting-systems": wrapAdvanced("superconducting-systems"),
  "thermal-management": wrapAdvanced("thermal-management"),
  "battery-ev-systems": wrapAdvanced("battery-ev-systems"),
  "hydrogen-systems": wrapAdvanced("hydrogen-systems"),
  "precision-motion": wrapAdvanced("precision-motion"),
  "unit-converter": (i) => solveUnitConverterEngine(i as never) as Record<string, unknown>,
};

export function getModuleSolver(moduleId: string): ModuleSolverFn | undefined {
  return MODULE_SOLVER_REGISTRY[moduleId];
}

export function supportedSolverModuleIds(): string[] {
  return Object.keys(MODULE_SOLVER_REGISTRY).sort();
}
