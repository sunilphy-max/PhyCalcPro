"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import CalculatorLayout from "@/components/CalculatorLayout";
import { fromBase, toBase } from "@/lib/units/conversions";
import { normalizeInput } from "@/lib/physics";
import type { Load, UDL, BeamConfig, BeamResult } from "@/lib/structural/beams/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { useCalculationPipeline } from "@/hooks/useCalculationPipeline";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { searchBeamSections } from "@/lib/design-workflows/solvers/beamDesign";

import BeamInputs from "@/components/structural/beams/BeamInputs";
import BeamResults from "@/components/structural/beams/BeamResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { materials } from "@/data/materials";
import {
  getBeamApplicationPreset,
  type BeamApplicationId,
} from "@/lib/structural/beams/applicationPresets";
import { useBeamApplicationPreset } from "@/hooks/useApplicationPreset";

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
  sectionDesignation?: string;
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
  const [material, setMaterial] = useState("S275JR");
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get("material");
    if (q) {
      const name = decodeURIComponent(q);
      if (materials.some((m) => m.name === name)) setMaterial(name);
    }
  }, [searchParams]);
  const { applicationId } = useBeamApplicationPreset();
  const { patchDesignTarget, mode } = useDesignWorkflow();
  const [sectionDesignation, setSectionDesignation] = useState("");
  const [designMaxDeflection, setDesignMaxDeflection] = useState<number | undefined>(undefined);
  const [designMaxStress, setDesignMaxStress] = useState<number | undefined>(undefined);
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
  const beamMaterials = materials.filter((m) =>
    ["structural-steel", "alloy-steel", "stainless-steel", "aluminum", "titanium", "other"].includes(m.category)
  );
  const selectedMaterial =
    beamMaterials.find((m) => m.name === material) ?? beamMaterials[0] ?? DEFAULT_BEAM_MATERIAL;
  const applicationPreset = getBeamApplicationPreset(applicationId);

  const applySectionProperties = useCallback(
    (_designation: string, section: { ix: number; depth: number }) => {
      setI(section.ix);
      setC(section.depth / 2);
    },
    []
  );

  const designUserInputs = useMemo((): ModuleUserInputs => {
    const yieldStressPa = selectedMaterial.yieldStress ?? 250e6;
    const allowableStressPa = designMaxStress
      ? toBase(designMaxStress, "stress", stressUnit)
      : yieldStressPa * applicationPreset.allowableStressRatio;
    const spanBase = normalizeInput({ value: length, unit: lengthUnit, dimension: "length" });
    const deflectionLimit = designMaxDeflection
      ? toBase(designMaxDeflection, "length", lengthUnit)
      : spanBase / applicationPreset.deflectionLimitRatio;

    return {
      length,
      lengthUnit,
      loads,
      support,
      material,
      E: selectedMaterial.E,
      I,
      c,
      applicationId,
      allowableStressPa,
      deflectionLimit,
      sectionDesignation,
      designMaxDeflection,
      designMaxStressPa: designMaxStress ? toBase(designMaxStress, "stress", stressUnit) : undefined,
    };
  }, [
    length,
    lengthUnit,
    loads,
    support,
    material,
    I,
    c,
    applicationId,
    designMaxDeflection,
    designMaxStress,
    stressUnit,
    sectionDesignation,
    selectedMaterial,
    applicationPreset,
  ]);

  useSyncDesignInputs("beams", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.sectionDesignation != null) setSectionDesignation(String(fields.sectionDesignation));
    if (fields.I != null) setI(fields.I as number);
    if (fields.c != null) setC(fields.c as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

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
  const runCheck = (sectionI = I, sectionC = c) => {
    const { normalized, raw, output: converted } = beamPipeline.run({
      length,
      I: sectionI,
      c: sectionC,
      support,
      meshSegments,
      loads,
    });

    const yieldStressPa = selectedMaterial.yieldStress ?? 250e6;
    const allowableStressPa = designMaxStress
      ? toBase(designMaxStress, "stress", stressUnit)
      : yieldStressPa * applicationPreset.allowableStressRatio;
    const deflectionLimitBase =
      designMaxDeflection != null
        ? toBase(designMaxDeflection, "length", lengthUnit)
        : normalized.length / applicationPreset.deflectionLimitRatio;
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
      E: selectedMaterial.E,
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

    publishHandoff("columns", {
      fromModuleId: "beams",
      fromTitle: "Beam Analysis",
      summary: `Carry section I=${normalized.I.toExponential(2)} m⁴, area ${normalized.c.toExponential(2)} m², peak stress ${raw.maxStress.toExponential(2)} Pa`,
      params: {
        inertia: normalized.I,
        area: normalized.c,
        axialLoad: raw.maxStress * normalized.c,
      },
    });
  };

  const calculate = () => {
    if (mode === "design") {
      const { normalized } = beamPipeline.run({
        length,
        I,
        c,
        support,
        meshSegments,
        loads,
      });
      const yieldStressPa = selectedMaterial.yieldStress ?? 250e6;
      const allowableStressPa = designMaxStress
        ? toBase(designMaxStress, "stress", stressUnit)
        : yieldStressPa * applicationPreset.allowableStressRatio;
      const deflectionLimitBase =
        designMaxDeflection != null
          ? toBase(designMaxDeflection, "length", lengthUnit)
          : normalized.length / applicationPreset.deflectionLimitRatio;
      const search = searchBeamSections(normalized, allowableStressPa, deflectionLimitBase);
      if (search.best) {
        setSectionDesignation(search.best.designation);
        setI(search.best.I);
        setC(search.best.c);
        runCheck(search.best.I, search.best.c);
      } else {
        runCheck();
      }
      return;
    }

    runCheck();
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
      sectionDesignation,
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
    setMaterial(p.material && materials.some((m) => m.name === p.material) ? p.material : "S275JR");
    setLoads(p.loads ?? []);
    patchDesignTarget("applicationPresetId", p.applicationId ?? "general_mechanics");
    setSectionDesignation(p.sectionDesignation ?? "");
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
            updateLoad={updateLoad}
            removeLoad={removeLoad}
            addPointLoad={addPointLoad}
            addUDL={addUDL}
            onCalculate={calculate}
            saveProject={saveProject}
            saving={saving}
            meshSegments={meshSegments}
            setMeshSegments={setMeshSegments}
            workflowMode={mode}
            sectionDesignation={sectionDesignation}
            setSectionDesignation={setSectionDesignation}
            onSectionApplied={applySectionProperties}
            designMaxDeflection={designMaxDeflection ?? length / applicationPreset.deflectionLimitRatio}
            setDesignMaxDeflection={setDesignMaxDeflection}
            designMaxStress={
              designMaxStress ??
              fromBase(
                (selectedMaterial.yieldStress ?? 250e6) * applicationPreset.allowableStressRatio,
                "stress",
                stressUnit
              )
            }
            setDesignMaxStress={setDesignMaxStress}
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
