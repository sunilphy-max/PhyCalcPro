"use client";

import { useMergedDesignInputs } from "@/hooks/useMergedDesignInputs";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState, useMemo, useCallback } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ShaftInputs, { type SupportPreset } from "@/components/machine/shafts/ShaftInputs";
import ShaftResults from "@/components/machine/shafts/ShaftResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import type {
  BearingSupport,
  LoadCase,
  ShaftConfig,
  ShaftMaterial,
  ShaftResult,
  ShaftSegment,
  StressFeature,
} from "@/lib/machine/shafts/types";
import type { SurfaceFinish } from "@/lib/materials/fatigue/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import ShaftLayoutPreview from "@/components/shared/geometry/ShaftLayoutPreview";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";

const MATERIALS: Record<string, ShaftMaterial> = {
  Steel: {
    name: "Steel",
    E: 210e9,
    G: 80e9,
    density: 7850,
    yieldStress: 250e6,
    ultimateStrength: 690e6,
  },
  Aluminum: {
    name: "Aluminum",
    E: 70e9,
    G: 26e9,
    density: 2700,
    yieldStress: 70e6,
    ultimateStrength: 130e6,
  },
  Titanium: {
    name: "Titanium",
    E: 110e9,
    G: 42e9,
    density: 4510,
    yieldStress: 880e6,
    ultimateStrength: 950e6,
  },
};

type ShaftProjectData = {
  diameter: number;
  length: number;
  material: string;
  elasticModulus: number;
  shearModulus: number;
  loads: LoadCase[];
  supports: BearingSupport[];
  supportPreset: SupportPreset;
  segments: ShaftSegment[];
  useSteppedGeometry: boolean;
  stressFeatures: StressFeature[];
  operatingRpm: number;
  includeSelfWeight: boolean;
  surfaceFinish: SurfaceFinish;
  stressConcentrationFactor: number;
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

  const [diameter, setDiameter] = useState(0.05);
  const [length, setLength] = useState(1);
  const [material, setMaterial] = useState("Steel");
  const [elasticModulus, setElasticModulus] = useState(210e9);
  const [shearModulus, setShearModulus] = useState(80e9);
  const [loads, setLoads] = useState<LoadCase[]>([
    { position: 0.5, torque: 100, bendingMoment: 200 },
  ]);
  const [supports, setSupports] = useState<BearingSupport[]>([{ position: 0, type: "fixed" }]);
  const [supportPreset, setSupportPreset] = useState<SupportPreset>("fixed_left");
  const [segments, setSegments] = useState<ShaftSegment[]>([]);
  const [useSteppedGeometry, setUseSteppedGeometry] = useState(false);
  const [stressFeatures, setStressFeatures] = useState<StressFeature[]>([]);
  const [operatingRpm, setOperatingRpm] = useState(0);
  const [includeSelfWeight, setIncludeSelfWeight] = useState(false);
  const [surfaceFinish, setSurfaceFinish] = useState<SurfaceFinish>("machined");

  const [lengthUnit, setLengthUnit] = useState("m");
  const [modulusUnit, setModulusUnit] = useState("Pa");
  const [torqueUnit, setTorqueUnit] = useState("N·m");
  const [momentUnit, setMomentUnit] = useState("N·m");
  const [forceUnit, setForceUnit] = useState("N");

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

  const buildConfig = useCallback((): ShaftConfig => {
    const mat = MATERIALS[material] || MATERIALS["Steel"];
    const spanM = toBase(length, "length", lengthUnit);

    const normalizedSegments = useSteppedGeometry
      ? segments.map((s) => ({
          length: toBase(s.length, "length", lengthUnit),
          outerDiameter: toBase(s.outerDiameter, "length", lengthUnit),
          innerDiameter: s.innerDiameter
            ? toBase(s.innerDiameter, "length", lengthUnit)
            : 0,
        }))
      : undefined;

    return {
      geometry: {
        diameter: toBase(diameter, "length", lengthUnit),
        length: spanM,
        segments: normalizedSegments,
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
        ...(load.transverseForce !== undefined
          ? { transverseForce: toBase(load.transverseForce, "force", forceUnit) }
          : {}),
      })),
      supports: supports.map((s) => ({
        ...s,
        position: toBase(s.position, "length", lengthUnit),
      })),
      stressFeatures: stressFeatures.map((f) => ({
        ...f,
        position: toBase(f.position, "length", lengthUnit),
        largerDiameter: f.largerDiameter
          ? toBase(f.largerDiameter, "length", lengthUnit)
          : undefined,
        smallerDiameter: f.smallerDiameter
          ? toBase(f.smallerDiameter, "length", lengthUnit)
          : undefined,
        filletRadius: f.filletRadius
          ? toBase(f.filletRadius, "length", lengthUnit)
          : undefined,
      })),
      meshSegments: Math.max(10, Math.round(meshSegments)),
      stressConcentrationFactor,
      operatingRpm,
      includeSelfWeight,
      fatigue: {
        enabled: operatingRpm > 0,
        surfaceFinish,
      },
    };
  }, [
    diameter,
    length,
    lengthUnit,
    material,
    elasticModulus,
    shearModulus,
    modulusUnit,
    loads,
    torqueUnit,
    momentUnit,
    forceUnit,
    supports,
    stressFeatures,
    meshSegments,
    stressConcentrationFactor,
    operatingRpm,
    includeSelfWeight,
    surfaceFinish,
    useSteppedGeometry,
    segments,
  ]);

  const runCheck = () => {
    const raw = solveShaftEngine(buildConfig());

    const maxReaction = raw.bearingReactions.reduce(
      (max, r) => Math.max(max, Math.hypot(r.forceY, r.forceZ)),
      0
    );
    if (maxReaction > 0) {
      publishHandoff("bearings", {
        fromModuleId: "shafts",
        fromTitle: "Shaft Analysis",
        summary: `Bearing radial load ≈ ${(maxReaction / 1000).toFixed(2)} kN from shaft FEM reactions.`,
        params: {
          radialLoad: maxReaction,
          ...(operatingRpm > 0 ? { speed: operatingRpm } : {}),
        },
      });
    }

    const converted: ShaftResult = {
      ...raw,
      x: raw.x.map((v) => fromBase(v, "length", lengthUnit)),
      deflection: raw.deflection.map((v) => fromBase(v, "length", lengthUnit)),
      criticalSection: fromBase(raw.criticalSection, "length", lengthUnit),
      bearingReactions: raw.bearingReactions.map((r) => ({
        ...r,
        position: fromBase(r.position, "length", lengthUnit),
      })),
      bearingSlopes: raw.bearingSlopes.map((s) => ({
        ...s,
        position: fromBase(s.position, "length", lengthUnit),
      })),
    };

    setResult(wrapResult(converted));
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<ShaftProjectData>("shaft", projectName, {
      diameter,
      length,
      material,
      elasticModulus,
      shearModulus,
      loads,
      supports,
      supportPreset,
      segments,
      useSteppedGeometry,
      stressFeatures,
      operatingRpm,
      includeSelfWeight,
      surfaceFinish,
      stressConcentrationFactor,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (p: ShaftProject) => {
    setProjectName(p.name);
    setDiameter(p.diameter);
    setLength(p.length);
    setMaterial(p.material);
    setElasticModulus(p.elasticModulus);
    setShearModulus(p.shearModulus);
    setLoads(p.loads || []);
    setSupports(p.supports ?? [{ position: 0, type: "fixed" }]);
    setSupportPreset(p.supportPreset ?? "fixed_left");
    setSegments(p.segments ?? []);
    setUseSteppedGeometry(p.useSteppedGeometry ?? false);
    setStressFeatures(p.stressFeatures ?? []);
    setOperatingRpm(p.operatingRpm ?? 0);
    setIncludeSelfWeight(p.includeSelfWeight ?? false);
    setSurfaceFinish(p.surfaceFinish ?? "machined");
    setStressConcentrationFactor(p.stressConcentrationFactor ?? 1);
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    torque: loads[0]?.torque != null ? toBase(loads[0].torque, "torque", torqueUnit) : undefined,
    bendingMoment:
      loads[0]?.bendingMoment != null
        ? toBase(loads[0].bendingMoment, "moment", momentUnit)
        : undefined,
    rpm: operatingRpm > 0 ? operatingRpm : undefined,
    shaftLoads: loads.map((load) => ({
      position: toBase(load.position, "length", lengthUnit),
      ...(load.torque !== undefined ? { torque: toBase(load.torque, "torque", torqueUnit) } : {}),
      ...(load.bendingMoment !== undefined
        ? { bendingMoment: toBase(load.bendingMoment, "moment", momentUnit) }
        : {}),
      ...(load.axialForce !== undefined
        ? { axialForce: toBase(load.axialForce, "force", forceUnit) }
        : {}),
    })),
    length: toBase(length, "length", lengthUnit),
    targetSafetyFactor: 2,
  }), [loads, torqueUnit, momentUnit, forceUnit, length, lengthUnit, operatingRpm]);

  useSyncDesignInputs("shafts", designUserInputs);
  const mergedDesignInputs = useMergedDesignInputs(designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.diameter != null) {
      const dMm = fields.diameter as number;
      setDiameter(fields.diameterUnit === "mm" ? dMm / 1000 : (dMm as number));
    }
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("shafts", mergedDesignInputs);
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
                  bendingMoment: params.bendingMoment != null
                    ? fromBase(params.bendingMoment, "moment", momentUnit)
                    : 0,
                };
                if (next.length > 0) next[0] = { ...next[0]!, ...imported };
                else next.push(imported);
                return next;
              });
              if (params.rpm != null) setOperatingRpm(params.rpm);
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
            supports={supports}
            setSupports={setSupports}
            supportPreset={supportPreset}
            setSupportPreset={setSupportPreset}
            segments={segments}
            setSegments={setSegments}
            useSteppedGeometry={useSteppedGeometry}
            setUseSteppedGeometry={setUseSteppedGeometry}
            stressFeatures={stressFeatures}
            setStressFeatures={setStressFeatures}
            operatingRpm={operatingRpm}
            setOperatingRpm={setOperatingRpm}
            includeSelfWeight={includeSelfWeight}
            setIncludeSelfWeight={setIncludeSelfWeight}
            surfaceFinish={surfaceFinish}
            setSurfaceFinish={setSurfaceFinish}
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
          layout={{ length, diameter, loads, supports, lengthUnit }}
          lengthUnit={lengthUnit}
        />
      }
    />
  );
}
