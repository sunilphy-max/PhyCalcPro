"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import GearInputs from "@/components/machine/gears/GearInputs";
import GearResults from "@/components/machine/gears/GearResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { toBase } from "@/lib/units/conversions";
import { solveGearEngine } from "@/lib/machine/gears/engine";
import type { GearResult, GearMaterial } from "@/lib/machine/gears/types";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import type { CalculationSpec } from "@/lib/standards/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
const MATERIALS: Record<string, GearMaterial> = {
  Steel: {
    name: "Steel",
    E: 210e9,
    yieldStress: 250e6,
    poisson: 0.3,
  },
  Aluminum: {
    name: "Aluminum",
    E: 70e9,
    yieldStress: 150e6,
    poisson: 0.33,
  },
  Bronze: {
    name: "Bronze",
    E: 103e9,
    yieldStress: 140e6,
    poisson: 0.34,
  },
};

type GearProjectData = {
  power: number;
  powerUnit: string;
  rpm: number;
  pinionTeeth: number;
  gearRatio: number;
  module: number;
  moduleUnit: string;
  faceWidth: number;
  faceWidthUnit: string;
  material: string;
};

type GearProject = LocalProject<GearProjectData>;

export default function Page() {
  const { mode: workflowMode, userInputs: workflowUserInputs } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("gears", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      module: setModuleUnit,
      faceWidth: setFaceWidthUnit,
      length: setLengthUnit,
      stress: setStressUnit,
    })
  );
  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [rpm, setRpm] = useState(1200);
  const [pinionTeeth, setPinionTeeth] = useState(20);
  const [gearRatio, setGearRatio] = useState(4);
  const [module, setModule] = useState(5);
  const [moduleUnit, setModuleUnit] = useState("mm");
  const [faceWidth, setFaceWidth] = useState(40);
  const [faceWidthUnit, setFaceWidthUnit] = useState("mm");
  const [material, setMaterial] = useState("Steel");
  const [stressUnit, setStressUnit] = useState("Pa");
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(GearResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Gear Design Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<GearProject[]>(() =>
    loadLocalProjects<GearProjectData>("gears")
  );

  const runCheck = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : power;
    const config = {
      power: normalizedPower,
      speed: rpm,
      module: toBase(module, "length", moduleUnit),
      faceWidth: toBase(faceWidth, "length", faceWidthUnit),
      pinionTeeth,
      gearRatio,
      material: MATERIALS[material] || MATERIALS.Steel,
    };

    const raw = solveGearEngine(config);
    setResult(wrapResult(raw));
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<GearProjectData>("gears", projectName, {
      power,
      powerUnit,
      rpm,
      pinionTeeth,
      gearRatio,
      module,
      moduleUnit,
      faceWidth,
      faceWidthUnit,
      material,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: GearProject) => {
    setProjectName(project.name);
    setPower(project.power);
    setPowerUnit(project.powerUnit);
    setRpm(project.rpm);
    setPinionTeeth(project.pinionTeeth);
    setGearRatio(project.gearRatio);
    setModule(project.module);
    setModuleUnit(project.moduleUnit);
    setFaceWidth(project.faceWidth);
    setFaceWidthUnit(project.faceWidthUnit);
    setMaterial(project.material);
  };


  useSyncDesignInputs(
    "gears",
    useMemo((): ModuleUserInputs => {
      const normalizedPower = powerUnit === "kW" ? power * 1000 : power;
      return {
        power: normalizedPower,
        speedDriver: rpm,
        ratio: gearRatio,
        pinionTeeth,
        module,
        faceWidth,
      };
    }, [power, powerUnit, rpm, gearRatio, pinionTeeth, module, faceWidth])
  );

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.module != null) setModule(fields.module as number);
    if (fields.faceWidth != null) setFaceWidth(fields.faceWidth as number);
    if (fields.pinionTeeth != null) setPinionTeeth(fields.pinionTeeth as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("gears", workflowUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="gears"
      title="Spur Gear Design"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as GearProject)}
        />
      }
      inputs={
        <GearInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          rpm={rpm}
          setRpm={setRpm}
          pinionTeeth={pinionTeeth}
          setPinionTeeth={setPinionTeeth}
          gearRatio={gearRatio}
          setGearRatio={setGearRatio}
          module={module}
          setModule={setModule}
          moduleUnit={moduleUnit}
          setModuleUnit={setModuleUnit}
          faceWidth={faceWidth}
          setFaceWidth={setFaceWidth}
          faceWidthUnit={faceWidthUnit}
          setFaceWidthUnit={setFaceWidthUnit}
          material={material}
          setMaterial={setMaterial}
          onCalculate={calculate}
          projectName={projectName}
          setProjectName={setProjectName}
          onSave={saveProject}
          saving={saving}
        />
      }
      results={<GearResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
    />
  );
}
