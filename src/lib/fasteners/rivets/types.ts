export type RivetType = "solid" | "blind";

export type RivetMaterial = {
  name: string;
  yieldStress: number;
  shearStrength: number;
  bearingStrength: number;
};

export type RivetConfig = {
  rivetDiameter: number;
  plateThickness: number;
  quantity: number;
  shearForce: number;
  axialForce: number;
  material: RivetMaterial;
  rivetType: RivetType;
};

export type RivetResult = {
  rivetDiameter: number;
  plateThickness: number;
  quantity: number;
  shearForce: number;
  axialForce: number;
  rivetArea: number;
  shearStress: number;
  axialStress: number;
  bearingStress: number;
  vonMisesStress: number;
  allowableShear: number;
  allowableAxial: number;
  allowableBearing: number;
  safetyFactorShear: number;
  safetyFactorAxial: number;
  safetyFactorBearing: number;
  safetyFactorOverall: number;
  governingMode: "shear" | "axial" | "bearing";
  designStatus: "safe" | "warning" | "critical";
  material: RivetMaterial;
  rivetType: RivetType;
};
