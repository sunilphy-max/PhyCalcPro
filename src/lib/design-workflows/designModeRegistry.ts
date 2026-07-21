import { allModules } from "@/data/modules";
import { searchBeamSections } from "@/lib/design-workflows/solvers/beamDesign";
import { searchColumnSections } from "@/lib/design-workflows/solvers/columnDesign";
import { designCompressionSpring } from "@/lib/design-workflows/solvers/compressionSpringDesign";
import { designStructuralModule } from "@/lib/design-workflows/solvers/structuralDesign";
import { designMachineModule } from "@/lib/design-workflows/solvers/machineDesign";
import { designPowerTransmissionModule } from "@/lib/design-workflows/solvers/powerTransmissionDesign";
import { designSpringModule } from "@/lib/design-workflows/solvers/springDesignExtended";
import { designFastenerModule } from "@/lib/design-workflows/solvers/fastenerDesign";
import { designMaterialsModule, designProfilesSection } from "@/lib/design-workflows/solvers/materialsDesign";
import { designPressureModule } from "@/lib/design-workflows/solvers/pressureDesign";
import { designDynamicsModule } from "@/lib/design-workflows/solvers/dynamicsDesign";
import { designManufacturingModule } from "@/lib/design-workflows/solvers/manufacturingDesign";
import { designAdvancedModule } from "@/lib/design-workflows/solvers/advancedSystemsDesign";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

export type DesignCandidate = {
  label: string;
  utilization: number;
  fields: Record<string, unknown>;
  detail?: string;
};

export type ModuleDesignModeResult = {
  method: string;
  best: DesignCandidate | null;
  ranked: DesignCandidate[];
};

export function runModuleDesignMode(
  moduleId: string,
  userInputs: ModuleUserInputs = {}
): ModuleDesignModeResult | undefined {
  const catalogModule = allModules.find((item) => item.id === moduleId);
  if (!catalogModule) {
    if (moduleId === "profiles") return designProfilesSection(userInputs);
    return undefined;
  }

  if (moduleId === "beams") {
    const search = searchBeamSections(
      {
        length: userInputs.length ?? 3.5,
        E: userInputs.E ?? 210e9,
        I: userInputs.I ?? 1e-6,
        c: userInputs.c ?? 0.05,
        support: userInputs.support ?? "simply_supported",
        meshSegments: 24,
        loads: userInputs.loads ?? [{ id: "d", type: "point", value: 12000, position: 1.75 }],
      },
      userInputs.allowableStressPa ?? userInputs.designMaxStressPa ?? 170e6,
      userInputs.deflectionLimit ?? userInputs.designMaxDeflection ?? 0.02,
      8
    );
    return {
      method: "Rolled-section ranking for beam design targets.",
      best: search.best
        ? {
            label: search.best.designation,
            utilization: search.best.utilization,
            fields: { sectionDesignation: search.best.designation, I: search.best.I, c: search.best.c },
            detail: `${(search.best.utilization * 100).toFixed(0)}% util`,
          }
        : null,
      ranked: search.ranked.map((s) => ({
        label: s.designation,
        utilization: s.utilization,
        fields: { sectionDesignation: s.designation, I: s.I, c: s.c },
        detail: `${(s.utilization * 100).toFixed(0)}% util`,
      })),
    };
  }

  if (moduleId === "columns") {
    const search = searchColumnSections(
      {
        length: userInputs.columnLength ?? 3,
        P: userInputs.axialLoad ?? 50000,
        E: userInputs.elasticModulus ?? 210e9,
        endCondition: userInputs.endCondition ?? "pinned",
      },
      userInputs.targetSafetyFactor ?? 2,
      8
    );
    return {
      method: "Catalog column ranking for buckling safety factor.",
      best: search.best
        ? {
            label: search.best.designation,
            utilization: search.best.utilization,
            fields: { sectionDesignation: search.best.designation, inertia: search.best.I, area: search.best.area },
            detail: `SF ${search.best.safetyFactor.toFixed(2)}`,
          }
        : null,
      ranked: search.ranked.map((s) => ({
        label: s.designation,
        utilization: s.utilization,
        fields: { sectionDesignation: s.designation, inertia: s.I, area: s.area },
        detail: `SF ${s.safetyFactor.toFixed(2)}`,
      })),
    };
  }

  if (moduleId === "compression-springs") {
    return designSpringModule(moduleId, userInputs);
  }

  const category = catalogModule.category;
  if (category === "structural") return designStructuralModule(moduleId, userInputs);
  if (category === "machine") return designMachineModule(moduleId, userInputs);
  // Bearings catalog category (bearings, plain-bearings, housing) — not "machine"
  if (category === "bearings") return designMachineModule(moduleId, userInputs);
  if (category === "power-transmission") return designPowerTransmissionModule(moduleId, userInputs);
  if (category === "springs") return designSpringModule(moduleId, userInputs);
  if (category === "fasteners") return designFastenerModule(moduleId, userInputs);
  if (category === "materials") return designMaterialsModule(moduleId, userInputs);
  if (category === "pressure") return designPressureModule(moduleId, userInputs);
  if (category === "dynamics") return designDynamicsModule(moduleId, userInputs);
  if (category === "manufacturing") return designManufacturingModule(moduleId, userInputs);
  if (category === "advanced-systems") return designAdvancedModule(moduleId, userInputs);

  if (category === "tools") {
    return {
      method: "Reference tools use Validate mode; advisor shows formula/unit context from live inputs.",
      best: null,
      ranked: [],
    };
  }

  return designStructuralModule(moduleId, userInputs);
}

export function isDesignModeSupported(moduleId: string): boolean {
  return Boolean(allModules.find((m) => m.id === moduleId) || moduleId === "profiles");
}
