/**
 * Shaft FEA Solver
 */

import { generateShaftMesh, diameterAtNode } from "./mesh";
import { assembleGlobalStiffness } from "./stiffness";
import {
  createLoadVector,
  applySupportConstraints,
  defaultSupports,
  extractBearingReactions,
} from "./loadVector";
import { solveLinearSystem } from "./linearSolver";
import { buildLumpedMassMatrix, computeLateralCriticalSpeeds } from "./massMatrix";
import {
  recoverStresses,
  bearingSlopes,
  determineGoverningMode,
  determineSafetyStatus,
} from "./femPost";
import { buildKtProfile } from "./stressConcentration";
import { evaluateShaftFatigue, rotatingShaftStressState } from "./fatigueCheck";
import type { ShaftConfig, ShaftResult } from "./types";

export function solveShaftFEM(config: ShaftConfig): ShaftResult {
  const { geometry, material, loads } = config;
  const divisions = Math.max(10, Math.round(config.meshSegments ?? 50));
  const supports = config.supports?.length ? config.supports : defaultSupports();
  const limits = {
    deflectionLimitRatio: config.limits?.deflectionLimitRatio ?? 1000,
    slopeLimitRad: config.limits?.slopeLimitRad ?? 0.001,
    criticalSpeedMarginMin: config.limits?.criticalSpeedMarginMin ?? 1.25,
    targetStaticSafetyFactor: config.limits?.targetStaticSafetyFactor ?? 1.5,
    targetFatigueSafetyFactor: config.limits?.targetFatigueSafetyFactor ?? 1.5,
  };

  const model = generateShaftMesh(
    geometry.length,
    geometry.diameter,
    material.E,
    material.G,
    divisions,
    geometry.segments,
    material.density
  );

  const stiffness = assembleGlobalStiffness(model.nodes, model.elements);
  const { F } = createLoadVector(
    model,
    loads,
    config.includeSelfWeight ?? false,
    material.density
  );
  const constraints = applySupportConstraints(model, supports);
  const displacements = solveLinearSystem(stiffness, F, constraints);

  const post = recoverStresses(model, displacements);
  const globalKt = Math.max(config.stressConcentrationFactor ?? 1, 1);
  const ktProfile = buildKtProfile(
    post.x,
    post.bendingStress,
    post.shearStress,
    config.stressFeatures ?? [],
    globalKt
  );

  const adjustedVonMises = post.vonMisesStress.map((s, i) => s * (ktProfile[i] ?? 1));

  const maxStress = Math.max(...adjustedVonMises, 0);
  const maxShear = Math.max(...post.shearStress, 0);
  const maxBending = Math.max(...post.bendingStress, 0);
  const maxDeflection = Math.max(...post.deflection, 0);
  const maxSlope = Math.max(...post.slope, 0);
  const maxTorque = Math.max(...post.torqueDistribution, 0);
  const maxBendingMoment = Math.max(...post.bendingMomentDistribution, 0);
  const maxShearForce = Math.max(...post.shearForce, 0);

  const safetyFactor = material.yieldStress / Math.max(maxStress, 1e-12);
  const criticalIndex = adjustedVonMises.indexOf(maxStress);
  const criticalSection = model.nodes[criticalIndex]?.x ?? 0;

  const M = buildLumpedMassMatrix(model);
  const { speedsRpm } = computeLateralCriticalSpeeds(stiffness, M, constraints, 2);
  const criticalSpeed = speedsRpm[0] ?? 0;

  const operatingRpm = config.operatingRpm ?? 0;
  const criticalSpeedMargin =
    operatingRpm > 0 && criticalSpeed > 0 ? criticalSpeed / operatingRpm : null;

  const span = model.length;
  const deflectionLimit = span / limits.deflectionLimitRatio;
  const deflectionUtilization = maxDeflection / Math.max(deflectionLimit, 1e-12);

  const slopesAtBearings = bearingSlopes(model, displacements, supports);
  const maxBearingSlope = Math.max(...slopesAtBearings.map((s) => s.slopeRad), 0);
  const slopeUtilization = maxBearingSlope / limits.slopeLimitRad;

  let fatigueSafetyFactor: number | null = null;
  let fatigueStatus: ShaftResult["fatigueStatus"] = "n/a";

  const fatigueEnabled =
    config.fatigue?.enabled === true ||
    (config.fatigue?.enabled !== false && operatingRpm > 0);

  if (fatigueEnabled && material.ultimateStrength > 0) {
    const critBending = post.bendingStress[criticalIndex] ?? 0;
    const critShear = post.shearStress[criticalIndex] ?? 0;
    const critKt = ktProfile[criticalIndex] ?? 1;
    const dCrit = diameterAtNode(model, criticalIndex);
    const kSigma = config.din743?.K_sigma ?? 1;
    const kTau = config.din743?.K_tau ?? 1;
    const gammaF = config.din743?.gamma_F ?? 1;

    const stressState = rotatingShaftStressState(
      critBending * critKt * kSigma,
      critShear * critKt * kTau,
      0,
      config.fatigue?.alternatingTorqueFraction ?? 0
    );
    stressState.diameter = dCrit;

    const fatigue = evaluateShaftFatigue(
      material,
      stressState,
      { enabled: true, surfaceFinish: config.fatigue?.surfaceFinish ?? "machined" },
      limits.targetFatigueSafetyFactor,
      gammaF
    );
    fatigueSafetyFactor = fatigue.safetyFactor;
    fatigueStatus = fatigue.status;
  }

  const staticStatus = determineSafetyStatus(safetyFactor, limits.targetStaticSafetyFactor);
  const criticalOk =
    criticalSpeedMargin == null || criticalSpeedMargin >= limits.criticalSpeedMarginMin;
  const fatigueOk =
    fatigueSafetyFactor == null || fatigueSafetyFactor >= limits.targetFatigueSafetyFactor;

  let designStatus = staticStatus;
  if (
    staticStatus === "critical" ||
    !fatigueOk ||
    deflectionUtilization > 1 ||
    slopeUtilization > 1 ||
    !criticalOk
  ) {
    designStatus = "critical";
  } else if (
    staticStatus === "warning" ||
    (fatigueSafetyFactor != null && fatigueStatus === "warning") ||
    deflectionUtilization > 0.8 ||
    slopeUtilization > 0.8
  ) {
    designStatus = "warning";
  }

  const governingFailureMode = determineGoverningMode({
    staticSf: safetyFactor,
    targetStatic: limits.targetStaticSafetyFactor,
    fatigueSf: fatigueSafetyFactor,
    targetFatigue: limits.targetFatigueSafetyFactor,
    deflectionUtil: deflectionUtilization,
    slopeUtil: slopeUtilization,
    criticalMargin: criticalSpeedMargin,
    targetCritical: limits.criticalSpeedMarginMin,
  });

  const bearingReactions = extractBearingReactions(stiffness, F, displacements, model, supports);

  const refD = geometry.diameter;
  const radius = refD / 2;
  const innerD = geometry.segments?.[0]?.innerDiameter ?? 0;
  const secondMoment = (Math.PI * (Math.pow(refD, 4) - Math.pow(innerD, 4))) / 64;
  const polarMoment = (Math.PI * (Math.pow(refD, 4) - Math.pow(innerD, 4))) / 32;

  return {
    ...post,
    stressConcentrationFactor: ktProfile,
    vonMisesStress: adjustedVonMises,
    maxStress,
    maxShearStress: maxShear,
    maxBendingStress: maxBending,
    maxDeflection,
    maxSlope,
    maxTorque,
    maxBendingMoment,
    maxShearForce,
    safetyFactor,
    designStatus,
    isSafe: designStatus === "safe",
    governingFailureMode,
    criticalSection,
    criticalSpeed,
    criticalSpeedModes: speedsRpm,
    criticalSpeedMargin,
    fatigueSafetyFactor,
    fatigueStatus,
    deflectionUtilization,
    slopeUtilization,
    bearingReactions,
    bearingSlopes: slopesAtBearings,
    analysisType: "FEA",
    diameter: refD,
    radius,
    polarMoment,
    secondMoment,
  };
}
