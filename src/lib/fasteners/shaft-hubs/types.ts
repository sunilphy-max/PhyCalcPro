export type ShaftHubConfig = { shaftDiameter: number; hubOuterDiameter: number; hubLength: number; interference: number; frictionCoeff: number; modulus: number; };
export type ShaftHubResult = { contactPressure: number; frictionTorque: number; requiredAssemblyForce: number; };
