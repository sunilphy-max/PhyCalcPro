import { rankMaterialsByStrength, getMaterialCatalog } from "@/lib/materials/materialCatalogService";
import { searchBeamSections } from "@/lib/design-workflows/solvers/beamDesign";
import { solveAreaPropertiesEngine } from "@/lib/profiles/engine";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import { STEEL_E } from "@/lib/materials/materialDefaults";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designMaterialSelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const required = userInputs.allowableStressPa ?? 200e6;
  const ranked = rankMaterialsByStrength(required, 8);
  const items = ranked.map((m) => ({
    label: m.name,
    utilization: required / m.yieldStress,
    fields: {
      material: m.name,
      E: m.E,
      yieldStress: m.yieldStress,
      ultimateStrength: m.ultimateStrength,
      density: m.density,
      poisson: m.poisson,
    },
    detail: `Sy ${(m.yieldStress / 1e6).toFixed(0)} MPa`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "Material screening by required allowable stress.");
}

export function designSectionForInertia(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const requiredI = userInputs.inertia ?? userInputs.requiredI ?? 1e-5;
  const shapes = [
    { shape: "rectangle", w: 100, h: 150, label: "100×150 mm" },
    { shape: "rectangle", w: 120, h: 180, label: "120×180 mm" },
    { shape: "rectangle", w: 150, h: 200, label: "150×200 mm" },
    { shape: "rectangle", w: 200, h: 250, label: "200×250 mm" },
  ];

  const items = shapes.map((s) => {
    try {
      const res = solveAreaPropertiesEngine({
        shape: {
          shape: "rectangle",
          rectangle: { width: s.w / 1000, height: s.h / 1000 },
        },
      });
      const util = requiredI / Math.max(res.ixx, 1e-12);
      return {
        label: s.label,
        utilization: util,
        fields: { width: s.w, height: s.h },
        detail: `I ${res.ixx.toExponential(2)} m⁴`,
      };
    } catch {
      return { label: s.label, utilization: 99, fields: {}, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Rectangular section sweep for required second moment of area.");
}

export function designRolledSection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const search = searchBeamSections(
    {
      length: userInputs.length ?? 4,
      E: userInputs.E ?? STEEL_E,
      I: 1e-6,
      c: 0.05,
      support: "simply_supported",
      meshSegments: 16,
      loads: [{ id: "m", type: "point", value: userInputs.maxForce ?? 10000, position: 2 }],
    },
    userInputs.allowableStressPa ?? 170e6,
    userInputs.deflectionLimit ?? 0.02,
    8
  );
  return {
    method: "Rolled section lookup ranked by utilization.",
    best: search.best
      ? {
          label: search.best.designation,
          utilization: search.best.utilization,
          fields: { sectionDesignation: search.best.designation, I: search.best.I },
          detail: `${(search.best.utilization * 100).toFixed(0)}% util`,
        }
      : null,
    ranked: search.ranked.map((s) => ({
      label: s.designation,
      utilization: s.utilization,
      fields: { sectionDesignation: s.designation, I: s.I },
      detail: `${(s.utilization * 100).toFixed(0)}% util`,
    })),
  };
}

/**
 * Reverse fatigue sizing: sweep characteristic diameter for bending (Sa ∝ 1/d³)
 * against target life. Apply field `alternatingStress` is in **MPa** (fatigue page).
 */
export function designFatigueLife(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const sa0 = userInputs.stressAmplitude ?? 180e6;
  const sm = userInputs.meanStress ?? 50e6;
  const su = userInputs.ultimateStrength ?? 600e6;
  const se = userInputs.enduranceLimit ?? 200e6;
  const target = userInputs.targetCycles ?? 1e6;
  const targetSf = userInputs.targetSafetyFactor ?? 1.5;
  const d0Mm = 25;
  const diametersMm = [12, 16, 20, 25, 30, 35, 40, 50, 60, 80];

  const items = diametersMm.map((dMm) => {
    // Same bending moment → alternating stress scales with section modulus ~ d³
    const sa = sa0 * Math.pow(d0Mm / dMm, 3);
    try {
      const res = solveFatigueEngine({
        alternatingStress: sa,
        meanStress: sm,
        ultimateStrength: su,
        enduranceLimit: se,
        loadType: "bending",
        surfaceFinish: "machined",
        characteristicDiameter: dMm / 1000,
      });
      const lifeUtil = target / Math.max(res.predictedCycles, 1);
      const sfUtil = targetSf / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `Ø${dMm} mm`,
        utilization: Math.max(lifeUtil, sfUtil),
        fields: {
          alternatingStress: sa / 1e6,
          characteristicDiameterMm: dMm,
          diameterMm: dMm,
        },
        detail: `Sa ${(sa / 1e6).toFixed(0)} MPa · N ${res.predictedCycles.toExponential(2)} · SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return {
        label: `Ø${dMm}`,
        utilization: 99,
        fields: { alternatingStress: sa / 1e6, characteristicDiameterMm: dMm },
        detail: "invalid",
      };
    }
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Characteristic diameter sweep for target fatigue life (Basquin + Marin size factor)."
  );
}

export function designCorrosionAllowance(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const rates = [0.05, 0.1, 0.15, 0.2, 0.3, 0.5];
  const items = rates.map((mmPerYear) => {
    try {
      const res = solveCorrosionEngine({
        initialThickness: (userInputs.thickness ?? 10) / 1000,
        corrosionRate: mmPerYear / 1000,
        designLife: userInputs.designLife ?? 20,
        safetyMargin: userInputs.targetSafetyFactor ?? 1.25,
      });
      const util = (userInputs.designLife ?? 20) / Math.max(
        (res.remainingThickness / Math.max(res.corrosionAllowance, 1e-9)) * (userInputs.designLife ?? 20),
        1
      );
      return {
        label: `${mmPerYear} mm/y`,
        utilization: 1 / Math.max(util, 1e-9),
        fields: { corrosionRate: mmPerYear },
        detail: `t_req ${(res.requiredThickness * 1000).toFixed(1)} mm`,
      };
    } catch {
      return { label: `${mmPerYear}`, utilization: 99, fields: { corrosionRate: mmPerYear }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Corrosion rate sweep for design life.");
}

export function designCompositeScreen(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const plies = [4, 6, 8, 10, 12];
  const items = plies.map((n) => ({
    label: `${n} plies 0/90`,
    utilization: (userInputs.requiredStrength ?? 400e6) / (n * 90e6),
    fields: { plyCount: n, orientation: "0/90" },
    detail: `approx ${(n * 90).toFixed(0)} MPa`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "Laminate ply-count screening for strength target.");
}

export function designTemperatureDerating(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const catalog = getMaterialCatalog();
  const temp = userInputs.temperature ?? 200;
  const items = catalog.slice(0, 6).map((m) => {
    const derating = temp > 400 ? 0.6 : temp > 250 ? 0.75 : temp > 150 ? 0.9 : 1;
    const util = (userInputs.allowableStressPa ?? 200e6) / (m.yieldStress * derating);
    return {
      label: m.name,
      utilization: util,
      fields: { material: m.name, temperature: temp },
      detail: `derating ${(derating * 100).toFixed(0)}%`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Material screening with temperature derating factor.");
}

export function designProfilesSection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  return designSectionForInertia(userInputs);
}

export function designMaterialsModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "material-db") return designMaterialSelection(userInputs);
  if (moduleId === "sections") return designSectionForInertia(userInputs);
  if (moduleId === "rolled-sections") return designRolledSection(userInputs);
  if (moduleId === "fatigue") return designFatigueLife(userInputs);
  if (moduleId === "corrosion") return designCorrosionAllowance(userInputs);
  if (moduleId === "composites") return designCompositeScreen(userInputs);
  if (moduleId === "temperature-properties") return designTemperatureDerating(userInputs);
  return designMaterialSelection(userInputs);
}
