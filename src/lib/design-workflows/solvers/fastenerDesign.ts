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
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { resolveMaterial, toWeldMaterial, toRivetMaterial } from "@/lib/materials/materialCatalogService";
import { DEFAULT_STRUCTURAL, STEEL_E, STEEL_YIELD } from "@/lib/materials/materialDefaults";

const WELD_DEFAULT = toWeldMaterial(
  resolveMaterial(getDefaultMaterialNameForProfile("weld-base"), "weld-base")
);
const RIVET_DEFAULT = toRivetMaterial(
  resolveMaterial(getDefaultMaterialNameForProfile("rivet"), "rivet")
);

/** Fillet / groove leg sizes (mm) — MITCalc-style discrete series. */
const WELD_LEG_MM = [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20];
const RIVET_DIAMETERS_MM = [3, 4, 5, 6, 8, 10, 12, 14, 16];
const PIN_DIAMETERS_MM = [4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 30];
/** Interference fit series in mm (matches shaft-hubs form display unit). */
const INTERFERENCE_MM = [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15];

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

/**
 * Fillet weld leg-size sweep.
 * Apply field `weldSize` is in **meters** (matches welds page SI form state).
 */
export function designWeldThroat(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const weldLength = userInputs.length ?? 0.15;
  const weldCount = userInputs.weldCount ?? 2;
  const shearForce = userInputs.shearForce ?? userInputs.maxForce ?? 20000;
  const axialForce = userInputs.axialLoad ?? 0;
  const eccentricity = userInputs.eccentricity ?? 0;

  const items = WELD_LEG_MM.map((sMm) => {
    const weldSizeM = sMm / 1000;
    try {
      const res = solveWeldEngine({
        weldType: "fillet",
        weldSize: weldSizeM,
        weldLength,
        weldCount,
        shearForce,
        axialForce,
        eccentricity,
        material: WELD_DEFAULT,
      });
      const util = targetSf / Math.max(res.safetyFactorOverall, 1e-9);
      return {
        label: `${sMm} mm leg`,
        utilization: util,
        fields: { weldSize: weldSizeM },
        detail: `SF ${res.safetyFactorOverall.toFixed(2)} · throat ${(res.throatSize * 1000).toFixed(2)} mm`,
      };
    } catch {
      return { label: `${sMm} mm`, utilization: 99, fields: { weldSize: weldSizeM }, detail: "invalid" };
    }
  });
  return fromSweep(
    sweepCatalogForUtilization(items),
    "Fillet weld leg-size catalog sweep for throat / eccentric stress (target SF)."
  );
}

/** Rivet diameter in **meters** (matches rivets page form). */
export function designRivetDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const shearForce = userInputs.shearForce ?? userInputs.maxForce ?? 8000;
  const axialForce = userInputs.axialLoad ?? 0;
  const quantity = userInputs.count ?? 2;
  const plateThickness = userInputs.thickness != null ? userInputs.thickness / 1000 : 0.005;

  const items = RIVET_DIAMETERS_MM.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveRivetEngine({
        rivetDiameter: d,
        plateThickness: Math.max(plateThickness, d * 0.5),
        quantity,
        shearForce,
        axialForce,
        material: RIVET_DEFAULT,
        rivetType: "solid",
      });
      const util = targetSf / Math.max(res.safetyFactorOverall, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { rivetDiameter: d },
        detail: `SF ${res.safetyFactorOverall.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { rivetDiameter: d }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Rivet diameter catalog sweep for shear/bearing capacity.");
}

export function designKeySelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const keys = [
    { w: 6, h: 6, label: "6×6" },
    { w: 8, h: 7, label: "8×7" },
    { w: 10, h: 8, label: "10×8" },
    { w: 12, h: 8, label: "12×8" },
    { w: 14, h: 9, label: "14×9" },
    { w: 16, h: 10, label: "16×10" },
    { w: 18, h: 11, label: "18×11" },
    { w: 20, h: 12, label: "20×12" },
  ];
  const shaftD = userInputs.shaftDiameter ?? 0.04;
  const torque = userInputs.torque ?? 800;
  const keyLength = userInputs.length ?? Math.max(0.04, shaftD);
  const items = keys.map((k) => {
    try {
      const res = solveKeysSplinesEngine({
        torque,
        shaftDiameter: shaftD,
        keyWidth: k.w / 1000,
        keyHeight: k.h / 1000,
        keyLength,
        yieldStress: userInputs.yieldStress ?? STEEL_YIELD,
        keyType: "parallel",
      });
      const util = torque / Math.max(res.capacityTorque, 1e-9);
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

/** Interference in **mm** (matches shaft-hubs form). */
export function designShaftHubInterference(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const shaftD = userInputs.shaftDiameter ?? 0.05;
  const torque = userInputs.torque ?? 500;
  const hubLength = userInputs.length ?? 0.04;
  const items = INTERFERENCE_MM.map((mm) => {
    try {
      const res = solveShaftHubEngine({
        shaftDiameter: shaftD,
        hubOuterDiameter: shaftD * 2,
        hubLength,
        interference: mm / 1000,
        frictionCoeff: 0.12,
        modulus: userInputs.E ?? STEEL_E,
      });
      const util = torque / Math.max(res.frictionTorque, 1e-9);
      return {
        label: `${mm} mm`,
        utilization: util,
        fields: { interference: mm },
        detail: `T ${res.frictionTorque.toFixed(0)} N·m`,
      };
    } catch {
      return { label: `${mm} mm`, utilization: 99, fields: { interference: mm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Interference-fit sweep for friction torque capacity.");
}

/** Pin diameter in **mm** (matches pins form). */
export function designPinDiameter(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const force = userInputs.maxForce ?? 12000;
  const pinCount = userInputs.count ?? 1;
  const plateThickness = userInputs.thickness != null ? userInputs.thickness / 1000 : 0.01;
  const items = PIN_DIAMETERS_MM.map((dMm) => {
    try {
      const res = solvePinEngine({
        pinDiameter: dMm / 1000,
        plateThickness: Math.max(plateThickness, (dMm / 1000) * 0.6),
        pinCount,
        force,
        pinMaterialYield: userInputs.yieldStress ?? STEEL_YIELD,
      });
      const util = targetSf / Math.max(Math.min(res.shearSafety, res.bearingSafety), 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { pinDiameter: dMm },
        detail: `shear SF ${res.shearSafety.toFixed(2)} · bearing SF ${res.bearingSafety.toFixed(2)}`,
      };
    } catch {
      return { label: `Ø${dMm}`, utilization: 99, fields: { pinDiameter: dMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Pin diameter catalog sweep for shear and bearing SF.");
}

export function designSafetyFactorTarget(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const target = userInputs.targetSafetyFactor ?? 2;
  const diametersMm = [16, 20, 25, 30, 35, 40, 50, 60, 80];
  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveSafetyFactorEngine({
        diameter: d,
        axialForce: userInputs.axialLoad ?? 10000,
        shearForce: userInputs.shearForce ?? 5000,
        bendingMoment: userInputs.bendingMoment ?? 200,
        torque: userInputs.torque ?? 150,
        yieldStrength: userInputs.yieldStress ?? STEEL_YIELD,
        ultimateStrength: userInputs.ultimateStrength ?? DEFAULT_STRUCTURAL.ultimateStrength,
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
