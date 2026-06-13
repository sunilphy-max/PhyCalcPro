"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState, useMemo, useCallback } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ShaftInputs from "@/components/machine/shafts/ShaftInputs";
import ShaftResults from "@/components/machine/shafts/ShaftResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import type { ShaftConfig, ShaftResult, ShaftMaterial, LoadCase } from "@/lib/machine/shafts/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import ShaftLayoutPreview from "@/components/shared/geometry/ShaftLayoutPreview";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";

// Standard materials
const MATERIALS: Record<string, ShaftMaterial> = {
  Steel: {
    name: "Steel",
    E: 210e9,
    G: 80e9,
    density: 7850,
    yieldStress: 250e6,
  },
  Aluminum: {
    name: "Aluminum",
    E: 70e9,
    G: 26e9,
    density: 2700,
    yieldStress: 70e6,
  },
  Titanium: {
    name: "Titanium",
    E: 110e9,
    G: 42e9,
    density: 4510,
    yieldStress: 880e6,
  },
};

type ShaftProjectData = {
  diameter: number;
  length: number;
  material: string;
  elasticModulus: number;
  shearModulus: number;
  loads: LoadCase[];
};

type ShaftProject = LocalProject<ShaftProjectData>;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("shafts", (units) =>
    applyUnitMap(units, {
      length: setLengthUnit,
      stress: setModulusUnit,
      torque: setTorqueUnit,
      moment: setMomentUnit,
      force: setForceUnit,
    })
  );
  // =========================
  // INPUTS
  // =========================
  const [diameter, setDiameter] = useState(0.05);
  const [length, setLength] = useState(1);
  const [material, setMaterial] = useState("Steel");
  const [elasticModulus, setElasticModulus] = useState(210e9);
  const [shearModulus, setShearModulus] = useState(80e9);
  const [loads, setLoads] = useState<LoadCase[]>([
    { position: 0.5, torque: 100, bendingMoment: 200 },
  ]);

  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [modulusUnit, setModulusUnit] = useState("Pa");
  const [torqueUnit, setTorqueUnit] = useState("N·m");
  const [momentUnit, setMomentUnit] = useState("N·m");
  const [forceUnit, setForceUnit] = useState("N");

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<ShaftResult | null>(null);
  const [meshSegments, setMeshSegments] = useState(100);
  const [stressConcentrationFactor, setStressConcentrationFactor] = useState(1);
  const [projectName, setProjectName] = useState("Shaft Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ShaftProject[]>(() =>
    loadLocalProjects<ShaftProjectData>("shaft")
  );

  const handleMaterialChange = (nextMaterial: string) => {
    setMaterial(nextMaterial);
    const mat = MATERIALS[nextMaterial];
    if (mat) {
      setElasticModulus(mat.E);
      setShearModulus(mat.G);
    }
  };

  // =========================
  // SOLVER
  // =========================
  const runCheck = () => {
    const mat = MATERIALS[material] || MATERIALS["Steel"];

    const normalizedInputs: ShaftConfig = {
      geometry: {
        diameter,
        length: toBase(length, "length", lengthUnit),
      },
      material: {
        ...mat,
        E: toBase(elasticModulus, "stress", modulusUnit),
        G: toBase(shearModulus, "stress", modulusUnit),
      },
      loads: loads.map((load) => ({
        position: toBase(load.position, "length", lengthUnit),
        ...(load.torque !== undefined
          ? { torque: toBase(load.torque, "torque", torqueUnit) }
          : {}),
        ...(load.bendingMoment !== undefined
          ? { bendingMoment: toBase(load.bendingMoment, "moment", momentUnit) }
          : {}),
        ...(load.axialForce !== undefined
          ? { axialForce: toBase(load.axialForce, "force", forceUnit) }
          : {}),
      })),
      meshSegments: Math.max(10, Math.round(meshSegments)),
      stressConcentrationFactor,
    };

    const raw = solveShaftEngine(normalizedInputs);

    // Forward transverse load estimate to the bearing module: with the
    // governing bending moment M on span L, a symmetric two-bearing shaft
    // sees reactions of roughly 2·M/L each.
    const spanM = toBase(length, "length", lengthUnit);
    if (raw.maxBendingMoment > 0 && spanM > 0) {
      const reaction = (2 * raw.maxBendingMoment) / spanM;
      publishHandoff("bearings", {
        fromModuleId: "shafts",
        fromTitle: "Shaft Analysis",
        summary: `Estimated bearing reaction ≈ ${(reaction / 1000).toFixed(2)} kN from M_max = ${raw.maxBendingMoment.toFixed(0)} N·m on a ${length} ${lengthUnit} span.`,
        params: { radialLoad: reaction },
      });
    }

    const converted: ShaftResult = {
      ...raw,
      x: raw.x.map((v) => fromBase(v, "length", lengthUnit)),
      deflection: raw.deflection.map((v) =>
        fromBase(v, "length", lengthUnit)
      ),
      criticalSection: fromBase(raw.criticalSection, "length", lengthUnit),
    };

    setResult(wrapResult(converted));
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<ShaftProjectData>("shaft", projectName, {
      diameter,
      length,
      material,
      elasticModulus,
      shearModulus,
      loads,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: ShaftProject) => {
    setProjectName(p.name);
    setDiameter(p.diameter);
    setLength(p.length);
    setMaterial(p.material);
    setElasticModulus(p.elasticModulus);
    setShearModulus(p.shearModulus);
    setLoads(p.loads || []);
  };

  // =========================
  // UI
  // =========================

  const designUserInputs = useMemo((): ModuleUserInputs => ({
      torque: loads[0]?.torque != null ? toBase(loads[0].torque, "torque", torqueUnit) : undefined,
      bendingMoment: loads[0]?.bendingMoment != null ? toBase(loads[0].bendingMoment, "moment", momentUnit) : undefined,
      shaftLoads: loads.map((load) => ({
        position: toBase(load.position, "length", lengthUnit),
        ...(load.torque !== undefined
          ? { torque: toBase(load.torque, "torque", torqueUnit) }
          : {}),
        ...(load.bendingMoment !== undefined
          ? { bendingMoment: toBase(load.bendingMoment, "moment", momentUnit) }
          : {}),
        ...(load.axialForce !== undefined
          ? { axialForce: toBase(load.axialForce, "force", forceUnit) }
          : {}),
      })),
      length: toBase(length, "length", lengthUnit),
      targetSafetyFactor: 2,
    }), [loads, torqueUnit, momentUnit, forceUnit, length, lengthUnit]);

  useSyncDesignInputs("shafts", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.diameter != null) setDiameter(fields.diameter as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("shafts", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="shafts"
      title="Shaft Stress & Deflection Analysis"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as ShaftProject)}
        />
      }
      inputs={
        <div className="space-y-4">
          <ShaftLayoutPreview length={length} diameter={diameter} loads={loads} lengthUnit={lengthUnit} />
          <CrossCalcHandoffBanner
            moduleId="shafts"
            onApply={(params) => {
              setLoads((current) => {
                const midspan = length / 2;
                const next = [...current];
                const imported = {
                  position: midspan,
                  torque: params.torque != null ? fromBase(params.torque, "torque", torqueUnit) : undefined,
                  bendingMoment: 0,
                };
                if (next.length > 0) next[0] = { ...next[0]!, ...imported };
                else next.push(imported);
                return next;
              });
            }}
          />
          <ShaftInputs
            projectName={projectName}
            setProjectName={setProjectName}
            diameter={diameter}
            setDiameter={setDiameter}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            material={material}
            setMaterial={handleMaterialChange}
            elasticModulus={elasticModulus}
            setElasticModulus={setElasticModulus}
            shearModulus={shearModulus}
            setShearModulus={setShearModulus}
          modulusUnit={modulusUnit}
          setModulusUnit={setModulusUnit}
          torqueUnit={torqueUnit}
          setTorqueUnit={setTorqueUnit}
          momentUnit={momentUnit}
          setMomentUnit={setMomentUnit}
          forceUnit={forceUnit}
          setForceUnit={setForceUnit}
          loads={loads}
          setLoads={setLoads}
          meshSegments={meshSegments}
          setMeshSegments={setMeshSegments}
          stressConcentrationFactor={stressConcentrationFactor}
          setStressConcentrationFactor={setStressConcentrationFactor}
          onCalculate={calculate}
          onSave={saveProject}
          saving={saving}
        />
        </div>
      }
      results={
        <ShaftResults
          key={result ? JSON.stringify(result) : "empty"}
          result={result}
          projectName={projectName}
          layout={{ length, diameter, loads, lengthUnit }}
        />
      }
    />
  );
}
