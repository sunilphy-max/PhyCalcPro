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
import { buildKtProfile, buildKfProfile } from "./stressConcentration";
import { evaluateShaftFatigue, rotatingShaftStressState } from "./fatigueCheck";
import { designShaftKey } from "./keysSizing";
import { evaluateRetainingRingFeatures } from "./retainingRings";
import { screenBearingLifeFromReactions } from "./bearingLifeScreen";
import { runDin743FromFem } from "./din743/fromFem";
import { agma6001LoadTemplate } from "./agma6001/interfaceLoads";
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
    targetBearingLifeHours: config.limits?.targetBearingLifeHours ?? 20_000,
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
  const features = config.stressFeatures ?? [];
  const useNotchSensitivity = config.fatigue?.useNotchSensitivity !== false;

  const ktProfile = buildKtProfile(
    post.x,
    post.bendingStress,
    post.shearStress,
    features,
    globalKt,
    geometry.diameter
  );
  const kfProfile = buildKfProfile(
    post.x,
    ktProfile,
    features,
    material,
    useNotchSensitivity,
    globalKt
  );

  const adjustedVonMises = post.vonMisesStress.map((s, i) => s * (ktProfile[i] ?? 1));
  const adjustedPrincipal = post.principalStress.map((s, i) => s * (ktProfile[i] ?? 1));

  const maxStress = Math.max(...adjustedVonMises, 0);
  const maxPrincipalStress = Math.max(...adjustedPrincipal, 0);
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
  const { speedsRpm } = computeLateralCriticalSpeeds(stiffness, M, constraints, 3);
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
  let fatigueDetail: ShaftResult["fatigueDetail"] = null;

  const din743Worksheet = runDin743FromFem({
    config,
    x: post.x,
    bendingStress: post.bendingStress,
    shearStress: post.shearStress,
    model,
    criticalIndex,
  });

  const kSigma =
    config.din743?.K_sigma != null && config.din743.K_sigma > 1
      ? config.din743.K_sigma
      : (din743Worksheet?.autoK_sigma ?? 1);
  const kTau =
    config.din743?.K_tau != null && config.din743.K_tau > 1
      ? config.din743.K_tau
      : (din743Worksheet?.autoK_tau ?? 1);
  const gammaF =
    config.din743?.gamma_F != null && config.din743.gamma_F > 1
      ? config.din743.gamma_F
      : (din743Worksheet?.autoGamma_F ?? 1);

  const fatigueEnabled =
    config.fatigue?.enabled === true ||
    (config.fatigue?.enabled !== false && operatingRpm > 0);

  if (fatigueEnabled && material.ultimateStrength > 0) {
    const critBending = post.bendingStress[criticalIndex] ?? 0;
    const critShear = post.shearStress[criticalIndex] ?? 0;
    const critKf = kfProfile[criticalIndex] ?? 1;
    const dCrit = diameterAtNode(model, criticalIndex);

    // Axial mean from net axial loads (steady)
    const axialForce = loads.reduce((sum, l) => sum + (l.axialForce ?? 0), 0);
    const axialMean =
      dCrit > 0 ? (4 * Math.abs(axialForce)) / (Math.PI * dCrit * dCrit) : 0;

    const stressState = rotatingShaftStressState(
      critBending * critKf * kSigma,
      critShear * critKf * kTau,
      axialMean,
      config.fatigue?.alternatingTorqueFraction ?? 0
    );
    stressState.diameter = dCrit;

    const fatigue = evaluateShaftFatigue(
      material,
      stressState,
      {
        enabled: true,
        surfaceFinish: config.fatigue?.surfaceFinish ?? "machined",
        alternatingTorqueFraction: config.fatigue?.alternatingTorqueFraction,
        useNotchSensitivity,
      },
      limits.targetFatigueSafetyFactor,
      gammaF
    );
    fatigueSafetyFactor = fatigue.safetyFactor;
    fatigueStatus = fatigue.status;
    fatigueDetail = fatigue.detail;
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

  let governingFailureMode = determineGoverningMode({
    staticSf: safetyFactor,
    targetStatic: limits.targetStaticSafetyFactor,
    fatigueSf: fatigueSafetyFactor,
    targetFatigue: limits.targetFatigueSafetyFactor,
    deflectionUtil: deflectionUtilization,
    slopeUtil: slopeUtilization,
    criticalMargin: criticalSpeedMargin,
    targetCritical: limits.criticalSpeedMarginMin,
  });

  if (din743Worksheet) {
    if (din743Worksheet.designStatus === "critical") {
      designStatus = "critical";
      if (
        din743Worksheet.governingFatigueSF < din743Worksheet.SminFatigue ||
        din743Worksheet.governingStaticSF < din743Worksheet.SminStatic
      ) {
        governingFailureMode =
          din743Worksheet.governingFatigueSF <= din743Worksheet.governingStaticSF
            ? "DIN 743 fatigue"
            : "DIN 743 static";
      }
    } else if (din743Worksheet.designStatus === "warning" && designStatus === "safe") {
      designStatus = "warning";
      governingFailureMode = "DIN 743 margin";
    }
  }

  const bearingReactions = extractBearingReactions(stiffness, F, displacements, model, supports);
  const bearingLifeScreens = screenBearingLifeFromReactions({
    reactions: bearingReactions,
    slopes: slopesAtBearings,
    shaftDiameter: geometry.diameter,
    operatingRpm,
    targetLifeHours: limits.targetBearingLifeHours,
  });

  const keysDesign = designShaftKey({
    shaftDiameter: geometry.diameter,
    torque: maxTorque,
    material,
    keyLength: config.keyLength,
  });

  const retainingRingChecks = evaluateRetainingRingFeatures(
    features,
    geometry.diameter,
    material,
    useNotchSensitivity
  );

  const agma6001Template =
    config.agma6001?.enabled === true
      ? agma6001LoadTemplate(
          config.agma6001.interfaceKind ?? "helical_gear",
          config.agma6001.duty ?? "light_shock"
        )
      : null;

  // Fold retaining-ring axial failures into design status
  if (retainingRingChecks.some((c) => c.status === "critical")) {
    designStatus = "critical";
  } else if (retainingRingChecks.some((c) => c.status === "warning") && designStatus === "safe") {
    designStatus = "warning";
  }
  if (keysDesign?.status === "critical") {
    designStatus = "critical";
  } else if (keysDesign?.status === "warning" && designStatus === "safe") {
    designStatus = "warning";
  }
  if (
    operatingRpm > 0 &&
    bearingLifeScreens.some((b) => b.status === "critical") &&
    designStatus !== "critical"
  ) {
    designStatus = designStatus === "safe" ? "warning" : designStatus;
  }

  const refD = geometry.diameter;
  const radius = refD / 2;
  const innerD = geometry.segments?.[0]?.innerDiameter ?? 0;
  const secondMoment = (Math.PI * (Math.pow(refD, 4) - Math.pow(innerD, 4))) / 64;
  const polarMoment = (Math.PI * (Math.pow(refD, 4) - Math.pow(innerD, 4))) / 32;

  return {
    ...post,
    stressConcentrationFactor: ktProfile,
    fatigueConcentrationFactor: kfProfile,
    vonMisesStress: adjustedVonMises,
    principalStress: adjustedPrincipal,
    maxStress,
    maxPrincipalStress,
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
    fatigueDetail,
    deflectionUtilization,
    slopeUtilization,
    bearingReactions,
    bearingSlopes: slopesAtBearings,
    bearingLifeScreens,
    keysDesign,
    retainingRingChecks,
    din743Worksheet,
    agma6001Template,
    analysisType: "FEA",
    diameter: refD,
    radius,
    polarMoment,
    secondMoment,
  };
}
