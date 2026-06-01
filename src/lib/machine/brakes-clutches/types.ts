export type BrakesClutchesConfig = { frictionCoeff: number; outerRadius: number; innerRadius: number; actuationForce: number; speed: number; engagementTime: number; safetyFactorTarget: number; };
export type BrakesClutchesResult = { frictionTorque: number; powerDissipated: number; energyPerStop: number; safetyFactor: number; };
