import { solveGearEngine } from "@/lib/machine/gears/engine";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import { solveFlywheelEngine } from "@/lib/machine/flywheels/engine";
import { solveBevelGearEngine } from "@/lib/machine/bevel-gears/engine";
import { solveWormGearEngine } from "@/lib/machine/worm-gears/engine";
import { solvePlanetaryGearEngine } from "@/lib/machine/planetary-gears/engine";
import { solveGearRatioDesignEngine } from "@/lib/machine/gear-ratio-design/engine";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import { solveBrakesClutchesEngine } from "@/lib/machine/brakes-clutches/engine";
import { solveCamEngine } from "@/lib/machine/cams/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

const STEEL_MATERIAL = {
  name: "Steel",
  E: 210e9,
  yieldStress: 250e6,
  poisson: 0.3,
};

const SHAFT_MATERIAL = {
  name: "Steel",
  E: 210e9,
  G: 80e9,
  density: 7850,
  yieldStress: 250e6,
};

const BEARING_MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 1,
  staticRatingFactor: 1,
  allowableLife: 1e6,
};

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
  const modules = [2, 2.5, 3, 4, 5, 6];

  const items = modules.map((m) => {
    const moduleM = m / 1000;
    const faceWidth = (10 * m) / 1000;
    try {
      const res = solveGearEngine({
        power,
        speed,
        module: moduleM,
        faceWidth,
        pinionTeeth: userInputs.pinionTeeth ?? 20,
        gearRatio: ratio,
        material: STEEL_MATERIAL,
      });
      const util = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Module ${m}`,
        utilization: util,
        fields: { module: m, faceWidth: 10 * m, moduleUnit: "mm", faceWidthUnit: "mm" },
        detail: `bending SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `m=${m}`, utilization: 99, fields: { module: m }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Gear module and face-width sweep for Lewis bending safety.");
}

export function designShaftDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const torque = userInputs.torque ?? 420;
  const moment = userInputs.bendingMoment ?? 650;
  const targetSf = userInputs.targetSafetyFactor ?? 2;
  const length = userInputs.length ?? 0.6;
  const diametersMm = [20, 25, 30, 35, 40, 45, 50, 60, 70];

  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveShaftEngine({
        geometry: { diameter: d, length },
        material: SHAFT_MATERIAL,
        loads: [{ position: length / 2, torque, bendingMoment: moment }],
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

  return fromSweep(sweepCatalogForUtilization(items), "Shaft diameter sweep for combined FEA stress and target SF.");
}

export function designBearingSelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const radial = userInputs.maxForce ?? 6200;
  const speed = userInputs.speedDriver ?? 1500;
  const lifeHours = userInputs.requiredLife ?? 20000;
  try {
    const req = solveBearingEngine({
      radialLoad: radial,
      axialLoad: userInputs.axialLoad ?? 0,
      speed,
      lifeHours,
      safetyFactor: userInputs.targetSafetyFactor ?? 1.5,
      bearingType: "deep_groove",
      material: BEARING_MATERIAL,
    });
    const bearings = [
      { name: "6205", C: 14000 },
      { name: "6206", C: 19500 },
      { name: "6207", C: 25500 },
      { name: "6307", C: 33500 },
    ];
    const items = bearings.map((b) => ({
      label: b.name,
      utilization: req.requiredDynamicRating / b.C,
      fields: { bearingSeries: b.name },
      detail: `need ${(req.requiredDynamicRating / 1000).toFixed(1)} kN`,
    }));
    return fromSweep(sweepCatalogForUtilization(items), "Rolling bearing selection from required dynamic rating C.");
  } catch {
    return fromSweep(sweepCatalogForUtilization([]), "Bearing design requires valid load and life inputs.");
  }
}

export function designFlywheelInertia(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const rpm = userInputs.speedDriver ?? userInputs.rpm ?? 1500;
  const targetEnergy = userInputs.energy ?? 5000;
  const diametersMm = [200, 250, 300, 350, 400, 450, 500];
  const thicknessMm = 30;

  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    const t = thicknessMm / 1000;
    try {
      const res = solveFlywheelEngine({
        outerDiameter: d,
        thickness: t,
        faceWidth: t,
        density: 7850,
        rpm,
        yieldStress: 250e6,
      });
      const util = targetEnergy / Math.max(res.storedEnergy, 1e-9);
      return {
        label: `Ø${dMm}×${thicknessMm}`,
        utilization: util,
        fields: { outerDiameter: dMm, thickness: thicknessMm },
        detail: `E ${res.storedEnergy.toFixed(0)} J`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { outerDiameter: dMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Flywheel OD sweep for stored energy target.");
}

export function designBevelGear(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 12000;
  const speed = userInputs.speedDriver ?? 1200;
  const modules = [2, 2.5, 3, 4, 5];

  const items = modules.map((m) => {
    try {
      const res = solveBevelGearEngine({
        power,
        speed,
        module: m / 1000,
        pinionTeeth: userInputs.pinionTeeth ?? 18,
        gearRatio: userInputs.ratio ?? 2.5,
        faceWidth: (8 * m) / 1000,
        yieldStress: 250e6,
        pressureAngleDeg: 20,
      });
      const util = 1.5 / Math.max(res.bendingSafety, 1e-9);
      return {
        label: `Module ${m}`,
        utilization: util,
        fields: { module: m, faceWidth: 8 * m },
        detail: `SF ${res.bendingSafety.toFixed(2)}`,
      };
    } catch {
      return { label: `m=${m}`, utilization: 99, fields: { module: m }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Bevel gear module sweep for bending/contact screening.");
}

export function designWormGear(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 5000;
  const speed = userInputs.speedDriver ?? 1450;
  const teethOptions = [30, 40, 50, 60, 80];

  const items = teethOptions.map((gearTeeth) => {
    try {
      const res = solveWormGearEngine({
        power,
        speed,
        wormStarts: 1,
        gearTeeth,
        module: 0.003,
        faceWidth: 0.025,
        frictionCoeff: 0.05,
        leadAngleDeg: 5,
        yieldStress: 250e6,
      });
      const util = 1.5 / Math.max(res.contactSafety, 1e-9);
      return {
        label: `${gearTeeth} teeth wheel`,
        utilization: util,
        fields: { gearTeeth, module: 3 },
        detail: `eff ${(res.efficiency * 100).toFixed(0)}%`,
      };
    } catch {
      return { label: `z=${gearTeeth}`, utilization: 99, fields: { gearTeeth }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Worm wheel tooth-count sweep for contact safety.");
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
  const diametersMm = [30, 40, 50, 60, 70, 80];

  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solvePlainBearingEngine({
        diameter: d,
        length: d * 1.2,
        load,
        speed,
        viscosity: 0.03,
        clearance: d * 0.001,
      });
      const util = res.minFilmThickness < 1e-5 ? 1.5 : 0.7;
      return {
        label: `Ø${dMm} journal`,
        utilization: util,
        fields: { diameter: dMm, length: dMm * 1.2 },
        detail: `h_min ${(res.minFilmThickness * 1e6).toFixed(1)} µm`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { diameter: dMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Journal bearing diameter sweep for film thickness.");
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

export function designCamProfile(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const lift = userInputs.lift ?? 0.01;
  const speed = userInputs.speedDriver ?? 300;
  const radiiMm = [30, 35, 40, 45, 50, 60];

  const items = radiiMm.map((rMm) => {
    const r = rMm / 1000;
    try {
      const res = solveCamEngine({
        baseCircle: r,
        radius: r * 0.2,
        lift,
        speed,
        dwellAngle: 90,
        motionLaw: "simple_harmonic",
        profileType: "roller_follower",
      });
      const util = res.peakPressureAngle / 30;
      return {
        label: `R${rMm} mm base`,
        utilization: util,
        fields: { baseCircle: rMm, baseRadius: rMm },
        detail: `pressure angle ${res.peakPressureAngle.toFixed(1)}°`,
      };
    } catch {
      return { label: `R${rMm}`, utilization: 99, fields: { baseCircle: rMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Cam base-radius sweep for pressure angle limit.");
}

export function designMachineModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "gears") return designGearModule(userInputs);
  if (moduleId === "shafts") return designShaftDiameter(userInputs);
  if (moduleId === "bearings") return designBearingSelection(userInputs);
  if (moduleId === "flywheels") return designFlywheelInertia(userInputs);
  if (moduleId === "bevel-gears") return designBevelGear(userInputs);
  if (moduleId === "worm-gears") return designWormGear(userInputs);
  if (moduleId === "planetary-gears") return designPlanetaryGear(userInputs);
  if (moduleId === "gear-ratio-design") return designGearRatio(userInputs);
  if (moduleId === "plain-bearings") return designPlainBearing(userInputs);
  if (moduleId === "brakes-clutches") return designBrakesClutches(userInputs);
  if (moduleId === "cams") return designCamProfile(userInputs);
  return designShaftDiameter(userInputs);
}
