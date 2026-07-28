/**
 * Integrated metric key sizing for shaft worksheets (DIN 6885 / ISO style).
 */

import { solveKeysSplinesEngine } from "@/lib/fasteners/keys-splines/engine";
import type { ShaftKeysDesign, ShaftMaterial } from "./types";

/** DIN 6885-1 approximate rectangular key sections by shaft diameter band (m). */
const KEY_TABLE: { dMax: number; width: number; height: number }[] = [
  { dMax: 0.008, width: 0.002, height: 0.002 },
  { dMax: 0.01, width: 0.003, height: 0.003 },
  { dMax: 0.012, width: 0.004, height: 0.004 },
  { dMax: 0.017, width: 0.005, height: 0.005 },
  { dMax: 0.022, width: 0.006, height: 0.006 },
  { dMax: 0.03, width: 0.008, height: 0.007 },
  { dMax: 0.038, width: 0.01, height: 0.008 },
  { dMax: 0.044, width: 0.012, height: 0.008 },
  { dMax: 0.05, width: 0.014, height: 0.009 },
  { dMax: 0.058, width: 0.016, height: 0.01 },
  { dMax: 0.065, width: 0.018, height: 0.011 },
  { dMax: 0.075, width: 0.02, height: 0.012 },
  { dMax: 0.085, width: 0.022, height: 0.014 },
  { dMax: 0.095, width: 0.025, height: 0.014 },
  { dMax: 0.11, width: 0.028, height: 0.016 },
  { dMax: 0.13, width: 0.032, height: 0.018 },
  { dMax: 0.15, width: 0.036, height: 0.02 },
  { dMax: 0.17, width: 0.04, height: 0.022 },
  { dMax: 0.2, width: 0.045, height: 0.025 },
  { dMax: 0.23, width: 0.05, height: 0.028 },
  { dMax: Infinity, width: 0.056, height: 0.032 },
];

export function recommendKeySection(shaftDiameterM: number): { width: number; height: number } {
  const d = Math.max(shaftDiameterM, 1e-6);
  const row = KEY_TABLE.find((r) => d <= r.dMax) ?? KEY_TABLE[KEY_TABLE.length - 1]!;
  return { width: row.width, height: row.height };
}

export function designShaftKey(params: {
  shaftDiameter: number;
  torque: number;
  material: ShaftMaterial;
  keyLength?: number;
  targetSf?: number;
}): ShaftKeysDesign | null {
  const { shaftDiameter, torque, material } = params;
  if (torque <= 0 || shaftDiameter <= 0) return null;

  const { width, height } = recommendKeySection(shaftDiameter);
  const length = params.keyLength ?? Math.max(shaftDiameter, width * 4);
  const targetSf = params.targetSf ?? 1.5;

  const result = solveKeysSplinesEngine({
    shaftDiameter,
    keyWidth: width,
    keyHeight: height,
    keyLength: length,
    torque,
    yieldStress: material.yieldStress,
    keyType: "parallel",
  });

  const governing = Math.min(result.shearSafety, result.bearingSafety);
  const status: ShaftKeysDesign["status"] =
    governing >= targetSf ? "safe" : governing >= targetSf * 0.8 ? "warning" : "critical";

  return {
    shaftDiameter,
    width,
    height,
    length,
    shearStress: result.shearStress,
    bearingStress: result.bearingStress,
    shearSafety: result.shearSafety,
    bearingSafety: result.bearingSafety,
    capacityTorque: result.capacityTorque,
    appliedTorque: torque,
    standard: "DIN 6885 / ISO rectangular key (indicative)",
    status,
  };
}
