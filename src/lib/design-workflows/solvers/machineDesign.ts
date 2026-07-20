import { solveGearEngine } from "@/lib/machine/gears/engine";
import { GEAR_MODULE_SERIES_1_MM } from "@/data/catalogs/standardSeries";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import { ISO_PREFERRED_SHAFT_DIAMETERS_MM } from "@/lib/machine/shafts/standardDiameters";
import { rankCatalogBearings } from "@/lib/machine/bearings/catalogSelection";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import { solveFlywheelEngine } from "@/lib/machine/flywheels/engine";
import { solveBevelGearEngine } from "@/lib/machine/bevel-gears/engine";
import { solveWormGearEngine } from "@/lib/machine/worm-gears/engine";
import { solvePlanetaryGearEngine } from "@/lib/machine/planetary-gears/engine";
import { solveGearRatioDesignEngine } from "@/lib/machine/gear-ratio-design/engine";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import { designHousingBolts } from "@/lib/machine/housing/engine";
import { solveBrakesClutchesEngine } from "@/lib/machine/brakes-clutches/engine";
import { solveCamEngine } from "@/lib/machine/cams/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import {
  DEFAULT_MACHINE_GEAR,
  DEFAULT_MACHINE_SHAFT,
  STEEL_DENSITY,
  STEEL_YIELD,
} from "@/lib/materials/materialDefaults";
import { resolveMaterial, toGearMaterial, toShaftMaterial } from "@/lib/materials/materialCatalogService";

const STEEL_MATERIAL = toGearMaterial(resolveMaterial(DEFAULT_MACHINE_GEAR.name, "machine-gear"));

const SHAFT_MATERIAL = toShaftMaterial(resolveMaterial(DEFAULT_MACHINE_SHAFT.name, "machine-shaft"));

const BEARING_MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 1,
  staticRatingFactor: 1,
  allowableLife: 1e6,
};

/** ISO deep-groove dynamic load ratings C (N) — indicative catalog values. */
const DEEP_GROOVE_BEARING_CATALOG = [
  { name: "6205", C: 14000 },
  { name: "6206", C: 19500 },
  { name: "6207", C: 25500 },
  { name: "6208", C: 29600 },
  { name: "6209", C: 31500 },
  { name: "6210", C: 35100 },
  { name: "6307", C: 33500 },
  { name: "6308", C: 42300 },
  { name: "6309", C: 47500 },
  { name: "6310", C: 61800 },
  { name: "6312", C: 81900 },
];

type ShaftLoadCase = {
  position: number;
  torque?: number;
  bendingMoment?: number;
  axialForce?: number;
};

function resolveShaftLoads(userInputs: ModuleUserInputs, length: number): ShaftLoadCase[] {
  if (userInputs.shaftLoads?.length) {
    return userInputs.shaftLoads;
  }
  let torque = userInputs.torque;
  if ((torque == null || torque === 0) && userInputs.power != null) {
    const rpm = userInputs.rpm ?? userInputs.speedDriver ?? 1200;
    const omega = (rpm * 2 * Math.PI) / 60;
    torque = omega > 0 ? userInputs.power / omega : 0;
  }
  const resolvedTorque = torque ?? 420;
  const moment = userInputs.bendingMoment ?? 650;
  return [{ position: length / 2, torque: resolvedTorque, bendingMoment: moment }];
}

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designGearModule(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 15000;
  const speed = userInputs.speedDriver ?? userInputs.rpm ?? 1200;
  const ratio = userInputs.ratio ?? userInputs.gearRatio ?? 4;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const referenceModuleMm = userInputs.module ?? 3;
  const referenceModule = referenceModuleMm / 1000;
  const referenceFaceWidth = (10 * referenceModuleMm) / 1000;
  const pinionTeethOptions = [15, 17, 20, 22, 25, 28, 30, 35];

  const toothItems = pinionTeethOptions.map((z) => {
    try {
      const res = solveGearEngine({
        power,
        speed,
        module: referenceModule,
        faceWidth: referenceFaceWidth,
        pinionTeeth: z,
        gearRatio: ratio,
        material: STEEL_MATERIAL,
      });
      const util = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Pinion z=${z}`,
        utilization: util,
        fields: { pinionTeeth: z },
        detail: `bending SF ${res.safetyFactor.toFixed(2)} @ m=${referenceModuleMm}`,
      };
    } catch {
      return { label: `z=${z}`, utilization: 99, fields: { pinionTeeth: z }, detail: "invalid" };
    }
  });

  const toothSweep = sweepCatalogForUtilization(toothItems);
  const bestPinionTeeth =
    (toothSweep.best?.fields?.pinionTeeth as number | undefined) ?? userInputs.pinionTeeth ?? 20;

  const modules = GEAR_MODULE_SERIES_1_MM.filter((m) => m >= 1 && m <= 12);
  const moduleItems = modules.map((m) => {
    const moduleM = m / 1000;
    const faceWidth = (10 * m) / 1000;
    try {
      const res = solveGearEngine({
        power,
        speed,
        module: moduleM,
        faceWidth,
        pinionTeeth: bestPinionTeeth,
        gearRatio: ratio,
        material: STEEL_MATERIAL,
      });
      const util = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Module ${m}`,
        utilization: util,
        fields: { module: m, faceWidth: 10 * m, pinionTeeth: bestPinionTeeth, moduleUnit: "mm", faceWidthUnit: "mm" },
        detail: `bending SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `m=${m}`, utilization: 99, fields: { module: m, pinionTeeth: bestPinionTeeth }, detail: "invalid" };
    }
  });

  const moduleSweep = sweepCatalogForUtilization(moduleItems);
  const ranked = [...toothSweep.ranked.slice(0, 4), ...moduleSweep.ranked].sort(
    (a, b) => a.utilization - b.utilization
  );

  return {
    method: `Pinion tooth-count sweep at m=${referenceModuleMm}, then module/face-width sweep (z=${bestPinionTeeth}) for Lewis bending safety.`,
    best: moduleSweep.best,
    ranked: ranked.slice(0, 10),
  };
}

export function designShaftDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const targetSf = userInputs.targetSafetyFactor ?? 2;
  const length = userInputs.length ?? 0.6;
  const loads = resolveShaftLoads(userInputs, length);
  const diametersMm = ISO_PREFERRED_SHAFT_DIAMETERS_MM.filter((d) => d >= 20 && d <= 120);

  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveShaftEngine({
        geometry: { diameter: d, length },
        material: SHAFT_MATERIAL,
        loads,
        meshSegments: 20,
      });
      const util = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { diameter: dMm, diameterUnit: "mm" },
        detail: `SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { diameter: dMm }, detail: "invalid" };
    }
  });

  const loadSummary =
    loads.length > 1
      ? `${loads.length} load cases`
      : `T=${loads[0]?.torque ?? 0} N·m, M=${loads[0]?.bendingMoment ?? 0} N·m`;
  return fromSweep(
    sweepCatalogForUtilization(items),
    `Shaft diameter sweep for combined FEA stress (${loadSummary}) and target SF.`
  );
}

export function designBearingSelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const radial = userInputs.maxForce ?? 6200;
  const speed = userInputs.speedDriver ?? 1500;
  const lifeHours = userInputs.requiredLife ?? 20000;
  const bearingType = userInputs.bearingType ?? "deep_groove";
  const manufacturer =
    (userInputs.bearingManufacturer as "SKF" | "FAG" | "NSK" | "TIMKEN" | "NTN" | undefined) ?? "SKF";
  const applicationProfile = userInputs.bearingApplicationProfile ?? "all";
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;

  try {
    const lubricantType = userInputs.bearingLubricantType ?? "oil";
    const req = solveBearingEngine({
      radialLoad: radial,
      axialLoad: userInputs.axialLoad ?? 0,
      speed,
      lifeHours,
      safetyFactor: targetSf,
      bearingType,
      arrangement: userInputs.bearingArrangement ?? "single",
      lubricantType: lubricantType === "none" ? undefined : lubricantType,
      isoVgGrade: lubricantType === "none" ? undefined : (userInputs.bearingIsoVgGrade ?? 68),
      operatingTempC: userInputs.bearingOperatingTempC ?? 70,
      contamination:
        lubricantType === "none" ? undefined : (userInputs.bearingContamination ?? "normal_clean"),
      material: BEARING_MATERIAL,
    });

    const ranked = rankCatalogBearings({
      bearingType,
      requiredDynamicRatingN: req.requiredDynamicRating,
      requiredStaticRatingN: req.requiredStaticRating,
      speedRpm: speed,
      manufacturer,
      applicationProfile,
      boreMaxMm: userInputs.shaftDiameterMm as number | undefined,
    });

    const items = ranked.slice(0, 12).map((r) => ({
      label: r.entry.designation,
      utilization: r.dynamicUtilization,
      fields: {
        designation: r.entry.designation,
        bearingType: r.entry.type,
        manufacturer: r.entry.manufacturer,
      },
      detail: `${r.entry.manufacturer} · ${r.entry.series} · C ${(r.entry.dynamicRatingN / 1000).toFixed(1)} kN · s₀ ${r.staticUtilization > 0 ? (1 / r.staticUtilization).toFixed(1) : "—"} · n_lim/n ${r.speedMargin.toFixed(2)}`,
    }));

    return fromSweep(
      sweepCatalogForUtilization(items),
      "Rolling bearing ranked from ISO 281 required C, static C₀, and catalog speed limit."
    );
  } catch {
    return fromSweep(sweepCatalogForUtilization([]), "Bearing design requires valid load and life inputs.");
  }
}

/**
 * Flywheel OD × thickness grid for stored-energy target.
 * Apply fields `outerDiameter` and `thickness` are in **meters** (flywheels page).
 */
export function designFlywheelInertia(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const rpm = userInputs.speedDriver ?? userInputs.rpm ?? 1500;
  const targetEnergy = userInputs.energy ?? 5000;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const diametersMm = [200, 250, 300, 350, 400, 450, 500, 600, 700, 800];
  const thicknessesMm = [20, 30, 40, 50, 60, 80];
  const items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail: string;
  }> = [];

  for (const dMm of diametersMm) {
    for (const tMm of thicknessesMm) {
      const d = dMm / 1000;
      const t = tMm / 1000;
      try {
        const res = solveFlywheelEngine({
          outerDiameter: d,
          thickness: t,
          faceWidth: t,
          density: STEEL_DENSITY,
          rpm,
          yieldStress: userInputs.yieldStress ?? STEEL_YIELD,
        });
        const energyUtil = targetEnergy / Math.max(res.storedEnergy, 1e-9);
        const stressUtil = targetSf / Math.max(res.safetyFactor, 1e-9);
        const util = Math.max(energyUtil, stressUtil);
        items.push({
          label: `Ø${dMm}×${tMm} mm`,
          utilization: util,
          fields: { outerDiameter: d, thickness: t, faceWidth: t },
          detail: `E ${res.storedEnergy.toFixed(0)} J · hoop ${(res.hoopStress / 1e6).toFixed(0)} MPa · SF ${res.safetyFactor.toFixed(2)}`,
        });
      } catch {
        /* skip invalid geometry */
      }
    }
  }

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Flywheel OD×thickness catalog sweep for energy target and rim stress."
  );
}

/** Bevel module/face-width in **mm** (matches bevel-gears page). */
export function designBevelGear(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 12000;
  const speed = userInputs.speedDriver ?? 1200;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const pinionTeeth = userInputs.pinionTeeth ?? 18;
  const gearRatio = userInputs.ratio ?? 2.5;
  const modules = GEAR_MODULE_SERIES_1_MM.filter((m) => m >= 1.5 && m <= 10);

  const items = modules.flatMap((m) => {
    const faceFactors = [8, 9, 10];
    return faceFactors.map((fwFactor) => {
      const faceWidthMm = fwFactor * m;
      try {
        const res = solveBevelGearEngine({
          power,
          speed,
          module: m / 1000,
          pinionTeeth,
          gearRatio,
          faceWidth: faceWidthMm / 1000,
          yieldStress: userInputs.yieldStress ?? STEEL_MATERIAL.yieldStress,
          pressureAngleDeg: 20,
        });
        const bendUtil = targetSf / Math.max(res.bendingSafety, 1e-9);
        const contactUtil = targetSf / Math.max(res.contactSafety ?? res.bendingSafety, 1e-9);
        return {
          label: `m=${m} · b=${faceWidthMm.toFixed(0)} mm`,
          utilization: Math.max(bendUtil, contactUtil),
          fields: { module: m, faceWidth: faceWidthMm },
          detail: `bend SF ${res.bendingSafety.toFixed(2)} · contact SF ${(res.contactSafety ?? res.bendingSafety).toFixed(2)}`,
        };
      } catch {
        return {
          label: `m=${m}`,
          utilization: 99,
          fields: { module: m, faceWidth: faceWidthMm },
          detail: "invalid",
        };
      }
    });
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "ISO 54 bevel module × face-width sweep for bending/contact SF."
  );
}

export function designWormGear(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 5000;
  const speed = userInputs.speedDriver ?? 1450;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const modulesMm = [2, 2.5, 3, 4, 5, 6, 8];
  const teethOptions = [30, 40, 50, 60, 80];
  const items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail: string;
  }> = [];

  for (const moduleMm of modulesMm) {
    for (const gearTeeth of teethOptions) {
      try {
        const res = solveWormGearEngine({
          power,
          speed,
          wormStarts: 1,
          gearTeeth,
          module: moduleMm / 1000,
          faceWidth: (8 * moduleMm) / 1000,
          frictionCoeff: 0.05,
          leadAngleDeg: 5,
          yieldStress: userInputs.yieldStress ?? STEEL_MATERIAL.yieldStress,
        });
        const util = targetSf / Math.max(res.contactSafety, 1e-9);
        items.push({
          label: `m=${moduleMm} · z₂=${gearTeeth}`,
          utilization: util,
          fields: { gearTeeth, module: moduleMm, faceWidth: 8 * moduleMm },
          detail: `contact SF ${res.contactSafety.toFixed(2)} · eff ${(res.efficiency * 100).toFixed(0)}%`,
        });
      } catch {
        /* skip */
      }
    }
  }

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Worm module × wheel tooth-count sweep for contact safety."
  );
}

export function designPlanetaryGear(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const target = userInputs.ratio ?? 5;
  const sunOptions = [12, 15, 18, 20, 24];

  const items = sunOptions.map((sun) => {
    const planet = Math.max(10, Math.round(sun * 0.8));
    try {
      const res = solvePlanetaryGearEngine({
        sunTeeth: sun,
        planetTeeth: planet,
        targetRatio: target,
        module: (userInputs.module ?? 3) / 1000,
        power: userInputs.power ?? 10000,
        speed: userInputs.speedDriver ?? 1200,
      });
      const util = Math.abs(res.actualRatio - target) / Math.max(target, 1);
      return {
        label: `Sun ${sun} / planet ${planet}`,
        utilization: util,
        fields: { sunTeeth: sun, planetTeeth: planet, ringTeeth: res.ringTeeth },
        detail: `ratio ${res.actualRatio.toFixed(2)}`,
      };
    } catch {
      return { label: `z=${sun}`, utilization: 99, fields: { sunTeeth: sun }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items, 0.05), "Planetary tooth-count sweep for target ratio.");
}

export function designGearRatio(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const target = userInputs.ratio ?? 4.5;
  const res = solveGearRatioDesignEngine({
    targetRatio: target,
    maxTeeth: 80,
    minPinionTeeth: 15,
  });
  const ranked = [];
  for (let z1 = 15; z1 <= 40; z1++) {
    const z2 = Math.round(z1 * target);
    if (z2 > 80) continue;
    ranked.push({
      label: `${z1}/${z2}`,
      utilization: Math.abs(z2 / z1 - target) / target,
      fields: { pinionTeeth: z1, gearTeeth: z2 },
      detail: `ratio ${(z2 / z1).toFixed(4)}`,
    });
  }
  ranked.sort((a, b) => a.utilization - b.utilization);
  return {
    method: "Tooth-count optimization for target gear ratio.",
    best: {
      label: `${res.pinionTeeth}/${res.gearTeeth}`,
      utilization: res.error / Math.max(target, 1),
      fields: { pinionTeeth: res.pinionTeeth, gearTeeth: res.gearTeeth },
      detail: `ratio ${res.actualRatio.toFixed(4)}`,
    },
    ranked: ranked.slice(0, 8),
  };
}

export function designPlainBearing(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const load = userInputs.maxForce ?? 8000;
  const speed = userInputs.speedDriver ?? 900;
  const diametersMm = [25, 30, 40, 50, 60, 70, 80, 100, 120];
  const lOverD = [0.8, 1.0, 1.2, 1.5];
  const minFilmTargetM = 8e-6;
  const items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail: string;
  }> = [];

  for (const dMm of diametersMm) {
    for (const ld of lOverD) {
      const d = dMm / 1000;
      const lengthMm = dMm * ld;
      try {
        const res = solvePlainBearingEngine({
          bearingType: "journal",
          diameter: d,
          length: d * ld,
          load,
          speed,
          viscosity: 0.03,
          clearance: d * 0.001,
        });
        const filmUtil = minFilmTargetM / Math.max(res.minFilmThickness, 1e-12);
        const p = res.specificLoadPa ?? res.unitLoad ?? load / (d * d * ld);
        const pressureUtil = p / 8e6;
        items.push({
          label: `Ø${dMm}×${lengthMm.toFixed(0)}`,
          utilization: Math.max(filmUtil, pressureUtil),
          fields: { diameter: dMm, length: lengthMm },
          detail: `h_min ${(res.minFilmThickness * 1e6).toFixed(1)} µm · p ${(p / 1e6).toFixed(1)} MPa`,
        });
      } catch {
        /* skip */
      }
    }
  }

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Journal diameter×L/D sweep for film thickness and specific pressure."
  );
}

export function designBrakesClutches(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const torque = userInputs.torque ?? 200;
  const speed = userInputs.speedDriver ?? 1200;
  const diametersMm = [100, 120, 150, 180, 200, 250];

  const items = diametersMm.map((dMm) => {
    const rOut = dMm / 2000;
    const rIn = rOut * 0.7;
    try {
      const res = solveBrakesClutchesEngine({
        outerRadius: rOut,
        innerRadius: rIn,
        frictionCoeff: 0.35,
        actuationForce: userInputs.maxForce ?? 3000,
        speed,
        engagementTime: 0.5,
        safetyFactorTarget: userInputs.targetSafetyFactor ?? 1.5,
      });
      const util = torque / Math.max(res.frictionTorque, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { outerDiameter: dMm },
        detail: `T ${res.frictionTorque.toFixed(0)} N·m`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { outerDiameter: dMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Friction disc diameter sweep for torque capacity.");
}

/**
 * Cam base-circle sweep for pressure-angle limit.
 * Apply fields `baseCircle` / `baseRadius` are in **meters** (cams page).
 */
export function designCamProfile(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const lift = userInputs.lift ?? 0.01;
  const speed = userInputs.speedDriver ?? 300;
  const maxPressureAngleDeg = 30;
  const radiiMm = [25, 30, 35, 40, 45, 50, 55, 60, 70, 80];

  const items = radiiMm.map((rMm) => {
    const r = rMm / 1000;
    try {
      const res = solveCamEngine({
        baseCircle: r,
        radius: Math.min(r * 0.25, lift),
        lift,
        speed,
        dwellAngle: 90,
        motionLaw: "simple_harmonic",
        profileType: "roller_follower",
      });
      const util = res.peakPressureAngle / maxPressureAngleDeg;
      return {
        label: `R${rMm} mm base`,
        utilization: util,
        fields: { baseCircle: r, baseRadius: r },
        detail: `α ${res.peakPressureAngle.toFixed(1)}° · a_max ${res.peakAcceleration.toFixed(0)}`,
      };
    } catch {
      return { label: `R${rMm}`, utilization: 99, fields: { baseCircle: r, baseRadius: r }, detail: "invalid" };
    }
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Cam base-radius sweep for ≤30° pressure-angle limit."
  );
}

export function designHousingMount(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const base = {
    boreDiameter: userInputs.diameter ?? 0.04,
    radialLoad: userInputs.maxForce ?? 5000,
    axialLoad: userInputs.axialLoad ?? 0,
    speed: userInputs.rpm ?? 1500,
    mountStyle: "pillow_block" as const,
    yieldStress: userInputs.yieldStress ?? STEEL_YIELD,
  };
  const { best } = designHousingBolts(base);
  if (!best) {
    return { method: "Bolt pattern sweep for housing mount.", best: null, ranked: [] };
  }
  return {
    method: "Bolt count and bolt-circle sweep for housing body and fastener margin.",
    best: {
      label: `${best.boltCount}× ${best.recommendedBoltSize}`,
      utilization: best.designStatus === "safe" ? 0.72 : 1.05,
      fields: { boltCount: best.boltCount, boltCircleDiameter: best.boltCircleDiameter * 1000 },
      detail: `body SF ${best.bodySafetyFactor.toFixed(2)}`,
    },
    ranked: [
      {
        label: `${best.boltCount} bolts`,
        utilization: best.designStatus === "safe" ? 0.72 : 1.05,
        fields: { boltCount: best.boltCount },
        detail: best.recommendedBoltSize,
      },
    ],
  };
}

export function designMachineModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "gears") return designGearModule(userInputs);
  if (moduleId === "shafts") return designShaftDiameter(userInputs);
  if (moduleId === "bearings") return designBearingSelection(userInputs);
  if (moduleId === "housing") return designHousingMount(userInputs);
  if (moduleId === "flywheels") return designFlywheelInertia(userInputs);
  if (moduleId === "bevel-gears") return designBevelGear(userInputs);
  if (moduleId === "worm-gears") return designWormGear(userInputs);
  if (moduleId === "planetary-gears") return designPlanetaryGear(userInputs);
  if (moduleId === "gear-ratio-design") return designGearRatio(userInputs);
  if (moduleId === "internal-gears-rack") return designGearModule(userInputs);
  if (moduleId === "power-screws") return designShaftDiameter(userInputs);
  if (moduleId === "plain-bearings") return designPlainBearing(userInputs);
  if (moduleId === "brakes-clutches") return designBrakesClutches(userInputs);
  if (moduleId === "cams") return designCamProfile(userInputs);
  return designShaftDiameter(userInputs);
}
