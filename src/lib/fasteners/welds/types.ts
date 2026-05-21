export type WeldType = "fillet" | "groove";

export type WeldMaterial = {
  name: string;
  strength: number;
  yieldStress: number;
};

export type WeldConfig = {
  weldType: WeldType;
  weldSize: number;
  weldLength: number;
  weldCount: number;
  shearForce: number;
  axialForce: number;
  material: WeldMaterial;
};

export type WeldResult = {
  weldType: WeldType;
  weldSize: number;
  weldLength: number;
  weldCount: number;
  throatSize: number;
  totalThroatArea: number;
  shearStress: number;
  axialStress: number;
  resultantStress: number;
  allowableShear: number;
  allowableAxial: number;
  allowableResultant: number;
  safetyFactorShear: number;
  safetyFactorAxial: number;
  safetyFactorResultant: number;
  safetyFactorOverall: number;
  governingMode: "shear" | "axial" | "resultant";
  designStatus: "safe" | "warning" | "critical";
  material: WeldMaterial;
};
