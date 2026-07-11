import type { BearingConfig, BearingResult, BearingReliability } from "./types";
import { calculateStaticEquivalentLoad, staticSafetyFactor } from "./staticLoad";
import { calculateBearingEquivalentLoad, lifeExponentFor } from "./equivalentLoad";
import {
  estimateFatigueLoadLimitN,
  legacyLubricationToInputs,
  resolveModifiedLifeFactors,
  temperatureDeratingFactor,
  type ContaminationLevel,
} from "./iso281Life";
import { greaseEffectiveViscosity, kinematicViscosityAtTemp } from "./lubrication";
import {
  calculateStationLives,
  isPairedArrangement,
  splitPairedLoads,
  systemLifeFromStations,
  tandemAxialRatingMultiplier,
} from "./pairedLoads";
import { calculateThermalExpansion } from "./thermalExpansion";
import { calculateThermalEquilibrium } from "./thermalEquilibrium";
import { calculateRelubricationInterval } from "./relubrication";
import {
  calculateDuplexStiffness,
  effectiveAxialWithPreload,
  type DuplexPreloadClass,
} from "./duplexStiffness";
import { sizeLocatingFloatingStations } from "./systemSizing";
import {
  combinedLifeFromSpectrum,
  equivalentLoadFromSpectrum,
  normalizeSpectrumSteps,
  type LoadSpectrumStep,
} from "./variableLoad";
import { minimumRadialLoadN } from "./auxiliaryChecks";

const A1_FACTORS: Record<BearingReliability, number> = {
  90: 1.0,
  95: 0.64,
  96: 0.55,
  97: 0.47,
  98: 0.37,
  99: 0.25,
};

export { calculateBearingEquivalentLoad, lifeExponentFor } from "./equivalentLoad";

function determineGoverningMode(params: {
  lifeUtil: number;
  dynamicUtil: number;
  staticSf: number;
  targetStaticSf: number;
  speedMargin: number | null;
  targetSpeedMargin: number;
  minLoadOk: boolean;
}): string {
  const issues: { label: string; severity: number }[] = [];

  if (!params.minLoadOk) {
    issues.push({ label: "Minimum load (skidding risk)", severity: 2 });
  }
  if (params.lifeUtil > 1) {
    issues.push({ label: "SKF rating life Lnm", severity: params.lifeUtil });
  }
  if (params.dynamicUtil > 1) {
    issues.push({ label: "Dynamic load P/C", severity: params.dynamicUtil });
  }
  if (params.staticSf < params.targetStaticSf) {
    issues.push({ label: "Static load C₀/P₀", severity: params.targetStaticSf / params.staticSf });
  }
  if (params.speedMargin != null && params.speedMargin < params.targetSpeedMargin) {
    issues.push({ label: "Speed limit", severity: params.targetSpeedMargin / params.speedMargin });
  }

  if (issues.length === 0) return "All checks pass";
  issues.sort((a, b) => b.severity - a.severity);
  return issues[0]!.label;
}

function resolveKinematicViscosity(config: BearingConfig, meanDiameterMm: number): number | null {
  if (config.kinematicViscosityCst != null) return config.kinematicViscosityCst;
  if (config.lubricantType === "grease" && config.isoVgGrade != null) {
    return greaseEffectiveViscosity(
      config.isoVgGrade,
      config.operatingTempC ?? 70,
      config.speed,
      meanDiameterMm
    );
  }
  if (config.lubricantType === "oil" && config.isoVgGrade != null) {
    return kinematicViscosityAtTemp(config.isoVgGrade, config.operatingTempC ?? 70);
  }
  return null;
}

function resolveAiso(config: BearingConfig, equivalentLoad: number, dynamicRatingN: number): {
  aIso: number;
  modifiedLifeFactors: BearingResult["modifiedLifeFactors"];
} {
  const bore = config.boreMm ?? 25;
  const od = config.outerDiameterMm ?? bore * 2;
  const meanDiameterMm = (bore + od) / 2;
  const fatigueLoadLimitN =
    config.fatigueLoadLimitN ?? estimateFatigueLoadLimitN(dynamicRatingN, config.bearingType);

  const nu = resolveKinematicViscosity(config, meanDiameterMm);

  if (nu != null && config.contamination) {
    const factors = resolveModifiedLifeFactors({
      kinematicViscosityCst: nu,
      meanDiameterMm,
      speedRpm: config.speed,
      contamination: config.contamination,
      fatigueLoadLimitN,
      equivalentLoadN: equivalentLoad,
      bearingType: config.bearingType,
    });
    return {
      aIso: factors.aIso,
      modifiedLifeFactors: factors,
    };
  }

  if (config.lubricationClass) {
    const legacy = legacyLubricationToInputs(
      config.lubricationClass,
      meanDiameterMm,
      config.speed,
      dynamicRatingN,
      equivalentLoad,
      config.bearingType
    );
    const factors = resolveModifiedLifeFactors(legacy);
    return { aIso: factors.aIso, modifiedLifeFactors: factors };
  }

  return {
    aIso: 1,
    modifiedLifeFactors: {
      kappa: 0,
      nuCst: 0,
      nu1Cst: 0,
      eC: 1,
      puOverP: fatigueLoadLimitN / Math.max(equivalentLoad, 1e-9),
      aIso: 1,
      fatigueLoadLimitN,
    },
  };
}

export function solveBearingDesign(config: BearingConfig): BearingResult {
  const arrangement = config.arrangement ?? "single";
  const paired = isPairedArrangement(arrangement);
  const locatingFloating = config.mountingSystem === "locating_floating" && !paired;

  const tempFactor = temperatureDeratingFactor(config.operatingTempC ?? 70);
  const dynamicLoadRatingN =
    (config.dynamicLoadRatingN ?? config.material.dynamicRatingFactor) * tempFactor;
  const staticLoadRatingN =
    (config.staticLoadRatingN ?? config.material.staticRatingFactor) * tempFactor;

  const p = lifeExponentFor(config.bearingType);
  const reliability = config.reliabilityPercent ?? 90;
  const a1 = A1_FACTORS[reliability] ?? 1.0;
  const speed = Math.max(config.speed, 1e-9);
  const targetStaticSf = config.targetStaticSafetyFactor ?? 1.0;
  const targetSpeedMargin = config.targetSpeedMargin ?? 1.0;

  const calcP = (Fr: number, Fa: number) =>
    equivalentLoadFromRadialAxial(Fr, Fa, config.bearingType, config.catalogFactors);

  let equivalentLoad: number;
  let staticEquivalentLoad: number;
  let expectedLife: number;
  let modifiedLife: number;
  let expectedLifeRevolutions: number;
  let aIso: number;
  let modifiedLifeFactors: BearingResult["modifiedLifeFactors"];
  let pairedStations: BearingResult["pairedStations"];
  let duplexStiffnessResult: BearingResult["duplexStiffness"] = undefined;
  let systemMinLifeHours: number | undefined;
  let weibullSystemLifeHours: number | undefined;

  if (config.loadSpectrum?.length) {
    const steps = normalizeSpectrumSteps(config.loadSpectrum);
    equivalentLoad = equivalentLoadFromSpectrum(steps, config.bearingType, calcP);
    staticEquivalentLoad = calculateStaticEquivalentLoad(
      config.radialLoad,
      config.axialLoad,
      config.bearingType
    );
    const baseAiso = resolveAiso(config, equivalentLoad, dynamicLoadRatingN);
    aIso = baseAiso.aIso;
    modifiedLifeFactors = baseAiso.modifiedLifeFactors;

    // Basic L10 (a1 only) vs modified Lnm (a1·aISO) — keep them distinct.
    expectedLife = combinedLifeFromSpectrum(steps, (step) => {
      const P = calcP(step.radialLoad, step.axialLoad);
      const n = step.speedRpm ?? config.speed;
      const revs = a1 * Math.pow(dynamicLoadRatingN / Math.max(P, 1e-9), p) * 1e6;
      return revs / (60 * Math.max(n, 1));
    });
    modifiedLife = combinedLifeFromSpectrum(steps, (step) => {
      const P = calcP(step.radialLoad, step.axialLoad);
      const n = step.speedRpm ?? config.speed;
      const revs = a1 * aIso * Math.pow(dynamicLoadRatingN / Math.max(P, 1e-9), p) * 1e6;
      return revs / (60 * Math.max(n, 1));
    });
    expectedLifeRevolutions = expectedLife * 60 * speed;
  } else if (paired || locatingFloating) {
    const preloadClass = (config.preloadClass ?? "none") as DuplexPreloadClass;
    const duplex =
      paired
        ? calculateDuplexStiffness({
            arrangement,
            dynamicRatingN: dynamicLoadRatingN,
            meanDiameterMm:
              config.boreMm != null && config.outerDiameterMm != null
                ? (config.boreMm + config.outerDiameterMm) / 2
                : 40,
            contactAngleDeg: config.contactAngleDeg,
            preloadClass,
            preloadForceN: config.preloadForceN,
            bearingType: config.bearingType,
          })
        : null;

    const effectiveFa = paired
      ? effectiveAxialWithPreload(config.axialLoad, duplex?.preloadForceN ?? 0, arrangement)
      : Math.abs(config.axialLoad);

    if (locatingFloating) {
      const locatingType = config.locatingBearingType ?? config.bearingType;
      const floatingType = config.floatingBearingType ?? "cylindrical_roller";
      const sized = sizeLocatingFloatingStations({
        config: { ...config, axialLoad: effectiveFa },
        locatingType,
        floatingType,
        locatingDesignation: config.designation,
        floatingDesignation: config.floatingDesignation,
        a1,
        aIso: 1, // resolved below after probe
        tempFactor,
        criteriaBase: {
          manufacturer: config.manufacturer,
          applicationProfile: config.applicationProfile,
          speedRpm: config.speed,
          boreMaxMm: config.boreMm,
        },
      });

      // Resolve aISO from locating station load (governing combined load)
      const probeP = sized[0]!.equivalentLoad;
      const aisoResolved = resolveAiso(config, probeP, dynamicLoadRatingN);
      aIso = aisoResolved.aIso;
      modifiedLifeFactors = aisoResolved.modifiedLifeFactors;

      // Recompute lives with real aISO
      const sizedWithAiso = sizeLocatingFloatingStations({
        config: { ...config, axialLoad: effectiveFa },
        locatingType,
        floatingType,
        locatingDesignation: config.designation,
        floatingDesignation: config.floatingDesignation,
        a1,
        aIso,
        tempFactor,
        criteriaBase: {
          manufacturer: config.manufacturer,
          applicationProfile: config.applicationProfile,
          speedRpm: config.speed,
          boreMaxMm: config.boreMm,
        },
      });

      pairedStations = sizedWithAiso.map((s, i) => ({
        index: i,
        role: s.role,
        label: s.label,
        designation: s.designation,
        bearingType: s.bearingType,
        radialLoad: s.radialLoad,
        axialLoad: s.axialLoad,
        equivalentLoad: s.equivalentLoad,
        staticEquivalentLoad: s.staticEquivalentLoad,
        basicLifeHours: s.basicLifeHours,
        modifiedLifeHours: s.modifiedLifeHours,
        dynamicRatingN: s.dynamicRatingN,
        dynamicUtilization: s.dynamicUtilization,
      }));

      expectedLife = Math.min(...sizedWithAiso.map((s) => s.basicLifeHours));
      const modLives = sizedWithAiso.map((s) => s.modifiedLifeHours);
      systemMinLifeHours = Math.min(...modLives);
      const { weibullSystemLifeHours: weibull } = systemLifeFromStations(
        sizedWithAiso.map((s, i) => ({
          station: {
            index: i,
            radialLoad: s.radialLoad,
            axialLoad: s.axialLoad,
            dynamicRatingMultiplier: 1,
          },
          equivalentLoad: s.equivalentLoad,
          staticEquivalentLoad: s.staticEquivalentLoad,
          basicLifeHours: s.basicLifeHours,
          modifiedLifeHours: s.modifiedLifeHours,
        }))
      );
      weibullSystemLifeHours = weibull;
      modifiedLife = weibull;
      expectedLifeRevolutions = expectedLife * 60 * speed;
      const gov = sizedWithAiso.reduce((a, b) =>
        a.modifiedLifeHours <= b.modifiedLifeHours ? a : b
      );
      equivalentLoad = gov.equivalentLoad;
      staticEquivalentLoad = Math.max(...sizedWithAiso.map((s) => s.staticEquivalentLoad));
    } else {
      const stations = splitPairedLoads(config.radialLoad, effectiveFa, arrangement);
      const FaFr =
        Math.abs(config.radialLoad) > 0 ? effectiveFa / Math.abs(config.radialLoad) : 0;
      const tandemMul = tandemAxialRatingMultiplier(config.bearingType, FaFr);
      const adjustedStations =
        arrangement === "tandem"
          ? stations.map((s) => ({ ...s, dynamicRatingMultiplier: tandemMul }))
          : stations;
      const probeP = calculateBearingEquivalentLoad({
        ...config,
        axialLoad: effectiveFa,
        arrangement: "single",
      });
      const aisoResolved = resolveAiso(config, probeP, dynamicLoadRatingN);
      aIso = aisoResolved.aIso;
      modifiedLifeFactors = aisoResolved.modifiedLifeFactors;

      const stationLives = calculateStationLives({
        config: { ...config, axialLoad: effectiveFa },
        stations: adjustedStations,
        dynamicRatingN: dynamicLoadRatingN,
        a1,
        aIso,
      });
      pairedStations = stationLives.map((s, i) => ({
        index: s.station.index,
        role: i === 0 ? "duplex_a" : "duplex_b",
        label: i === 0 ? "Bearing A" : "Bearing B",
        designation: config.designation,
        bearingType: config.bearingType,
        radialLoad: s.station.radialLoad,
        axialLoad: s.station.axialLoad,
        equivalentLoad: s.equivalentLoad,
        staticEquivalentLoad: s.staticEquivalentLoad,
        basicLifeHours: s.basicLifeHours,
        modifiedLifeHours: s.modifiedLifeHours,
        dynamicRatingN: dynamicLoadRatingN * s.station.dynamicRatingMultiplier,
        dynamicUtilization: s.equivalentLoad / Math.max(dynamicLoadRatingN, 1),
      }));

      const system = systemLifeFromStations(stationLives);
      expectedLife = system.basicLifeHours;
      systemMinLifeHours = system.modifiedLifeHours;
      weibullSystemLifeHours = system.weibullSystemLifeHours;
      modifiedLife = system.weibullSystemLifeHours;
      expectedLifeRevolutions = expectedLife * 60 * speed;

      const gov = stationLives[system.governingStationIndex]!;
      equivalentLoad = gov.equivalentLoad;
      staticEquivalentLoad = Math.max(...stationLives.map((s) => s.staticEquivalentLoad));
    }

    duplexStiffnessResult = duplex
      ? {
          preloadForceN: duplex.preloadForceN,
          preloadClass: duplex.preloadClass,
          axialStiffnessNPerUm: duplex.axialStiffnessNPerUm,
          radialStiffnessNPerUm: duplex.radialStiffnessNPerUm,
          momentStiffnessNmPerMrad: duplex.momentStiffnessNmPerMrad,
          arrangementLabel: duplex.arrangementLabel,
          comparisonNote: duplex.comparisonNote,
        }
      : undefined;
  } else {
    equivalentLoad = calculateBearingEquivalentLoad({ ...config, arrangement: "single" });
    staticEquivalentLoad = calculateStaticEquivalentLoad(
      config.radialLoad,
      config.axialLoad,
      config.bearingType
    );
    const aisoResolved = resolveAiso(config, equivalentLoad, dynamicLoadRatingN);
    aIso = aisoResolved.aIso;
    modifiedLifeFactors = aisoResolved.modifiedLifeFactors;

    expectedLifeRevolutions =
      equivalentLoad > 0 && dynamicLoadRatingN > 0
        ? a1 * Math.pow(dynamicLoadRatingN / equivalentLoad, p) * 1e6
        : 0;
    expectedLife =
      expectedLifeRevolutions > 0 ? expectedLifeRevolutions / (60 * speed) : 0;

    const modifiedLifeRevolutions =
      equivalentLoad > 0 && dynamicLoadRatingN > 0
        ? a1 * aIso * Math.pow(dynamicLoadRatingN / equivalentLoad, p) * 1e6
        : 0;
    modifiedLife =
      modifiedLifeRevolutions > 0 ? modifiedLifeRevolutions / (60 * speed) : 0;
  }

  const requiredRevolutions = config.lifeHours * speed * 60;
  // Include aISO so required C matches SKF rating life Lnm (poor κ/ηc → larger C).
  const aIsoForSizing = Math.max(aIso, 1e-6);
  const requiredDynamicRating =
    equivalentLoad *
    Math.pow(requiredRevolutions / (a1 * aIsoForSizing * 1e6), 1 / p) *
    config.safetyFactor;
  const requiredStaticRating = staticEquivalentLoad * targetStaticSf * config.safetyFactor;

  const dynamicUtilization = equivalentLoad / Math.max(dynamicLoadRatingN, 1);
  const staticSf = staticSafetyFactor(staticLoadRatingN, staticEquivalentLoad);
  const limitingSpeedRpm = config.limitingSpeedRpm ?? null;
  const speedMargin =
    limitingSpeedRpm != null && limitingSpeedRpm > 0 ? limitingSpeedRpm / speed : null;

  // Gate pass/fail on modified life Lnm (ISO 281 / SKF), not basic L10 alone.
  // (Finalized after thermal equilibrium adjustment below.)
  const meanDiameterMm =
    config.boreMm != null && config.outerDiameterMm != null
      ? (config.boreMm + config.outerDiameterMm) / 2
      : 25;

  const thermalExpansion =
    locatingFloating && config.bearingSpanMm != null && config.bearingSpanMm > 0
      ? calculateThermalExpansion({
          spanMm: config.bearingSpanMm,
          operatingTempC: config.operatingTempC ?? 70,
          availableFloatMm: config.availableFloatMm,
        })
      : locatingFloating
        ? calculateThermalExpansion({
            spanMm: 400,
            operatingTempC: config.operatingTempC ?? 70,
            availableFloatMm: config.availableFloatMm ?? 1,
          })
        : undefined;

  const minLoadN = minimumRadialLoadN({
    dynamicRatingN: dynamicLoadRatingN,
    speedRpm: speed,
    bearingType: config.bearingType,
  });
  const minLoadOk =
    config.bearingType === "thrust_ball" || Math.abs(config.radialLoad) >= minLoadN;

  const thermalEquilibrium = calculateThermalEquilibrium({
    equivalentLoadN: equivalentLoad,
    meanDiameterMm,
    speedRpm: speed,
    bearingType: config.bearingType,
    sealed: config.sealed,
    ambientTempC: config.ambientTempC ?? 20,
    specifiedTempC: config.operatingTempC,
    lubricantType: config.lubricantType,
    isoVgGrade: config.isoVgGrade,
  });

  // Optional: re-rate aISO at equilibrium temperature when requested
  if (
    config.useThermalEquilibrium &&
    config.lubricantType &&
    config.lubricantType !== "none" &&
    Math.abs(thermalEquilibrium.equilibriumTempC - (config.operatingTempC ?? 70)) > 3
  ) {
    const eqConfig = { ...config, operatingTempC: thermalEquilibrium.equilibriumTempC };
    const aisoEq = resolveAiso(eqConfig, equivalentLoad, dynamicLoadRatingN);
    const scale = aisoEq.aIso / Math.max(aIso, 1e-9);
    aIso = aisoEq.aIso;
    modifiedLifeFactors = aisoEq.modifiedLifeFactors;
    modifiedLife *= scale;
    if (weibullSystemLifeHours != null) weibullSystemLifeHours *= scale;
    if (systemMinLifeHours != null) systemMinLifeHours *= scale;
  }

  // Recompute life utilization after any equilibrium aISO adjustment
  const lifeUtilizationFinal = modifiedLife > 0 ? config.lifeHours / modifiedLife : Infinity;
  const lifeSafetyFactorFinal = config.lifeHours > 0 ? modifiedLife / config.lifeHours : 0;

  const relubrication = calculateRelubricationInterval({
    speedRpm: speed,
    meanDiameterMm,
    operatingTempC: config.useThermalEquilibrium
      ? thermalEquilibrium.equilibriumTempC
      : (config.operatingTempC ?? 70),
    dynamicUtilization,
    bearingType: config.bearingType,
    lubricantType: config.lubricantType,
    contamination: config.contamination,
    sealed: config.sealed,
  });

  let designStatus: BearingResult["designStatus"] = "safe";
  if (
    !minLoadOk ||
    lifeUtilizationFinal > 1 ||
    dynamicUtilization > 1 / Math.max(config.safetyFactor, 1) ||
    staticSf < targetStaticSf ||
    (speedMargin != null && speedMargin < targetSpeedMargin) ||
    thermalExpansion?.status === "insufficient" ||
    relubrication.status === "critical"
  ) {
    designStatus = "critical";
  } else if (
    lifeUtilizationFinal > 0.85 ||
    dynamicUtilization > 0.85 ||
    staticSf < targetStaticSf * 1.2 ||
    (speedMargin != null && speedMargin < targetSpeedMargin * 1.2) ||
    thermalExpansion?.status === "marginal" ||
    relubrication.status === "frequent"
  ) {
    designStatus = "warning";
  }

  const governingFailureMode = determineGoverningMode({
    lifeUtil: lifeUtilizationFinal,
    dynamicUtil: dynamicUtilization,
    staticSf,
    targetStaticSf,
    speedMargin,
    targetSpeedMargin,
    minLoadOk,
  });

  return {
    radialLoad: config.radialLoad,
    axialLoad: config.axialLoad,
    equivalentLoad,
    staticEquivalentLoad,
    requiredDynamicRating,
    requiredStaticRating,
    expectedLife,
    modifiedLife,
    expectedLifeRevolutions,
    dynamicLoadRatingN,
    staticLoadRatingN,
    limitingSpeedRpm,
    lifeExponent: p,
    a1,
    aIso,
    modifiedLifeFactors,
    dynamicUtilization,
    staticSafetyFactor: staticSf,
    speedMargin,
    referenceSpeedMargin:
      config.referenceSpeedRpm != null && config.referenceSpeedRpm > 0
        ? config.referenceSpeedRpm / speed
        : null,
    lifeUtilization: lifeUtilizationFinal,
    safetyFactor: config.safetyFactor,
    bearingType: config.bearingType,
    designation: config.designation,
    geometry: null,
    designStatus,
    isSafe: designStatus === "safe",
    governingFailureMode,
    material: config.material,
    pairedStations,
    arrangement,
    thermalExpansion,
    duplexStiffness: duplexStiffnessResult,
    thermalEquilibrium,
    relubrication,
    systemMinLifeHours,
    weibullSystemLifeHours,
    lifeSafetyFactor: lifeSafetyFactorFinal,
    minimumRadialLoadN: minLoadN,
    minLoadSatisfied: minLoadOk,
    frictionTorqueNm: thermalEquilibrium.frictionTorqueNm,
    powerLossW: thermalEquilibrium.powerLossW,
    temperatureDeratingFactor: tempFactor,
    fitRecommendation: config.fitRecommendation,
  };
}

// Re-export for variable load types
export type { LoadSpectrumStep, ContaminationLevel };

function equivalentLoadFromRadialAxial(
  Fr: number,
  Fa: number,
  bearingType: BearingConfig["bearingType"],
  catalogFactors?: BearingConfig["catalogFactors"]
): number {
  return calculateBearingEquivalentLoad({
    radialLoad: Fr,
    axialLoad: Fa,
    speed: 1,
    lifeHours: 1,
    safetyFactor: 1,
    bearingType,
    catalogFactors,
    material: { name: "", dynamicRatingFactor: 1, staticRatingFactor: 1, allowableLife: 1 },
  });
}
