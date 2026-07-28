/**
 * Build DIN 743 stations from shaft FEM fields + stress features.
 */

import { diameterAtNode } from "../mesh";
import type { ShaftFEMModel } from "../femTypes";
import type { ShaftConfig, StressFeature } from "../types";
import type { Din743NotchKind } from "@/data/catalogs/din743/types";
import type { Din743StationInput, Din743WorksheetOptions, Din743WorksheetResult } from "./types";
import { runDin743Worksheet } from "./worksheet";

function featureToNotchKind(f: StressFeature): Din743NotchKind {
  if (f.type === "shoulder_fillet") return "shoulder_fillet";
  if (f.type === "retaining_ring") return "retaining_ring_groove";
  if (f.type === "keyway") {
    return f.keywayStyle === "end_milled" ? "keyway_end_milled" : "keyway_sled";
  }
  if (f.type === "custom") return "custom";
  return "plain";
}

function nearestIndex(x: number[], position: number): number {
  let nearest = 0;
  let minDist = Infinity;
  for (let i = 0; i < x.length; i++) {
    const d = Math.abs(x[i]! - position);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return nearest;
}

type FemSnapshot = {
  x: number[];
  bendingStress: number[];
  shearStress: number[];
  model: ShaftFEMModel;
  criticalIndex: number;
};

export function buildDin743StationsFromFem(
  config: ShaftConfig,
  fem: FemSnapshot,
  alternatingTorqueFraction: number
): Din743StationInput[] {
  const stations: Din743StationInput[] = [];
  const features = config.stressFeatures ?? [];
  const axialForce = config.loads.reduce((s, l) => s + (l.axialForce ?? 0), 0);

  const pushStation = (
    id: string,
    label: string,
    index: number,
    feature?: StressFeature
  ) => {
    const d = diameterAtNode(fem.model, index);
    const sigmaB = Math.abs(fem.bendingStress[index] ?? 0);
    const tau = Math.abs(fem.shearStress[index] ?? 0);
    const axial = d > 0 ? (4 * Math.abs(axialForce)) / (Math.PI * d * d) : 0;
    const kind = feature ? featureToNotchKind(feature) : "plain";

    stations.push({
      id,
      label,
      position_m: fem.x[index] ?? 0,
      diameter_m: d,
      notchKind: kind,
      largerDiameter_m: feature?.largerDiameter,
      filletRadius_m: feature?.filletRadius,
      grooveDepth_m: feature?.grooveDepth,
      grooveWidth_m: feature?.grooveWidth,
      customAlphaBending: feature?.type === "custom" ? feature.customKt : undefined,
      customAlphaTorsion: feature?.type === "custom" ? feature.customKt : undefined,
      sigmaBendingA_Pa: sigmaB,
      sigmaBendingM_Pa: 0,
      sigmaAxialA_Pa: 0,
      sigmaAxialM_Pa: axial,
      tauA_Pa: tau * alternatingTorqueFraction,
      tauM_Pa: tau * (1 - alternatingTorqueFraction),
      sigmaBendingMax_Pa: sigmaB + axial,
      tauMax_Pa: tau,
      sigmaAxialMax_Pa: axial,
    });
  };

  // Always include critical FEM section
  pushStation("critical", "Critical von Mises section", fem.criticalIndex);

  // Feature stations
  features.forEach((f, i) => {
    const idx = nearestIndex(fem.x, f.position);
    pushStation(`feature-${i}`, `${f.type} @ ${f.position.toFixed(3)} m`, idx, f);
  });

  // Support seats (plain) — slope-sensitive locations
  const supports = config.supports ?? [];
  supports.forEach((s, i) => {
    const idx = nearestIndex(fem.x, s.position);
    // Avoid duplicate of critical if nearly same node
    if (Math.abs(idx - fem.criticalIndex) <= 1 && features.length === 0) return;
    pushStation(`support-${i}`, `Bearing seat @ ${s.position.toFixed(3)} m`, idx);
  });

  // Deduplicate by nearest node+kind
  const seen = new Set<string>();
  return stations.filter((st) => {
    const key = `${st.position_m.toFixed(4)}:${st.notchKind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function runDin743FromFem(params: {
  config: ShaftConfig;
  x: number[];
  bendingStress: number[];
  shearStress: number[];
  model: FemSnapshot["model"];
  criticalIndex: number;
}): Din743WorksheetResult | null {
  const opts = params.config.din743Worksheet;
  if (opts?.enabled === false) return null;

  const alt = params.config.fatigue?.alternatingTorqueFraction ?? 0;
  const stations = buildDin743StationsFromFem(params.config, params, alt);

  // Seed overrides from legacy manual coefficients when user raised them above 1
  const legacy = params.config.din743;
  const options: Din743WorksheetOptions = {
    ...opts,
    enabled: true,
    K_sigmaOverride:
      opts?.K_sigmaOverride ??
      (legacy?.K_sigma != null && legacy.K_sigma > 1 ? legacy.K_sigma : undefined),
    K_tauOverride:
      opts?.K_tauOverride ??
      (legacy?.K_tau != null && legacy.K_tau > 1 ? legacy.K_tau : undefined),
    gammaFOverride:
      opts?.gammaFOverride ??
      (legacy?.gamma_F != null && legacy.gamma_F > 1 ? legacy.gamma_F : undefined),
    Rz_um: opts?.Rz_um,
    materialId: opts?.materialId,
  };

  return runDin743Worksheet({
    stations,
    ultimateStrength_Pa: params.config.material.ultimateStrength,
    options,
    surfaceFinish: params.config.fatigue?.surfaceFinish,
  });
}
