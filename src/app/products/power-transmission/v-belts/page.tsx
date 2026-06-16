"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import {
  beltFactorForSection,
  normalizePowerKw,
} from "@/lib/powerTransmission/v-belts/catalog";
import {
  buildApplicationInsights,
  getApplicationProfile,
  resolveApplicationServiceFactor,
  type VBeltApplicationId,
  type VBeltApplicationOptions,
} from "@/lib/powerTransmission/v-belts/applications";
import type { VBeltResult } from "@/lib/powerTransmission/v-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { designVBeltDrive } from "@/lib/design-workflows/solvers/vbeltDesign";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type VBeltProjectData = {
  power: number;
  powerUnit: string;
  speedDriver: number;
  speedDriven: number;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  serviceFactor: number;
  servicePreset: string;
  beltSection: string;
  useManualGeometry: boolean;
  applicationId: VBeltApplicationId;
  applicationOptions: VBeltApplicationOptions;
  useManualServiceFactor: boolean;
};

type VBeltProject = LocalProject<VBeltProjectData>;

const DEFAULT_APPLICATION: VBeltApplicationId = "pump";

export default function Page() {
  const { wrapResult } = useStandardCalculation("v-belts", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      diameter: setLengthUnit,
      centerDistance: setLengthUnit,
    })
  );
  const { mode } = useDesignWorkflow();

  const [applicationId, setApplicationId] = useState<VBeltApplicationId>(DEFAULT_APPLICATION);
  const [applicationOptions, setApplicationOptions] = useState<VBeltApplicationOptions>(() => ({
    applicationId: DEFAULT_APPLICATION,
    subTypeId: "centrifugal",
    operatingHoursPerDay: 24,
    dutyCycle: "continuous",
  }));
  const [useManualServiceFactor, setUseManualServiceFactor] = useState(false);

  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("hp");
  const [speedDriver, setSpeedDriver] = useState(1750);
  const [speedDriven, setSpeedDriven] = useState(875);
  const [diameterDriver, setDiameterDriver] = useState(100);
  const [diameterDriven, setDiameterDriven] = useState(200);
  const [centerDistance, setCenterDistance] = useState(500);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [serviceFactor, setServiceFactor] = useState(1.15);
  const [servicePreset, setServicePreset] = useState("app-pump");
  const [beltSection, setBeltSection] = useState("auto");
  const [useManualGeometry, setUseManualGeometry] = useState(false);
  const [result, setResult] = useState<(VBeltResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Pump drive");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<VBeltProject[]>(() =>
    loadLocalProjects<VBeltProjectData>("v-belts")
  );

  useEffect(() => {
    const profile = getApplicationProfile(applicationId);
    setApplicationOptions((current) => ({
      ...current,
      applicationId,
      operatingHoursPerDay: profile.defaultOperatingHoursPerDay,
      subTypeId: profile.subTypes?.[0]?.id ?? current.subTypeId,
    }));
    setProjectName(`${profile.label} drive`);
  }, [applicationId]);

  useEffect(() => {
    if (useManualServiceFactor) return;
    const resolved = resolveApplicationServiceFactor(applicationOptions, serviceFactor, false);
    setServiceFactor(resolved.factor);
    setServicePreset(`app-${applicationOptions.applicationId}`);
  }, [applicationOptions, useManualServiceFactor]);

  useSyncDesignInputs(
    "v-belts",
    useMemo(
      (): ModuleUserInputs => ({
        power,
        powerUnit,
        speedDriver,
        speedDriven,
        diameterDriver: toBase(diameterDriver, "length", lengthUnit),
        diameterDriven: toBase(diameterDriven, "length", lengthUnit),
        centerDistance: toBase(centerDistance, "length", lengthUnit),
        serviceFactor,
        beltSection,
      }),
      [
        power,
        powerUnit,
        speedDriver,
        speedDriven,
        diameterDriver,
        diameterDriven,
        centerDistance,
        lengthUnit,
        serviceFactor,
        beltSection,
      ]
    )
  );

  const applyDesignFields = useCallback(
    (fields: Record<string, unknown>) => {
      if (fields.beltSection != null) setBeltSection(String(fields.beltSection));
      if (fields.diameterDriver != null) {
        setDiameterDriver(fromBase(fields.diameterDriver as number, "length", lengthUnit));
      }
      if (fields.diameterDriven != null) {
        setDiameterDriven(fromBase(fields.diameterDriven as number, "length", lengthUnit));
      }
      if (fields.centerDistance != null) {
        setCenterDistance(fromBase(fields.centerDistance as number, "length", lengthUnit));
      }
    },
    [lengthUnit]
  );

  useRegisterApplyDesignCandidate(applyDesignFields);

  const runSolver = useCallback(
    (geometry: {
      diameterDriver: number;
      diameterDriven: number;
      centerDistance: number;
      section: string;
    }) => {
      const powerKw = normalizePowerKw(power, powerUnit);
      const sf = resolveApplicationServiceFactor(applicationOptions, serviceFactor, useManualServiceFactor);

      const raw = solveVBeltDrive({
        power: powerKw,
        speedDriver,
        speedDriven,
        diameterDriver: geometry.diameterDriver,
        diameterDriven: geometry.diameterDriven,
        centerDistance: geometry.centerDistance,
        serviceFactor: sf.factor,
        beltFactor: beltFactorForSection(geometry.section),
        frictionCoeff: 0.5,
        beltSection: geometry.section,
      });

      raw.applicationInsights = buildApplicationInsights(
        raw,
        { ...applicationOptions, applicationId },
        sf.factor,
        sf.source
      );

      setResult(wrapResult(raw));

      publishHandoff("shafts", {
        fromModuleId: "v-belts",
        fromTitle: `${raw.applicationInsights?.applicationLabel ?? "V-Belt"} Drive`,
        summary: `Driver torque ${raw.driverTorque.toFixed(0)} N·m at ${speedDriver} rpm; radial belt load ≈ ${(raw.radialLoadDriver / 1000).toFixed(2)} kN on driver pulley.`,
        params: {
          torque: raw.driverTorque,
          radialForce: raw.radialLoadDriver,
          speed: speedDriver,
        },
      });
      publishHandoff("bearings", {
        fromModuleId: "v-belts",
        fromTitle: `${raw.applicationInsights?.applicationLabel ?? "V-Belt"} Drive`,
        summary: `Estimated pulley reaction ≈ ${(raw.radialLoadDriver / 1000).toFixed(2)} kN at ${speedDriver} rpm (driver shaft).`,
        params: {
          radialLoad: raw.radialLoadDriver,
          speed: speedDriver,
        },
      });
    },
    [
      applicationId,
      applicationOptions,
      power,
      powerUnit,
      serviceFactor,
      speedDriver,
      speedDriven,
      useManualServiceFactor,
      wrapResult,
    ]
  );

  const calculate = () => {
    const powerKw = normalizePowerKw(power, powerUnit);
    const centerM = toBase(centerDistance, "length", lengthUnit);
    const sf = resolveApplicationServiceFactor(applicationOptions, serviceFactor, useManualServiceFactor);
    const shouldSize = mode === "design" || !useManualGeometry;

    if (shouldSize) {
      const design = designVBeltDrive({
        powerKw,
        speedDriver,
        speedDriven,
        serviceFactor: sf.factor,
        centerDistance: centerM,
        beltSection,
      });

      if (design.best) {
        setBeltSection(design.best.section);
        setDiameterDriver(fromBase(design.best.diameterDriver, "length", lengthUnit));
        setDiameterDriven(fromBase(design.best.diameterDriven, "length", lengthUnit));
        setCenterDistance(fromBase(design.best.centerDistance, "length", lengthUnit));
        runSolver({
          diameterDriver: design.best.diameterDriver,
          diameterDriven: design.best.diameterDriven,
          centerDistance: design.best.centerDistance,
          section: design.best.section,
        });
        return;
      }
    }

    const section = beltSection === "auto" ? "B" : beltSection;
    runSolver({
      diameterDriver: toBase(diameterDriver, "length", lengthUnit),
      diameterDriven: toBase(diameterDriven, "length", lengthUnit),
      centerDistance: centerM,
      section,
    });
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<VBeltProjectData>("v-belts", projectName, {
      power,
      powerUnit,
      speedDriver,
      speedDriven,
      diameterDriver,
      diameterDriven,
      centerDistance,
      serviceFactor,
      servicePreset,
      beltSection,
      useManualGeometry,
      applicationId,
      applicationOptions,
      useManualServiceFactor,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: VBeltProject) => {
    setProjectName(project.name);
    setPower(project.power);
    setPowerUnit(project.powerUnit);
    setSpeedDriver(project.speedDriver);
    setSpeedDriven(project.speedDriven ?? 875);
    setDiameterDriver(project.diameterDriver);
    setDiameterDriven(project.diameterDriven);
    setCenterDistance(project.centerDistance);
    setServiceFactor(project.serviceFactor);
    setServicePreset(project.servicePreset ?? "normal");
    setBeltSection(project.beltSection ?? "auto");
    setUseManualGeometry(project.useManualGeometry ?? false);
    setApplicationId(project.applicationId ?? DEFAULT_APPLICATION);
    setApplicationOptions(project.applicationOptions ?? { applicationId: DEFAULT_APPLICATION, operatingHoursPerDay: 16 });
    setUseManualServiceFactor(project.useManualServiceFactor ?? false);
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
            applicationId={applicationId}
            setApplicationId={setApplicationId}
            applicationOptions={applicationOptions}
            setApplicationOptions={setApplicationOptions}
            useManualServiceFactor={useManualServiceFactor}
            setUseManualServiceFactor={setUseManualServiceFactor}
            power={power}
            setPower={setPower}
            powerUnit={powerUnit}
            setPowerUnit={setPowerUnit}
            speedDriver={speedDriver}
            setSpeedDriver={setSpeedDriver}
            speedDriven={speedDriven}
            setSpeedDriven={setSpeedDriven}
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
            servicePreset={servicePreset}
            setServicePreset={setServicePreset}
            beltSection={beltSection}
            setBeltSection={setBeltSection}
            useManualGeometry={useManualGeometry}
            setUseManualGeometry={setUseManualGeometry}
            onCalculate={calculate}
            workflowMode={mode}
            onSave={saveProject}
            saving={saving}
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </div>
      }
      results={
        <>
          <CalculatorGuidancePanel title="Application-aware V-belt sizing">
            <p>
              Select your application type to auto-tune service factor, warnings, and recommendations. The same core
              solver sizes pulleys, belt count, tensions, and shaft loads for pumps, compressors, fans, conveyors, and
              more.
            </p>
            <p className="mt-2">
              Results are grouped as MVP step 1 (sizing), step 2 (verification), and step 3 (life &amp; workflow
              handoff). Confirm final belt selection with manufacturer catalogs.
            </p>
          </CalculatorGuidancePanel>
          <VBeltsResults result={result} lengthUnit={lengthUnit} serviceFactor={serviceFactor} />
        </>
      }
    />
  );
}
