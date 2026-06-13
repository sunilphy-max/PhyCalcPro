import { solveWeldEngine } from "@/lib/fasteners/welds/engine";
import { solveRivetEngine } from "@/lib/fasteners/rivets/engine";
import { solveKeysSplinesEngine } from "@/lib/fasteners/keys-splines/engine";
import { solveShaftHubEngine } from "@/lib/fasteners/shaft-hubs/engine";
import { solvePinEngine } from "@/lib/fasteners/pins/engine";
import { solveSafetyFactorEngine } from "@/lib/fasteners/safetyFactor/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

import { COARSE_THREADS } from "@/data/catalogs/boltTable";

const WELD_STEEL = { name: "Steel", strength: 410e6, yieldStress: 250e6 };
const RIVET_MATERIAL = {
  name: "Steel",
  yieldStress: 250e6,
  shearStrength: 180e6,
  bearingStrength: 350e6,
};

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designBoltSize(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const shear = userInputs.maxForce ?? userInputs.shearForce ?? 18000;
  const allowable = userInputs.allowableStressPa ?? 260e6;
  const items = COARSE_THREADS.map((bolt) => {
    const stress = shear / bolt.stressArea;
    return {
      label: bolt.designation,
      utilization: stress / allowable,
      fields: { boltSize: bolt.designation, majorDiameter: bolt.d },
      detail: `tau ${(stress / 1e6).toFixed(0)} MPa (As ${(bolt.stressArea * 1e6).toFixed(1)} mm²)`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "ISO coarse-thread size selection from shear stress.");
}

export function designWeldThroat(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const sizesMm = [4, 5, 6, 8, 10, 12];
  const items = sizesMm.map((sMm) => {
    try {
      const res = solveWeldEngine({
        weldType: "fillet",
        weldSize: sMm / 1000,
        weldLength: userInputs.length ?? 0.15,
        weldCount: userInputs.weldCount ?? 2,
        shearForce: userInputs.shearForce ?? userInputs.maxForce ?? 20000,
        axialForce: userInputs.axialLoad ?? 0,
        eccentricity: userInputs.eccentricity ?? 0,
        material: WELD_STEEL,
      });
      const util = 1.5 / Math.max(res.safetyFactorOverall, 1e-9);
      return {
        label: `${sMm} mm leg`,
        utilization: util,
        fields: { weldSize: sMm },
        detail: `SF ${res.safetyFactorOverall.toFixed(2)}`,
      };
    } catch {
      return { label: `${sMm} mm`, utilization: 99, fields: { weldSize: sMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Fillet weld leg-size sweep for throat stress.");
}

export function designRivetDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const diametersMm = [3, 4, 5, 6, 8, 10];
  const items = diametersMm.map((dMm) => {
    try {
      const res = solveRivetEngine({
        rivetDiameter: dMm / 1000,
        plateThickness: 0.005,
        quantity: userInputs.count ?? 2,
        shearForce: userInputs.maxForce ?? 8000,
        axialForce: userInputs.axialLoad ?? 0,
        material: RIVET_MATERIAL,
        rivetType: "solid",
      });
      const util = 1.5 / Math.max(res.safetyFactorOverall, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { rivetDiameter: dMm },
        detail: `SF ${res.safetyFactorOverall.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { rivetDiameter: dMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Rivet diameter sweep for shear capacity.");
}

export function designKeySelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const keys = [
    { w: 8, h: 7, label: "8×7" },
    { w: 10, h: 8, label: "10×8" },
    { w: 12, h: 8, label: "12×8" },
    { w: 14, h: 9, label: "14×9" },
    { w: 16, h: 10, label: "16×10" },
  ];
  const shaftD = userInputs.shaftDiameter ?? 0.04;
  const items = keys.map((k) => {
    try {
      const res = solveKeysSplinesEngine({
        torque: userInputs.torque ?? 800,
        shaftDiameter: shaftD,
        keyWidth: k.w / 1000,
        keyHeight: k.h / 1000,
        keyLength: userInputs.length ?? 0.04,
        yieldStress: 250e6,
        keyType: "parallel",
      });
      const util = (userInputs.torque ?? 800) / Math.max(res.capacityTorque, 1e-9);
      return {
        label: k.label,
        utilization: util,
        fields: { keyWidth: k.w, keyHeight: k.h },
        detail: `T_cap ${res.capacityTorque.toFixed(0)} N·m`,
      };
    } catch {
      return { label: k.label, utilization: 99, fields: { keyWidth: k.w, keyHeight: k.h }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Parallel key size selection from torque capacity.");
}

export function designShaftHubInterference(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const interferencesUm = [20, 30, 40, 50, 60, 80, 100];
  const shaftD = userInputs.shaftDiameter ?? 0.05;
  const items = interferencesUm.map((um) => {
    try {
      const res = solveShaftHubEngine({
        shaftDiameter: shaftD,
        hubOuterDiameter: shaftD * 2,
        hubLength: userInputs.length ?? 0.04,
        interference: um / 1e6,
        frictionCoeff: 0.12,
        modulus: 210e9,
      });
      const util = (userInputs.torque ?? 500) / Math.max(res.frictionTorque, 1e-9);
      return {
        label: `${um} µm`,
        utilization: util,
        fields: { interference: um },
        detail: `T ${res.frictionTorque.toFixed(0)} N·m`,
      };
    } catch {
      return { label: `${um} µm`, utilization: 99, fields: { interference: um }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Interference fit sweep for torque transmission.");
}

export function designPinDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const diametersMm = [6, 8, 10, 12, 16, 20];
  const items = diametersMm.map((dMm) => {
    try {
      const res = solvePinEngine({
        pinDiameter: dMm / 1000,
        plateThickness: 0.01,
        pinCount: userInputs.count ?? 1,
        force: userInputs.maxForce ?? 12000,
        pinMaterialYield: 250e6,
      });
      const util = 1.5 / Math.max(Math.min(res.shearSafety, res.bearingSafety), 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { pinDiameter: dMm },
        detail: `shear SF ${res.shearSafety.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { pinDiameter: dMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Pin diameter sweep for shear capacity.");
}

export function designSafetyFactorTarget(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const target = userInputs.targetSafetyFactor ?? 2;
  const diametersMm = [20, 25, 30, 35, 40, 50];
  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveSafetyFactorEngine({
        diameter: d,
        axialForce: userInputs.axialLoad ?? 10000,
        shearForce: userInputs.shearForce ?? 5000,
        bendingMoment: userInputs.bendingMoment ?? 200,
        torque: userInputs.torque ?? 150,
        yieldStrength: userInputs.yieldStress ?? 250e6,
        ultimateStrength: userInputs.ultimateStrength ?? 400e6,
      });
      const util = target / Math.max(res.governingFactor, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { diameter: dMm },
        detail: `SF ${res.governingFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { diameter: dMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Diameter sweep for target combined safety factor.");
}

export function designFastenerModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "bolts") return designBoltSize(userInputs);
  if (moduleId === "welds") return designWeldThroat(userInputs);
  if (moduleId === "rivets") return designRivetDiameter(userInputs);
  if (moduleId === "keys-splines") return designKeySelection(userInputs);
  if (moduleId === "shaft-hubs") return designShaftHubInterference(userInputs);
  if (moduleId === "pins") return designPinDiameter(userInputs);
  if (moduleId === "safety-factor") return designSafetyFactorTarget(userInputs);
  return designBoltSize(userInputs);
}
