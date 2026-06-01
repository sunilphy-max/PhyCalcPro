export type WormGearConfig = { power: number; speed: number; wormStarts: number; gearTeeth: number; module: number; faceWidth: number; frictionCoeff: number; leadAngleDeg: number; yieldStress: number; };
export type WormGearResult = { ratio: number; efficiency: number; wormTorque: number; contactStress: number; contactSafety: number; axialForce: number; };
