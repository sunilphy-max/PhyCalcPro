"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
import { materials, type Material } from "@/data/materials";
import {
  getBeamApplicationPreset,
  type BeamApplicationId,
} from "@/lib/structural/beams/applicationPresets";
import { useBeamApplicationPreset } from "@/hooks/useApplicationPreset";
import WorkspaceChrome from "@/components/workspace/WorkspaceChrome";
import CalculatorKnowledgePanel from "@/components/calculator/CalculatorKnowledgePanel";
import WorkspaceMaterialsPanel from "@/components/workspace/WorkspaceMaterialsPanel";
import WorkspaceAiPanel from "@/components/workspace/WorkspaceAiPanel";
import WorkspaceTeachPanel, { BEAM_TEACH_PROMPTS } from "@/components/workspace/WorkspaceTeachPanel";
import WorkspaceReportPanel from "@/components/workspace/WorkspaceReportPanel";
import EngineeringScene, { exportSceneManifest } from "@/components/workspace/EngineeringScene";
import {
  exportDiagramDxf,
  exportDiagramSvgString,
} from "@/components/workspace/InteractiveDiagramKit";
import CalculatorDesignSummary, {
  type DesignSummaryRow,
} from "@/components/calculator/CalculatorDesignSummary";
import ExplainDesignCard from "@/components/calculator/ExplainDesignCard";
import { buildBeamWorkspaceContract } from "@/lib/workspace/designWorkspaceContract";
import { useLiveModuleSolve } from "@/hooks/useLiveModuleSolve";
import {
  appendRevision,
  hashInputs,
  loadRevisions,
  type ProjectRevision,
} from "@/lib/workspace/projectRevisions";
import type { CopilotParams } from "@/lib/copilot/types";

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

function BeamsPageContent() {
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
  const { patchDesignTarget, mode, designTargets } = useDesignWorkflow();
  const [sectionDesignation, setSectionDesignation] = useState("");
  // Local fallbacks until shared DesignTargetFields are edited (values in form display units).
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
  const [livePreview, setLivePreview] = useState(true);
  const [supportLeft, setSupportLeft] = useState(0);
  const [supportRight, setSupportRight] = useState(5);
  const [teachMode, setTeachMode] = useState<"student" | "professional">("student");
  const [revisions, setRevisions] = useState<ProjectRevision[]>(() =>
    loadRevisions("beam", "Beam Project")
  );
  const [engineerName, setEngineerName] = useState("");

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
    // Shared DesignTargetFields store SI; prefer those over local display-unit fallbacks.
    const allowableStressPa =
      designTargets.designMaxStressPa != null
        ? Number(designTargets.designMaxStressPa)
        : designMaxStress
          ? toBase(designMaxStress, "stress", stressUnit)
          : yieldStressPa * applicationPreset.allowableStressRatio;
    const spanBase = normalizeInput({ value: length, unit: lengthUnit, dimension: "length" });
    const deflectionLimit =
      designTargets.designMaxDeflection != null
        ? Number(designTargets.designMaxDeflection)
        : designMaxDeflection
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
    designTargets.designMaxDeflection,
    designTargets.designMaxStressPa,
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
    const allowableStressPa =
      designTargets.designMaxStressPa != null
        ? Number(designTargets.designMaxStressPa)
        : designMaxStress
          ? toBase(designMaxStress, "stress", stressUnit)
          : yieldStressPa * applicationPreset.allowableStressRatio;
    const deflectionLimitBase =
      designTargets.designMaxDeflection != null
        ? Number(designTargets.designMaxDeflection)
        : designMaxDeflection != null
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
      const allowableStressPa =
        designTargets.designMaxStressPa != null
          ? Number(designTargets.designMaxStressPa)
          : designMaxStress
            ? toBase(designMaxStress, "stress", stressUnit)
            : yieldStressPa * applicationPreset.allowableStressRatio;
      const deflectionLimitBase =
        designTargets.designMaxDeflection != null
          ? Number(designTargets.designMaxDeflection)
          : designMaxDeflection != null
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

  // Keep support handles in sync when span changes
  useEffect(() => {
    setSupportLeft(0);
    setSupportRight(length);
  }, [length]);

  const liveInput = useMemo(
    () => ({ length, I, c, support, meshSegments, loads, material, designCode }),
    [length, I, c, support, meshSegments, loads, material, designCode]
  );

  useLiveModuleSolve({
    enabled: livePreview && mode !== "design",
    input: liveInput,
    solve: () => {
      // Side-effect solve via runCheck path — return a token for the hook
      runCheck();
      return true;
    },
    onResult: () => {},
    settleMs: 120,
  });

  const supportPositions =
    support === "simply_supported"
      ? [
          { id: "left", x: supportLeft },
          { id: "right", x: supportRight },
        ]
      : support === "cantilever"
        ? [{ id: "left", x: supportLeft }]
        : [
            { id: "left", x: supportLeft },
            { id: "right", x: supportRight },
          ];

  const handleSupportDrag = (id: string, x: number) => {
    if (id === "left") setSupportLeft(Math.min(x, supportRight - length * 0.05));
    if (id === "right") setSupportRight(Math.max(x, supportLeft + length * 0.05));
  };

  const summaryRows: DesignSummaryRow[] = useMemo(() => {
    if (!result?.applicationContext) {
      return [
        { label: "Status", value: "Awaiting solve", status: "neutral" },
        { label: "Material", value: material, status: "neutral" },
        { label: "Span", value: `${length} ${lengthUnit}`, status: "neutral" },
      ];
    }
    const ctx = result.applicationContext;
    const stressOk = (ctx.stressUtilization ?? 0) <= 1;
    const deflOk = (ctx.deflectionUtilization ?? 0) <= 1;
    return [
      {
        label: "Stress utilization",
        value: `${((ctx.stressUtilization ?? 0) * 100).toFixed(1)}%`,
        status: stressOk ? "ok" : "fail",
      },
      {
        label: "Deflection utilization",
        value: `${((ctx.deflectionUtilization ?? 0) * 100).toFixed(1)}%`,
        status: deflOk ? "ok" : "fail",
      },
      {
        label: "Max moment",
        value: `${result.maxMoment.toPrecision(4)} ${momentUnit}`,
        status: "neutral",
      },
      {
        label: "Material",
        value: material,
        status: "neutral",
      },
    ];
  }, [result, material, length, lengthUnit, momentUnit]);

  const explainBullets = useMemo(() => {
    if (!result?.applicationContext) return [];
    const ctx = result.applicationContext;
    const bullets = [
      `Governing application: ${ctx.label}.`,
      `Deflection limit ratio L/${ctx.deflectionLimitRatio} (${applicationPreset.id}).`,
      `Material ${material}: Fy ≈ ${Math.round((selectedMaterial.yieldStress ?? 0) / 1e6)} MPa.`,
    ];
    if (teachMode === "professional" && result.calculationSpec?.standards?.length) {
      bullets.push(
        `Standards: ${result.calculationSpec.standards.map((s) => s.document).join(", ")}`
      );
    }
    return bullets;
  }, [result, material, selectedMaterial, applicationPreset, teachMode]);

  const applyMaterial = (m: Material) => {
    setMaterial(m.name);
  };

  const applyAiParams = (payload: {
    params: CopilotParams;
    startModuleId: string | null;
    explanation: string;
    source: "llm" | "deterministic";
  }) => {
    const p = payload.params;
    if (p.length != null && p.length > 0.05) {
      setLength(fromBase(p.length, "length", lengthUnit));
    }
    if (p.mass != null) {
      const forceN = p.mass * 9.80665;
      setForce(fromBase(forceN, "force", forceUnit));
      setLoads((prev) => {
        const point = prev.find((l) => l.type === "point");
        if (!point || point.type !== "point") {
          return [
            {
              id: getNewLoadId(),
              type: "point" as const,
              value: fromBase(forceN, "force", forceUnit),
              position: length / 2,
            },
            ...prev,
          ];
        }
        return prev.map((l) =>
          l.id === point.id && l.type === "point"
            ? { ...l, value: fromBase(forceN, "force", forceUnit) }
            : l
        );
      });
    } else if (p.force != null) {
      setForce(fromBase(p.force, "force", forceUnit));
    }
  };

  const downloadText = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const workspaceContract = useMemo(
    () =>
      buildBeamWorkspaceContract({
        calculationSpec: result?.calculationSpec,
        materialBindings: { materialName: material, boundFields: ["E", "yieldStress"] },
        aiContext: {
          moduleId: "beams",
          briefHint: `Steel beam span ${length} ${lengthUnit}`,
          knownParams: { length: toBase(length, "length", lengthUnit) },
        },
      }),
    [result?.calculationSpec, material, length, lengthUnit]
  );

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
    setRevisions(
      appendRevision(
        "beam",
        projectName,
        "Saved project",
        hashInputs({ length, force, loads, material, support }),
        engineerName || undefined
      )
    );
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
  const calculator = (
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
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={livePreview}
              onChange={(e) => setLivePreview(e.target.checked)}
            />
            Live preview (deferred solve)
          </label>
          <input
            type="text"
            value={engineerName}
            onChange={(e) => setEngineerName(e.target.value)}
            placeholder="Engineer (for reports)"
            className="w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
          />
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
          <CalculatorDesignSummary rows={summaryRows} committed={Boolean(result)} />
          <ExplainDesignCard bullets={explainBullets} />
        </div>
      }
      results={
        <BeamResults
          key={result ? `${result.maxMoment}-${result.maxDeflection}` : "empty"}
          result={result}
          length={length}
          support={support}
          loads={loads}
          onLoadDrag={handleLoadDrag}
          supportPositions={supportPositions}
          onSupportDrag={handleSupportDrag}
          applicationContext={result?.applicationContext}
          workflowMode={mode}
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

  return (
    <WorkspaceChrome
      contract={workspaceContract}
      calculator={calculator}
      banner={
        <p className="text-xs text-slate-500">
          Beam Design Workspace — calculator, knowledge, materials, 3D model, report, and AI in one place.
        </p>
      }
      tabs={{
        knowledge: <CalculatorKnowledgePanel knowledgeSlug="beams" />,
        materials: (
          <WorkspaceMaterialsPanel selectedName={material} onApply={applyMaterial} />
        ),
        model: (
          <div className="space-y-3">
            <EngineeringScene
              length={Math.max(toBase(length, "length", lengthUnit), 0.5)}
              deflection={result?.deflection}
              mode="beam"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                onClick={() =>
                  downloadText(
                    "beam-schematic.svg",
                    exportDiagramSvgString({
                      length: toBase(length, "length", lengthUnit),
                      labels: [
                        `Support: ${support}`,
                        `Material: ${material}`,
                        `Max δ: ${result?.maxDeflection ?? "—"} ${lengthUnit}`,
                      ],
                    }),
                    "image/svg+xml"
                  )
                }
              >
                Export SVG
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                onClick={() =>
                  downloadText(
                    "beam-schematic.dxf",
                    exportDiagramDxf({
                      length: toBase(length, "length", lengthUnit),
                      title: `PhyCalcPro beam ${projectName}`,
                    }),
                    "application/dxf"
                  )
                }
              >
                Export DXF
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                onClick={() =>
                  downloadText(
                    "beam-scene.json",
                    exportSceneManifest({
                      moduleId: "beams",
                      length: toBase(length, "length", lengthUnit),
                      deflection: result?.deflection,
                    }),
                    "application/json"
                  )
                }
              >
                Export scene manifest
              </button>
            </div>
          </div>
        ),
        report: (
          <WorkspaceReportPanel
            projectName={projectName}
            engineer={engineerName}
            summaryRows={summaryRows}
            revisions={revisions}
            onSaveRevision={(note) =>
              setRevisions(
                appendRevision(
                  "beam",
                  projectName,
                  note,
                  hashInputs({ length, loads, material, support }),
                  engineerName || undefined
                )
              )
            }
            onExportPackage={() => {
              // Trigger existing results export affordance — user also has Export on results shell
              window.dispatchEvent(new CustomEvent("phycalcpro:export-report", { detail: { moduleId: "beams" } }));
              calculate();
            }}
          />
        ),
        ai: (
          <WorkspaceAiPanel
            moduleId="beams"
            defaultBrief={`Design a steel beam spanning ${length} ${lengthUnit}.`}
            onApply={applyAiParams}
          />
        ),
        teach: (
          <WorkspaceTeachPanel
            prompts={BEAM_TEACH_PROMPTS}
            mode={teachMode}
            onModeChange={setTeachMode}
          />
        ),
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BeamsPageContent />
    </Suspense>
  );
}
