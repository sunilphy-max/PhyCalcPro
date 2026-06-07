"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { fromBase, toBase } from "@/lib/units/conversions";
import VBeltsInputs from "@/components/power-transmission/v-belts/VBeltsInputs";
import VBeltsResults from "@/components/power-transmission/v-belts/VBeltsResults";
import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";
import type { VBeltResult } from "@/lib/powerTransmission/v-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { designVBeltDrive, VBELT_SECTION_CATALOG } from "@/lib/design-workflows/solvers/vbeltDesign";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type VBeltProjectData = {
  power: number;
  powerUnit: string;
  speedDriver: number;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  serviceFactor: number;
  ratio?: number;
  beltSection?: string;
};

type VBeltProject = LocalProject<VBeltProjectData>;

function beltFactorForSection(section: string) {
  return VBELT_SECTION_CATALOG.find((item) => item.section === section)?.beltFactor ?? 0.18;
}

export default function Page() {
  const { wrapResult } = useStandardCalculation("v-belts", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      diameter: setLengthUnit,
      centerDistance: setLengthUnit,
    })
  );
  const { mode } = useDesignWorkflow();

  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speedDriver, setSpeedDriver] = useState(1450);
  const [diameterDriver, setDiameterDriver] = useState(150);
  const [diameterDriven, setDiameterDriven] = useState(300);
  const [centerDistance, setCenterDistance] = useState(500);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [serviceFactor, setServiceFactor] = useState(1.2);
  const [ratio, setRatio] = useState(2);
  const [beltSection, setBeltSection] = useState("B");
  const [result, setResult] = useState<(VBeltResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("V-Belt Drive Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<VBeltProject[]>(() =>
    loadLocalProjects<VBeltProjectData>("v-belts")
  );

  useSyncDesignInputs(
    "v-belts",
    useMemo(
      (): ModuleUserInputs => ({
        power,
        powerUnit,
        speedDriver,
        diameterDriver: toBase(diameterDriver, "length", lengthUnit),
        diameterDriven: toBase(diameterDriven, "length", lengthUnit),
        centerDistance: toBase(centerDistance, "length", lengthUnit),
        serviceFactor,
        ratio,
        beltSection,
      }),
      [
        power,
        powerUnit,
        speedDriver,
        diameterDriver,
        diameterDriven,
        centerDistance,
        lengthUnit,
        serviceFactor,
        ratio,
        beltSection,
      ]
    )
  );

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.beltSection != null) setBeltSection(String(fields.beltSection));
    if (fields.diameterDriver != null) {
      setDiameterDriver(fromBase(fields.diameterDriver as number, "length", lengthUnit));
    }
    if (fields.diameterDriven != null) {
      setDiameterDriven(fromBase(fields.diameterDriven as number, "length", lengthUnit));
    }
  }, [lengthUnit]);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const runCheck = () => {
    const normalizedPower = powerUnit === "kW" ? power : power / 1000;
    setResult(
      wrapResult(
        solveVBeltDrive({
          power: normalizedPower,
          speedDriver,
          diameterDriver: toBase(diameterDriver, "length", lengthUnit),
          diameterDriven: toBase(diameterDriven, "length", lengthUnit),
          centerDistance: toBase(centerDistance, "length", lengthUnit),
          serviceFactor,
          beltFactor: beltFactorForSection(beltSection),
          frictionCoeff: 0.5,
        })
      )
    );
  };

  const calculate = () => {
    if (mode === "design") {
      const normalizedPower = powerUnit === "kW" ? power : power / 1000;
      const design = designVBeltDrive({
        powerKw: normalizedPower,
        speedDriver,
        ratio,
        serviceFactor,
      });
      if (design.best) {
        setBeltSection(design.best.section);
        setDiameterDriver(fromBase(design.best.diameterDriver, "length", lengthUnit));
        setDiameterDriven(fromBase(design.best.diameterDriven, "length", lengthUnit));
        setCenterDistance(fromBase(design.best.centerDistance, "length", lengthUnit));
        setResult(
          wrapResult(
            solveVBeltDrive({
              power: normalizedPower,
              speedDriver,
              diameterDriver: design.best.diameterDriver,
              diameterDriven: design.best.diameterDriven,
              centerDistance: design.best.centerDistance,
              serviceFactor,
              beltFactor: beltFactorForSection(design.best.section),
              frictionCoeff: 0.5,
            })
          )
        );
      } else {
        runCheck();
      }
      return;
    }

    runCheck();
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<VBeltProjectData>("v-belts", projectName, {
      power,
      powerUnit,
      speedDriver,
      diameterDriver,
      diameterDriven,
      centerDistance,
      serviceFactor,
      ratio,
      beltSection,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: VBeltProject) => {
    setProjectName(project.name);
    setPower(project.power);
    setPowerUnit(project.powerUnit);
    setSpeedDriver(project.speedDriver);
    setDiameterDriver(project.diameterDriver);
    setDiameterDriven(project.diameterDriven);
    setCenterDistance(project.centerDistance);
    setServiceFactor(project.serviceFactor);
    setRatio(project.ratio ?? 2);
    setBeltSection(project.beltSection ?? "B");
  };

  return (
    <CalculatorLayout
      moduleId="v-belts"
      title="V-Belt Drive"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as VBeltProject)}
        />
      }
      inputs={
        <div className="space-y-4">
          <VBeltsInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speedDriver={speedDriver}
          setSpeedDriver={setSpeedDriver}
          diameterDriver={diameterDriver}
          setDiameterDriver={setDiameterDriver}
          diameterDriven={diameterDriven}
          setDiameterDriven={setDiameterDriven}
          centerDistance={centerDistance}
          setCenterDistance={setCenterDistance}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          serviceFactor={serviceFactor}
          setServiceFactor={setServiceFactor}
          onCalculate={calculate}
          workflowMode={mode}
          ratio={ratio}
          setRatio={setRatio}
          beltSection={beltSection}
          setBeltSection={setBeltSection}
          onSave={saveProject}
          saving={saving}
          projectName={projectName}
          setProjectName={setProjectName}
        />
        </div>
      }
      results={
        <>
          <CalculatorGuidancePanel title="V-belt drives">
            <p>
              Use standard groove profiles and manufacturer power ratings to confirm selection. Increase center distance
              when wrap angle on the small pulley drops below about 120°.
            </p>
          </CalculatorGuidancePanel>
          <VBeltsResults result={result} lengthUnit={lengthUnit} />
        </>
      }
    />
  );
}
