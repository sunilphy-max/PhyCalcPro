import { solvePlateEngine } from "@/lib/structural/plates/engine";
import { solveCircularPlateEngine } from "@/lib/structural/circular-plates/engine";
import { solveShellEngine } from "@/lib/structural/shells/engine";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import { solveTrussEngine } from "@/lib/structural/trusses/engine";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import { searchBeamSections } from "@/lib/design-workflows/solvers/beamDesign";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import { STEEL_E, STEEL_YIELD } from "@/lib/materials/materialDefaults";

function resultFromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return {
    method,
    best: sweep.best,
    ranked: sweep.ranked,
  };
}

export function designPlateThickness(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const length = userInputs.length ?? 1;
  const width = userInputs.width ?? 0.8;
  const E = userInputs.E ?? STEEL_E;
  const q = userInputs.pressure ?? userInputs.maxForce ?? 5000;
  const deflectionLimit = userInputs.deflectionLimit ?? length / 250;
  const allowable = userInputs.allowableStressPa ?? 170e6;
  const thicknessesMm = [4, 5, 6, 8, 10, 12, 15, 20, 25];

  const items = thicknessesMm.map((tMm) => {
    const thickness = tMm / 1000;
    try {
      const res = solvePlateEngine({
        length,
        width,
        thickness,
        E,
        nu: 0.3,
        q,
        elementsX: 12,
        elementsY: 10,
        boundaryType: "simply_supported",
      });
      const maxMoment = res.maxMoment;
      const stress = (6 * maxMoment) / (width * thickness * thickness);
      const util = Math.max(
        deflectionLimit > 0 ? res.maxDeflection / deflectionLimit : 0,
        allowable > 0 ? stress / allowable : 0
      );
      return {
        label: `${tMm} mm plate`,
        utilization: util,
        fields: { thickness: tMm, thicknessUnit: "mm" },
        detail: `defl ${(res.maxDeflection * 1000).toFixed(2)} mm`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: tMm }, detail: "invalid" };
    }
  });

  return resultFromSweep(sweepCatalogForUtilization(items), "Minimum plate thickness for deflection and bending stress.");
}

/**
 * Circular plate thickness sweep (deflection + bending stress).
 * Apply field `thickness` is in **mm** (circular-plates form default).
 */
export function designCircularPlateThickness(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const radius = userInputs.length ?? 0.25;
  const modulus = userInputs.E ?? STEEL_E;
  // E may arrive already in Pa or as GPa*1e9 from pages; clamp to steel-like Pa range
  const E = modulus > 1e8 ? modulus : modulus * 1e9;
  const pressure = userInputs.pressure ?? userInputs.maxForce ?? 8000;
  const deflectionLimit = userInputs.deflectionLimit ?? radius / 100;
  const allowable = userInputs.allowableStressPa ?? 170e6;
  const thicknessesMm = [3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 25, 30];

  const items = thicknessesMm.map((tMm) => {
    const thickness = tMm / 1000;
    try {
      const res = solveCircularPlateEngine({
        radius,
        thickness,
        modulus: E,
        poisson: 0.3,
        pressure,
        boundary: "simply_supported",
        meshSegments: 24,
      });
      const deflUtil = deflectionLimit > 0 ? res.maxDeflection / deflectionLimit : 0;
      const stressUtil = allowable > 0 ? res.maxStress / allowable : 0;
      return {
        label: `${tMm} mm`,
        utilization: Math.max(deflUtil, stressUtil),
        fields: { thickness: tMm },
        detail: `w ${(res.maxDeflection * 1000).toFixed(2)} mm · σ ${(res.maxStress / 1e6).toFixed(0)} MPa`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: tMm }, detail: "invalid" };
    }
  });

  return resultFromSweep(
    sweepCatalogForUtilization(items),
    "Circular plate thickness sweep for deflection and bending stress."
  );
}

export function designFrameSection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const span = userInputs.length ?? 6;
  const height = userInputs.height ?? 3;
  const load = userInputs.maxForce ?? 20000;
  const E = userInputs.E ?? STEEL_E;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const search = searchBeamSections(
    {
      length: span,
      E,
      I: 1e-5,
      c: 0.05,
      support: "simply_supported",
      meshSegments: 16,
      loads: [{ id: "f", type: "point", value: load, position: span / 2 }],
    },
    (userInputs.allowableStressPa ?? 170e6) / targetSf,
    userInputs.deflectionLimit ?? span / 300,
    8
  );

  return {
    method: "Rolled-section ranking for frame member utilization target.",
    best: search.best
      ? {
          label: search.best.designation,
          utilization: search.best.utilization,
          fields: { I: search.best.I, c: search.best.c, sectionDesignation: search.best.designation },
          detail: `${(search.best.utilization * 100).toFixed(0)}% util`,
        }
      : null,
    ranked: search.ranked.map((s) => ({
      label: s.designation,
      utilization: s.utilization,
      fields: { I: s.I, c: s.c, sectionDesignation: s.designation },
      detail: `${(s.utilization * 100).toFixed(0)}% util`,
    })),
  };
}

export function designTrussSection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const span = userInputs.length ?? 8;
  const load = userInputs.maxForce ?? 15000;
  const E = userInputs.E ?? STEEL_E;
  const areas = [0.0005, 0.001, 0.0015, 0.002, 0.003, 0.004, 0.005];

  const items = areas.map((area) => {
    try {
      const res = solveTrussEngine({
        span,
        height: userInputs.height ?? 2,
        panels: 4,
        E,
        A: area,
        load,
      });
      const allowable = userInputs.allowableStressPa ?? 170e6;
      const maxStress = res.maxForce / Math.max(area, 1e-12);
      const util = allowable > 0 ? maxStress / allowable : 0;
      return {
        label: `A ${(area * 1e4).toFixed(1)} cm²`,
        utilization: util,
        fields: { area, areaUnit: "m2" },
        detail: `max force ${(res.maxForce / 1000).toFixed(1)} kN`,
      };
    } catch {
      return { label: `A ${area}`, utilization: 99, fields: { area }, detail: "invalid" };
    }
  });

  return resultFromSweep(sweepCatalogForUtilization(items), "Truss member area sweep for axial stress.");
}

/**
 * Solid round bar diameter sweep (MITCalc-style).
 * Engine models a square of side d as a conservative screening proxy for Ød.
 * Apply fields `width` / `height` / `diameter` are in **meters** (combined-loading page).
 */
export function designCombinedLoadingSection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const yieldStrength = userInputs.allowableStressPa ?? STEEL_YIELD;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const diametersMm = [30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200];

  const items = diametersMm.map((dMm) => {
    const d = dMm / 1000;
    try {
      const res = solveCombinedLoadingEngine({
        width: d,
        height: d,
        axialForce: userInputs.axialLoad ?? 25000,
        bendingMoment: userInputs.bendingMoment ?? 800,
        torque: userInputs.torque ?? 400,
        shearForce: userInputs.shearForce ?? 5000,
        yieldStrength,
      });
      const util = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: util,
        fields: { diameter: d, width: d, height: d, widthUnit: "m", heightUnit: "m" },
        detail: `SF ${res.safetyFactor.toFixed(2)} · σ_vm ${(res.vonMisesStress / 1e6).toFixed(0)} MPa`,
      };
    } catch {
      return {
        label: `Ø${dMm}`,
        utilization: 99,
        fields: { diameter: d, width: d, height: d },
        detail: "invalid",
      };
    }
  });

  return resultFromSweep(
    sweepCatalogForUtilization(items),
    "Solid round diameter sweep for combined von Mises safety factor."
  );
}

function designShellThickness(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const radius = userInputs.length ?? 0.5;
  const pressure = userInputs.pressure ?? 500e3;
  const allowable = userInputs.allowableStressPa ?? 170e6;
  const thicknessesMm = [4, 6, 8, 10, 12, 16, 20, 25, 30];

  const items = thicknessesMm.map((tMm) => {
    const t = tMm / 1000;
    try {
      const res = solveShellEngine({
        radius,
        thickness: t,
        length: userInputs.columnLength ?? 2,
        internalPressure: pressure,
        axialForce: userInputs.axialLoad ?? 0,
        bendingMoment: userInputs.bendingMoment ?? 0,
        modulus: userInputs.E ?? STEEL_E,
        poisson: 0.3,
        endCondition: "closed",
        allowableStress: allowable,
      });
      const util = 1 / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `t = ${tMm} mm`,
        utilization: util,
        fields: { thickness: tMm, thicknessUnit: "mm" },
        detail: `SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: tMm }, detail: "invalid" };
    }
  });

  return resultFromSweep(sweepCatalogForUtilization(items), "Shell wall thickness sweep for von Mises safety factor.");
}

export function designStructuralModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "plates") return designPlateThickness(userInputs);
  if (moduleId === "circular-plates") return designCircularPlateThickness(userInputs);
  if (moduleId === "shells") return designShellThickness(userInputs);
  if (moduleId === "frames") return designFrameSection(userInputs);
  if (moduleId === "trusses") return designTrussSection(userInputs);
  if (moduleId === "combined-loading") return designCombinedLoadingSection(userInputs);
  return designFrameSection(userInputs);
}
