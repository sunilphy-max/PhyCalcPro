"use client";

import { useCallback, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { fromBase } from "@/lib/units/conversions";
import { normalizeInput } from "@/lib/physics";
import type { Load, UDL, BeamConfig, BeamResult } from "@/lib/structural/beams/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { useCalculationPipeline } from "@/hooks/useCalculationPipeline";

import BeamInputs from "@/components/structural/beams/BeamInputs";
import BeamResults from "@/components/structural/beams/BeamResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { materials } from "@/data/materials";
import {
  getBeamApplicationPreset,
  type BeamApplicationId,
} from "@/lib/structural/beams/applicationPresets";

type BeamProjectData = {
  length: number;
  force: number;
  udl: number;
  inertia: number;
  c: number;
  material?: string;
  support?: string;
  loads: Load[];
  applicationId?: BeamApplicationId;
};
type BeamProject = LocalProject<BeamProjectData>;
import { solveBeamEngine } from "@/lib/structural/beams/engine";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { attachBeamCalculationSpec } from "@/lib/standards";
import { useDesignCodeUnits } from "@/hooks/useDesignCodeUnits";
import type { CalculationSpec } from "@/lib/standards/types";

const getNewLoadId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);

const BEAM_UNIT_FIELD_KEYS = [
  "length",
  "force",
  "udl",
  "inertia",
  "moment",
  "stress",
] as const;

const DEFAULT_BEAM_MATERIAL = materials[0]!;

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [udl, setUdl] = useState(200);
  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  const [support, setSupport] = useState<
    "simply_supported" | "cantilever" | "fixed_fixed"
  >("simply_supported");
  const [material, setMaterial] = useState("Steel");
  const [applicationId, setApplicationId] =
    useState<BeamApplicationId>("general_mechanics");
  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");
  const [udlUnit, setUdlUnit] = useState("N/m");
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [momentUnit, setMomentUnit] = useState("N·m");
  const [stressUnit, setStressUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(40);

  // =========================
  // LOADS (STEP 6)
  // =========================
  const [loads, setLoads] = useState<Load[]>(() => [
    {
      id: "initial-point-load",
      type: "point",
      value: 1000,
      position: 2.5,
    },
  ]);

  const addPointLoad = () => {
  setLoads([
    ...loads,
    {
      id: getNewLoadId(),
      type: "point",
      value: 500,
      position: length / 2,
    },
  ]);
};

 const addUDL = () => {
  setLoads([
    ...loads,
    {
      id: getNewLoadId(),
      type: "udl",
      value: 200,
      start: 1,
      end: 4,
    },
  ]);
};
const handleLoadDrag = (
  id: string,
  updates: Partial<Extract<Load, { type: "point" }>>
) => {
  setLoads((prevLoads) =>
    prevLoads.map((load) => {
      if (load.id !== id) return load;

      if (load.type === "point") {
        return {
          ...load,
          ...updates,
        };
      }

      return load;
    })
  );
};
  const updateLoad = (index: number, newLoad: Load) => {
    const updated = [...loads];
    updated[index] = newLoad;
    setLoads(updated);
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

  const isUDL = (load: Load): load is UDL => load.type === "udl";

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<(BeamResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const { designCode } = useDesignCode();

  const applyUnits = useCallback((units: Record<string, string>) => {
    if (units.length) setLengthUnit(units.length);
    if (units.force) setForceUnit(units.force);
    if (units.udl) setUdlUnit(units.udl);
    if (units.inertia) setInertiaUnit(units.inertia);
    if (units.moment) setMomentUnit(units.moment);
    if (units.stress) setStressUnit(units.stress);
  }, []);

  useDesignCodeUnits("beams", BEAM_UNIT_FIELD_KEYS as unknown as string[], applyUnits);
  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<BeamProject[]>(() =>
    loadLocalProjects<BeamProjectData>("beam")
  );
  // =========================
  // SOLVER
  // =========================
  const beamMaterials = materials.filter((m) => m.name !== "Concrete");
  const selectedMaterial =
    beamMaterials.find((m) => m.name === material) ?? beamMaterials[0] ?? DEFAULT_BEAM_MATERIAL;
  const applicationPreset = getBeamApplicationPreset(applicationId);

  const beamPipeline = useCalculationPipeline({
    normalize: (input: {
      length: number;
      I: number;
      c: number;
      support: BeamConfig["support"];
      meshSegments: number;
      loads: Load[];
    }): BeamConfig => ({
      length: normalizeInput({
        value: input.length,
        unit: lengthUnit,
        dimension: "length",
      }),
      E: selectedMaterial.E,
      I: normalizeInput({
        value: input.I,
        unit: inertiaUnit,
        dimension: "inertia",
      }),
      c: normalizeInput({
        value: input.c,
        unit: lengthUnit,
        dimension: "length",
      }),
      support: input.support,
      meshSegments: Math.max(10, Math.round(input.meshSegments)),
      loads: input.loads.map((l) => {
        const loadFactor = applicationPreset.loadFactor;
        if (l.type === "point") {
          return {
            ...l,
            value: normalizeInput({
              value: l.value,
              unit: forceUnit,
              dimension: "force",
            }) * loadFactor,
            position: normalizeInput({
              value: l.position,
              unit: lengthUnit,
              dimension: "length",
            }),
          };
        }
        if (isUDL(l)) {
          return {
            ...l,
            value: normalizeInput({
              value: l.value,
              unit: udlUnit,
              dimension: "forcePerLength",
            }) * loadFactor,
            start: normalizeInput({
              value: l.start,
              unit: lengthUnit,
              dimension: "length",
            }),
            end: normalizeInput({
              value: l.end,
              unit: lengthUnit,
              dimension: "length",
            }),
          };
        }
        return {
          ...l,
          value: normalizeInput({
            value: l.value,
            unit: momentUnit,
            dimension: "moment",
          }) * loadFactor,
          position: normalizeInput({
            value: l.position,
            unit: lengthUnit,
            dimension: "length",
          }),
        };
      }),
    }),
    solve: (normalized) => solveBeamEngine(normalized),
    convertOutput: (raw) => ({
      ...raw,
      shear: raw.shear.map((v: number) => fromBase(v, "force", forceUnit)),
      moment: raw.moment.map((v: number) => fromBase(v, "moment", momentUnit)),
      deflection: raw.deflection.map((v: number) => fromBase(v, "length", lengthUnit)),
      stress: raw.stress.map((v: number) => fromBase(v, "stress", stressUnit)),
      maxShear: fromBase(raw.maxShear, "force", forceUnit),
      maxMoment: fromBase(raw.maxMoment, "moment", momentUnit),
      maxStress: fromBase(raw.maxStress, "stress", stressUnit),
      maxDeflection: fromBase(raw.maxDeflection, "length", lengthUnit),
    }),
  });
  const calculate = () => {
    const { normalized, raw, output: converted } = beamPipeline.run({
      length,
      I,
      c,
      support,
      meshSegments,
      loads,
    });

    const yieldStressPa = selectedMaterial.yieldStress ?? 250e6;
    const allowableStressPa = yieldStressPa * applicationPreset.allowableStressRatio;
    const deflectionLimitBase =
      normalized.length / applicationPreset.deflectionLimitRatio;
    const stressUtilization =
      allowableStressPa > 0 ? raw.maxStress / allowableStressPa : 0;
    const deflectionUtilization =
      deflectionLimitBase > 0 ? raw.maxDeflection / deflectionLimitBase : 0;
    const calculationSpec = attachBeamCalculationSpec(raw, designCode, {
      yieldStressPa,
      allowableStressPa,
      deflectionLimit: deflectionLimitBase,
      c: normalized.c,
      I: normalized.I,
      spanLength: normalized.length,
    }).calculationSpec;

    setResult({
      ...converted,
      calculationSpec,
      applicationContext: {
        id: applicationPreset.id,
        label: applicationPreset.label,
        description: applicationPreset.description,
        standards: applicationPreset.standards,
        loadFactor: applicationPreset.loadFactor,
        allowableStressRatio: applicationPreset.allowableStressRatio,
        deflectionLimitRatio: applicationPreset.deflectionLimitRatio,
        fatigueSensitive: applicationPreset.fatigueSensitive,
        allowableStress: fromBase(allowableStressPa, "stress", stressUnit),
        deflectionLimit: fromBase(deflectionLimitBase, "length", lengthUnit),
        stressUtilization,
        deflectionUtilization,
        calculationNotes: applicationPreset.calculationNotes,
        limitations: applicationPreset.limitations,
      },
    });
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<BeamProjectData>("beam", projectName, {
      length,
      force,
      udl,
      inertia: I,
      c,
      material,
      support,
      loads,
      applicationId,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: BeamProject) => {
    setProjectName(p.name);
    setLength(p.length);
    setForce(p.force);
    setUdl(p.udl);
    setI(p.inertia);
    setC(p.c);
    setMaterial(p.material === "Concrete" ? "Steel" : p.material ?? "Steel");
    setLoads(p.loads ?? []);
    setApplicationId(p.applicationId ?? "general_mechanics");
    if (p.support === "simply_supported" || p.support === "cantilever" || p.support === "fixed_fixed") {
      setSupport(p.support);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <CalculatorLayout
      moduleId="beams"
      title="Beam Analysis Module"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as BeamProject)}
        />
      }
      inputs={
        <BeamInputs
            projectName={projectName}
            setProjectName={setProjectName}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            force={force}
            setForce={setForce}
            forceUnit={forceUnit}
            setForceUnit={setForceUnit}
            udl={udl}
            setUdl={setUdl}
            udlUnit={udlUnit}
            setUdlUnit={setUdlUnit}
            I={I}
            setI={setI}
            inertiaUnit={inertiaUnit}
            setInertiaUnit={setInertiaUnit}
            momentUnit={momentUnit}
            setMomentUnit={setMomentUnit}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            c={c}
            setC={setC}
            support={support}
            setSupport={setSupport}
            loads={loads}
            material={material}
            setMaterial={setMaterial}
            applicationId={applicationId}
            setApplicationId={setApplicationId}
            updateLoad={updateLoad}
            removeLoad={removeLoad}
            addPointLoad={addPointLoad}
            addUDL={addUDL}
            onCalculate={calculate}
            saveProject={saveProject}
            saving={saving}
            meshSegments={meshSegments}
            setMeshSegments={setMeshSegments}
          />
      }
      results={
        <BeamResults
          key={result ? JSON.stringify(result) : "empty"}
          result={result}
          length={length}
          support={support}
          loads={loads}
          onLoadDrag={handleLoadDrag}
          applicationContext={result?.applicationContext}
          units={{
            length: lengthUnit,
            force: forceUnit,
            moment: momentUnit,
            stress: stressUnit,
          }}
        />
      }
    />
  );
}
