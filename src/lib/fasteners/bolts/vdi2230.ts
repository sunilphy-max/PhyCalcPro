/**
 * VDI 2230-1 single-bolt procedure for concentrically loaded, preloaded joints.
 *
 * Implements the core worksheet steps: thread geometry per ISO 724, bolt and
 * clamped-part resiliences (deformation-cone equivalent area), load factor Φ,
 * embedding losses, permissible assembly preload from the 90 %-utilization
 * combined-stress criterion, tightening torque, residual clamp force,
 * working-state utilization, thread fatigue (σASV for threads rolled before
 * heat treatment) and head bearing surface pressure.
 */

export type BoltPropertyClass = "8.8" | "10.9" | "12.9";

export type TighteningMethod =
  | "yield_controlled"
  | "angle_controlled"
  | "torque_wrench"
  | "impact";

export type MetricBoltSize = {
  designation: string;
  /** Nominal diameter d (m) */
  d: number;
  /** Coarse pitch P (m) */
  pitch: number;
  /** Head bearing outer diameter dw (m), ISO 4014/4017 hex */
  dw: number;
  /** Clearance hole dh (m), ISO 273 medium */
  dh: number;
};

export const METRIC_BOLT_SIZES: MetricBoltSize[] = [
  { designation: "M6", d: 0.006, pitch: 0.001, dw: 0.0089, dh: 0.0066 },
  { designation: "M8", d: 0.008, pitch: 0.00125, dw: 0.0116, dh: 0.009 },
  { designation: "M10", d: 0.01, pitch: 0.0015, dw: 0.0146, dh: 0.011 },
  { designation: "M12", d: 0.012, pitch: 0.00175, dw: 0.0166, dh: 0.0135 },
  { designation: "M16", d: 0.016, pitch: 0.002, dw: 0.0225, dh: 0.0175 },
  { designation: "M20", d: 0.02, pitch: 0.0025, dw: 0.0282, dh: 0.022 },
  { designation: "M24", d: 0.024, pitch: 0.003, dw: 0.0336, dh: 0.026 },
  { designation: "M30", d: 0.03, pitch: 0.0035, dw: 0.0427, dh: 0.033 },
];

/** ISO 898-1 minimum 0.2 % proof stress (Pa) */
export const PROPERTY_CLASS_RP02: Record<BoltPropertyClass, number> = {
  "8.8": 640e6,
  "10.9": 940e6,
  "12.9": 1100e6,
};

/** VDI 2230 tightening (scatter) factor αA guide values */
export const TIGHTENING_FACTOR: Record<TighteningMethod, number> = {
  yield_controlled: 1.1,
  angle_controlled: 1.2,
  torque_wrench: 1.6,
  impact: 2.5,
};

export type Vdi2230Config = {
  /** Bolt designation, e.g. "M12" (coarse thread) */
  size: string;
  propertyClass: BoltPropertyClass;
  /** Clamp length lK (m) */
  clampLength: number;
  /** Elastic modulus of clamped parts (Pa) */
  jointModulus: number;
  /** Axial working load FA per bolt (N) */
  axialLoad: number;
  /** Alternating portion of the axial load, amplitude FAa (N); default FA/2 (pulsating) */
  alternatingLoad?: number;
  /** Transverse load FQ per bolt (N) for the slip check */
  transverseLoad?: number;
  /** Interface friction coefficient for slip, μT */
  interfaceFriction?: number;
  /** Thread friction μG */
  threadFriction?: number;
  /** Head bearing friction μK */
  headFriction?: number;
  /** Load introduction factor n (0..1), default 0.5 */
  loadIntroductionFactor?: number;
  tighteningMethod?: TighteningMethod;
  /** Preload utilization ν of Rp0.2 at assembly, default 0.9 */
  utilization?: number;
  /** Number of clamped interfaces (plates − 1 + head + nut faces handled internally) */
  innerInterfaces?: number;
  /** Allowable surface pressure under the head (Pa), default 700 MPa (steel) */
  allowablePressure?: number;
  /** Bolt elastic modulus (Pa), default 205 GPa */
  boltModulus?: number;
};

export type Vdi2230Result = {
  size: MetricBoltSize;
  rp02: number;
  /** Pitch diameter d2, minor diameter d3, stress area As, stress diameter d0 (m, m, m², m) */
  d2: number;
  d3: number;
  stressArea: number;
  /** Bolt resilience δS and plate resilience δP (m/N) */
  boltResilience: number;
  plateResilience: number;
  /** Load factor Φ = n·δP/(δS+δP) */
  loadFactor: number;
  /** Embedding amount fZ (m) and preload loss FZ (N) */
  embedding: number;
  embeddingLoss: number;
  /** Permissible assembly preload FM,zul (N) and minimum after scatter FM,min */
  assemblyPreloadMax: number;
  assemblyPreloadMin: number;
  tighteningFactor: number;
  /** Tightening torque MA for FM,zul (N·m) */
  tighteningTorque: number;
  /** Residual clamp force at FM,min after embedding and load relief (N) */
  residualClampForce: number;
  /** Clamp force required to transmit FQ by friction (N) */
  requiredClampForce: number;
  slipSafetyFactor: number;
  /** Max bolt force in service and working-state utilization σred,B/Rp0.2 */
  maxBoltForce: number;
  workingStressUtilization: number;
  /** Thread fatigue: stress amplitude σa, endurance σASV, safety SD */
  stressAmplitude: number;
  enduranceLimit: number;
  fatigueSafetyFactor: number;
  /** Head bearing pressure and allowable (Pa) */
  surfacePressure: number;
  allowablePressure: number;
  surfacePressureUtilization: number;
};

export function findBoltSize(designation: string): MetricBoltSize | undefined {
  return METRIC_BOLT_SIZES.find((s) => s.designation === designation);
}

export function solveVdi2230(config: Vdi2230Config): Vdi2230Result {
  const size = findBoltSize(config.size);
  if (!size) throw new Error(`Unknown bolt size: ${config.size}`);

  const rp02 = PROPERTY_CLASS_RP02[config.propertyClass];
  const ES = config.boltModulus ?? 205e9;
  const EP = config.jointModulus;
  const lK = Math.max(config.clampLength, 1e-6);
  const muG = config.threadFriction ?? 0.12;
  const muK = config.headFriction ?? 0.12;
  const muT = config.interfaceFriction ?? 0.12;
  const n = config.loadIntroductionFactor ?? 0.5;
  const nu = config.utilization ?? 0.9;
  const method = config.tighteningMethod ?? "torque_wrench";
  const alphaA = TIGHTENING_FACTOR[method];
  const FA = config.axialLoad;
  const FAa = config.alternatingLoad ?? FA / 2;
  const FQ = config.transverseLoad ?? 0;

  // ISO 724 thread geometry
  const { d, pitch: P, dw, dh } = size;
  const d2 = d - 0.6495 * P;
  const d3 = d - 1.2269 * P;
  const d0 = (d2 + d3) / 2;
  const As = (Math.PI / 4) * d0 * d0;
  const AN = (Math.PI / 4) * d * d;

  // Bolt resilience: shank (nominal section) over lK plus elastic thread/head
  // engagement allowances of 0.4d (head) + 0.5d (engaged thread) + 0.4d (nut),
  // VDI 2230 §5.1.1 simplified
  const boltResilience =
    lK / (ES * AN) + (0.4 * d) / (ES * AN) + (0.5 * d + 0.4 * d) / (ES * As);

  // Clamped parts: deformation-cone equivalent area (VDI 2230 eq. 5.2/23,
  // valid when the joint outline exceeds the cone, DA ≥ dw + lK)
  const x = Math.cbrt((lK * dw) / Math.pow(lK + dw, 2));
  const Aers =
    (Math.PI / 4) * (dw * dw - dh * dh) +
    (Math.PI / 8) * dw * lK * (Math.pow(x + 1, 2) - 1);
  const plateResilience = lK / (EP * Aers);

  const phi = (n * plateResilience) / (boltResilience + plateResilience);

  // Embedding (VDI 2230 Table 5.4/1, Rz 10–40 µm, loaded in tension):
  // 3 µm thread + 3 µm per head/nut bearing + 2 µm per inner interface
  const innerInterfaces = config.innerInterfaces ?? 1;
  const embedding = (3 + 3 + 3 + 2 * innerInterfaces) * 1e-6;
  const embeddingLoss = embedding / (boltResilience + plateResilience);

  // Permissible assembly preload from σred = ν·Rp0.2 with thread torsion
  // (VDI 2230 eq. 5.5/2): FM,zul = ν·Rp0.2·A0 / √(1 + 3·[1.5·(d2/d0)·(P/(π·d2) + 1.155·μG)]²)
  const torsionTerm = 1.5 * (d2 / d0) * (P / (Math.PI * d2) + 1.155 * muG);
  const assemblyPreloadMax = (nu * rp02 * As) / Math.sqrt(1 + 3 * torsionTerm * torsionTerm);
  const assemblyPreloadMin = assemblyPreloadMax / alphaA;

  // Tightening torque MA = FM·(0.16·P + 0.58·d2·μG + μK·DKm/2)
  const dKm = (dw + dh) / 2;
  const tighteningTorque =
    assemblyPreloadMax * (0.16 * P + 0.58 * d2 * muG + (muK * dKm) / 2);

  // Service state
  const plateRelief = (1 - phi) * FA;
  const residualClampForce = assemblyPreloadMin - plateRelief - embeddingLoss;
  const requiredClampForce = FQ > 0 ? FQ / muT : 0;
  const slipSafetyFactor =
    requiredClampForce > 0 ? residualClampForce / requiredClampForce : Infinity;

  const maxBoltForce = assemblyPreloadMax + phi * FA;
  // Working stress with 50 % torsion retention (kτ = 0.5, VDI 2230 §5.5.2)
  const sigmaZ = maxBoltForce / As;
  const WP = (Math.PI / 12) * Math.pow(d0, 3);
  const MG = assemblyPreloadMax * (0.16 * P + 0.58 * d2 * muG);
  const tau = MG / WP;
  const sigmaRedB = Math.sqrt(sigmaZ * sigmaZ + 3 * Math.pow(0.5 * tau, 2));
  const workingStressUtilization = sigmaRedB / rp02;

  // Thread fatigue, rolled before heat treatment (VDI 2230 eq. 5.5/46):
  // σASV = 0.85·(150/d + 45) MPa with d in mm
  const enduranceLimit = 0.85 * (150 / (d * 1000) + 45) * 1e6;
  const stressAmplitude = (phi * FAa) / As;
  const fatigueSafetyFactor = enduranceLimit / Math.max(stressAmplitude, 1e-3);

  // Head bearing surface pressure at assembly
  const bearingArea = (Math.PI / 4) * (dw * dw - dh * dh);
  const surfacePressure = assemblyPreloadMax / bearingArea;
  const allowablePressure = config.allowablePressure ?? 700e6;

  return {
    size,
    rp02,
    d2,
    d3,
    stressArea: As,
    boltResilience,
    plateResilience,
    loadFactor: phi,
    embedding,
    embeddingLoss,
    assemblyPreloadMax,
    assemblyPreloadMin,
    tighteningFactor: alphaA,
    tighteningTorque,
    residualClampForce,
    requiredClampForce,
    slipSafetyFactor,
    maxBoltForce,
    workingStressUtilization,
    stressAmplitude,
    enduranceLimit,
    fatigueSafetyFactor,
    surfacePressure,
    allowablePressure,
    surfacePressureUtilization: surfacePressure / allowablePressure,
  };
}
