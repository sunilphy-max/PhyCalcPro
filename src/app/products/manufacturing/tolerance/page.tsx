"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ToleranceInputs from "@/components/manufacturing/ToleranceInputs";
import ToleranceResults from "@/components/manufacturing/ToleranceResults";
import DrawingUploadPanel from "@/components/manufacturing/drawing/DrawingUploadPanel";
import DrawingExtractReview from "@/components/manufacturing/drawing/DrawingExtractReview";
import DrawingApplyBar from "@/components/manufacturing/drawing/DrawingApplyBar";
import PackageUploadPanel from "@/components/manufacturing/drawing/PackageUploadPanel";
import BomTreeNavigator from "@/components/manufacturing/drawing/BomTreeNavigator";
import ManualStackBuilder from "@/components/manufacturing/drawing/ManualStackBuilder";
import AnnotationLibraryPanel from "@/components/manufacturing/drawing/AnnotationLibraryPanel";
import StackProgramBoard from "@/components/manufacturing/drawing/StackProgramBoard";
import ToleranceAssistPanel from "@/components/manufacturing/drawing/ToleranceAssistPanel";
import ToleranceWelcome from "@/components/manufacturing/drawing/ToleranceWelcome";
import ToleranceWorkflowSteps from "@/components/manufacturing/drawing/ToleranceWorkflowSteps";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import {
  calculatorNumberInputClass,
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveToleranceEngine } from "@/lib/manufacturing/engine";
import {
  drawingExtractToGdtStack,
  emptyDrawingExtract,
  solveGdtStackEngine,
} from "@/lib/manufacturing/gdt";
import type { ContributorBreakdown, DrawingExtract, GdtStackConfig } from "@/lib/manufacturing/gdt/types";
import type { ToleranceResult } from "@/lib/manufacturing/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type {
  AnnotationEntry,
  DrawingPackage,
  ManualStackPick,
  NamedStack,
  ProposedStack,
  StackLevel,
} from "@/lib/manufacturing/package";
import {
  applyContributorScales,
  buildAndSolveNamedStack,
  buildAssemblyTree,
  contributorPartNumbersForContext,
  createNamedStack,
  listPickCandidatesForParts,
  stackDashboardRows,
} from "@/lib/manufacturing/package";
import { rasterizePdfInBrowser } from "@/lib/manufacturing/gdt/rasterizePdfClient";
import {
  normalizeToleranceProject,
  type ToleranceProjectData,
} from "@/lib/manufacturing/toleranceProject";
import type { LocalProject } from "@/lib/localProjects";
import { canPersistAcrossSessions } from "@/lib/persistence/clientStorage";

type InputMode = "simple" | "gdt" | "package";

async function extractPdfBytes(
  bytes: Uint8Array,
  fileName: string
): Promise<{ extract: DrawingExtract; warnings: string[]; source: string }> {
  const part = new Uint8Array(bytes.byteLength);
  part.set(bytes);
  const file = new File([part], fileName, { type: "application/pdf" });
  const raster = await rasterizePdfInBrowser(file);
  const form = new FormData();
  form.set("file", file);
  form.set("target", "tolerance");
  if (raster.pages.length > 0) {
    form.set("pageImages", JSON.stringify(raster.pages.map((p) => p.dataUrl)));
  }
  const res = await fetch("/api/manufacturing/parse-drawing", { method: "POST", body: form });
  const data = (await res.json()) as {
    extract?: DrawingExtract;
    warnings?: string[];
    source?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Extract failed (${res.status})`);
  }
  return {
    extract: data.extract ?? emptyDrawingExtract(),
    warnings: [...(raster.warnings ?? []), ...(data.warnings ?? [])],
    source: data.source ?? "unavailable",
  };
}

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("tolerance");
  const {
    projectName,
    setProjectName,
    activeProjectId,
    setActiveProjectId,
    saving,
    savedProjects,
    saveProject,
  } = useSavedProjects<ToleranceProjectData>("tolerance", "Tolerance stack study");
  const [toleranceUnit, setToleranceUnit] = useState("mm");
  const [tolerances, setTolerances] = useState([0.05, 0.02, 0.01]);
  const [tolerancesY, setTolerancesY] = useState<number[]>([]);
  const [tolerancesZ, setTolerancesZ] = useState<number[]>([]);
  const [monteCarloSamples, setMonteCarloSamples] = useState(1000);
  const [result, setResult] = useState<WithCalculationSpec<ToleranceResult> | null>(null);
  const [gdtBreakdown, setGdtBreakdown] = useState<ContributorBreakdown[] | undefined>();
  const [inputMode, setInputMode] = useState<InputMode>("package");
  const [extract, setExtract] = useState<DrawingExtract | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);
  const [gdtConfig, setGdtConfig] = useState<GdtStackConfig | null>(null);
  const [lastGdtResult, setLastGdtResult] = useState<
    ReturnType<typeof solveGdtStackEngine> | null
  >(null);

  const [pkg, setPkg] = useState<DrawingPackage | null>(null);
  const [selectedPn, setSelectedPn] = useState<string | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [extractsByPart, setExtractsByPart] = useState<Record<string, DrawingExtract>>({});
  const [extractStatus, setExtractStatus] = useState<
    Record<string, "pending" | "done" | "error" | "idle">
  >({});
  const [stacks, setStacks] = useState<NamedStack[]>([]);
  const [activeStackId, setActiveStackId] = useState<string | null>(null);
  const [extractBusy, setExtractBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [workspacePanel, setWorkspacePanel] = useState<"structure" | "build" | "assist">(
    "structure"
  );

  const activeStack = useMemo(
    () => stacks.find((s) => s.id === activeStackId) ?? null,
    [stacks, activeStackId]
  );

  const dashboard = useMemo(() => stackDashboardRows(stacks), [stacks]);

  const drawingFileByPn = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of pkg?.bomRows ?? []) {
      map[row.partNumber] = row.drawingFile;
    }
    return map;
  }, [pkg]);

  const allowedPartNumbers = useMemo(() => {
    if (!pkg || !activeStack) return null;
    return contributorPartNumbersForContext(pkg.tree, activeStack.contextPartNumber);
  }, [pkg, activeStack]);

  const stackCandidates = useMemo(() => {
    if (!allowedPartNumbers) return [];
    return listPickCandidatesForParts(allowedPartNumbers, extractsByPart, drawingFileByPn);
  }, [allowedPartNumbers, extractsByPart, drawingFileByPn]);

  const patchActiveStack = useCallback((patch: Partial<NamedStack>) => {
    setActiveStackId((id) => {
      if (!id) return id;
      setStacks((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                status:
                  patch.picks || patch.chainConfirmed === false
                    ? "draft"
                    : patch.status ?? s.status,
              }
            : s
        )
      );
      return id;
    });
  }, []);

  const mapGdtResult = useCallback(
    (raw: ReturnType<typeof solveGdtStackEngine>) => {
      setLastGdtResult(raw);
      const mappedBreakdown = raw.contributors.map((row) => ({
        ...row,
        specifiedTolerance: fromBase(row.specifiedTolerance, "length", toleranceUnit),
        bonus: fromBase(row.bonus, "length", toleranceUnit),
        effectiveTolerance: fromBase(row.effectiveTolerance, "length", toleranceUnit),
      }));
      setGdtBreakdown(mappedBreakdown);
      setResult(
        wrapResult({
          tolerances: mappedBreakdown.map((r) => r.effectiveTolerance),
          count: raw.count,
          worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
          rss: fromBase(raw.rss, "length", toleranceUnit),
          totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
          worstCaseY:
            raw.worstCaseY !== undefined
              ? fromBase(raw.worstCaseY, "length", toleranceUnit)
              : undefined,
          rssY: raw.rssY !== undefined ? fromBase(raw.rssY, "length", toleranceUnit) : undefined,
          worstCaseZ:
            raw.worstCaseZ !== undefined
              ? fromBase(raw.worstCaseZ, "length", toleranceUnit)
              : undefined,
          rssZ: raw.rssZ !== undefined ? fromBase(raw.rssZ, "length", toleranceUnit) : undefined,
          worstCase3d:
            raw.worstCase3d !== undefined
              ? fromBase(raw.worstCase3d, "length", toleranceUnit)
              : undefined,
          rss3d: raw.rss3d !== undefined ? fromBase(raw.rss3d, "length", toleranceUnit) : undefined,
          monteCarloMean:
            raw.monteCarloMean !== undefined
              ? fromBase(raw.monteCarloMean, "length", toleranceUnit)
              : undefined,
          monteCarloStdDev:
            raw.monteCarloStdDev !== undefined
              ? fromBase(raw.monteCarloStdDev, "length", toleranceUnit)
              : undefined,
          monteCarloPercentile95:
            raw.monteCarloPercentile95 !== undefined
              ? fromBase(raw.monteCarloPercentile95, "length", toleranceUnit)
              : undefined,
          monteCarloYield: raw.monteCarloYield,
        })
      );
    },
    [toleranceUnit, wrapResult]
  );

  const mapResultFromSimple = useCallback(
    (raw: ToleranceResult) =>
      wrapResult({
        ...raw,
        tolerances: raw.tolerances.map((value) => fromBase(value, "length", toleranceUnit)),
        worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
        rss: fromBase(raw.rss, "length", toleranceUnit),
        totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
        worstCaseY:
          raw.worstCaseY !== undefined ? fromBase(raw.worstCaseY, "length", toleranceUnit) : undefined,
        rssY: raw.rssY !== undefined ? fromBase(raw.rssY, "length", toleranceUnit) : undefined,
        worstCaseZ:
          raw.worstCaseZ !== undefined ? fromBase(raw.worstCaseZ, "length", toleranceUnit) : undefined,
        rssZ: raw.rssZ !== undefined ? fromBase(raw.rssZ, "length", toleranceUnit) : undefined,
        worstCase3d:
          raw.worstCase3d !== undefined
            ? fromBase(raw.worstCase3d, "length", toleranceUnit)
            : undefined,
        rss3d: raw.rss3d !== undefined ? fromBase(raw.rss3d, "length", toleranceUnit) : undefined,
        monteCarloMean:
          raw.monteCarloMean !== undefined
            ? fromBase(raw.monteCarloMean, "length", toleranceUnit)
            : undefined,
        monteCarloStdDev:
          raw.monteCarloStdDev !== undefined
            ? fromBase(raw.monteCarloStdDev, "length", toleranceUnit)
            : undefined,
      }),
    [toleranceUnit, wrapResult]
  );

  const runSimple = () => {
    const config = {
      tolerances: tolerances.map((value) => toBase(value, "length", toleranceUnit)),
      ...(tolerancesY.length
        ? { tolerancesY: tolerancesY.map((value) => toBase(value, "length", toleranceUnit)) }
        : {}),
      ...(tolerancesZ.length
        ? { tolerancesZ: tolerancesZ.map((value) => toBase(value, "length", toleranceUnit)) }
        : {}),
      ...(monteCarloSamples > 0 ? { monteCarloSamples } : {}),
    };
    const raw = solveToleranceEngine(config);
    setGdtBreakdown(undefined);
    setLastGdtResult(null);
    setResult(mapResultFromSimple(raw));
  };

  const runGdt = (config: GdtStackConfig) => {
    const raw = solveGdtStackEngine({
      ...config,
      monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
    });
    setGdtConfig(config);
    mapGdtResult(raw);
  };

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      minGap: tolerances[0] ?? 0.05,
      nominalGap: tolerances[1] ?? 0.02,
    }),
    [tolerances]
  );

  useSyncDesignInputs("tolerance", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    minGap: (v) => {
      const n = typeof v === "number" ? v : Number(v);
      setTolerances((prev) => [n, ...prev.slice(1)]);
    },
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (inputMode === "package") {
      if (!activeStack || !activeStack.chainConfirmed || activeStack.picks.length === 0) return;
      const { config, result: raw, status } = buildAndSolveNamedStack(
        activeStack,
        extractsByPart,
        {
          monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
          allStacks: stacks,
        }
      );
      setStacks((prev) =>
        prev.map((s) =>
          s.id === activeStack.id
            ? { ...s, status, resultSnapshot: raw, chainConfirmed: true }
            : s
        )
      );
      runGdt(config);
      return;
    }
    if (inputMode === "gdt" && gdtConfig) {
      runGdt(gdtConfig);
      return;
    }
    if (workflowMode === "design") {
      const design = runModuleDesignMode("tolerance", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runSimple();
  };

  const applyExtract = () => {
    if (!extract) return;
    const config = drawingExtractToGdtStack(extract, {
      monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
    });
    setGdtConfig(config);
    setInputMode("gdt");
    const halfTols = extract.dimensions.map((d) =>
      fromBase(
        Math.max(Math.abs(d.upperDeviation), Math.abs(d.lowerDeviation)),
        "length",
        toleranceUnit
      )
    );
    if (halfTols.length) setTolerances(halfTols);
    runGdt(config);
  };

  const extractSelectedDrawing = async () => {
    if (!pkg || !selectedPn || !selectedDrawing) return;
    const entry = pkg.drawings.find(
      (d) => d.fileName.toLowerCase() === selectedDrawing.toLowerCase()
    );
    if (!entry) return;
    if (entry.bytes.byteLength === 0) {
      setExtractWarnings([
        "PDF binary is not in this saved study. Re-upload the drawing package ZIP to extract again, or use the restored extract if present.",
      ]);
      return;
    }
    setExtractBusy(true);
    setExtractStatus((s) => ({ ...s, [selectedPn]: "pending" }));
    try {
      const { extract: next, warnings } = await extractPdfBytes(entry.bytes, entry.fileName);
      setExtractsByPart((prev) => ({ ...prev, [selectedPn]: next }));
      setExtract(next);
      setExtractWarnings(warnings);
      setExtractStatus((s) => ({ ...s, [selectedPn]: "done" }));
    } catch (err) {
      setExtractStatus((s) => ({ ...s, [selectedPn]: "error" }));
      setExtractWarnings([err instanceof Error ? err.message : "Extract failed"]);
    } finally {
      setExtractBusy(false);
    }
  };

  const extractAllDrawings = async () => {
    if (!pkg) return;
    const hasBytes = pkg.drawings.some((d) => d.bytes.byteLength > 0);
    if (!hasBytes) {
      setExtractWarnings([
        "PDF binaries are not stored with saved studies. Re-upload the ZIP to run extract-all.",
      ]);
      return;
    }
    setExtractBusy(true);
    // Components first, then SA / assembly / top (hierarchical stack rule)
    const ordered = [...pkg.bomRows].sort((a, b) => {
      const rank = (level: number) => (level >= 2 ? 0 : level === 1 ? 1 : 2);
      return rank(a.level) - rank(b.level);
    });
    for (const row of ordered) {
      const entry = pkg.drawings.find(
        (d) => d.fileName.toLowerCase() === row.drawingFile.toLowerCase()
      );
      if (!entry || entry.bytes.byteLength === 0) continue;
      setExtractStatus((s) => ({ ...s, [row.partNumber]: "pending" }));
      try {
        const { extract: next } = await extractPdfBytes(entry.bytes, entry.fileName);
        setExtractsByPart((prev) => ({ ...prev, [row.partNumber]: next }));
        setExtractStatus((s) => ({ ...s, [row.partNumber]: "done" }));
      } catch {
        setExtractStatus((s) => ({ ...s, [row.partNumber]: "error" }));
      }
    }
    setExtractBusy(false);
  };

  const selectedExtract =
    selectedPn && extractsByPart[selectedPn] ? extractsByPart[selectedPn]! : null;

  const buildSavePayload = useCallback((): ToleranceProjectData => {
    const manualPicks: ManualStackPick[] = activeStack?.picks ?? [];
    return {
      version: 2,
      inputMode,
      toleranceUnit,
      monteCarloSamples,
      tolerances,
      tolerancesY,
      tolerancesZ,
      extract,
      gdtConfig,
      bomRows: pkg?.bomRows ?? [],
      tree: pkg?.tree ?? [],
      hasBom: pkg?.hasBom ?? false,
      packageIssues: pkg?.issues ?? [],
      extractsByPart,
      selectedPn,
      selectedDrawing,
      manualPicks,
      chainConfirmed: activeStack?.chainConfirmed ?? false,
      stacks,
      activeStackId,
      resultSnapshot: result
        ? {
            tolerances: result.tolerances,
            count: result.count,
            worstCase: result.worstCase,
            rss: result.rss,
            totalTolerance: result.totalTolerance,
            worstCaseY: result.worstCaseY,
            rssY: result.rssY,
            worstCaseZ: result.worstCaseZ,
            rssZ: result.rssZ,
            worstCase3d: result.worstCase3d,
            rss3d: result.rss3d,
            monteCarloMean: result.monteCarloMean,
            monteCarloStdDev: result.monteCarloStdDev,
            monteCarloPercentile95: result.monteCarloPercentile95,
            monteCarloYield: result.monteCarloYield,
          }
        : null,
      gdtBreakdown,
    };
  }, [
    inputMode,
    toleranceUnit,
    monteCarloSamples,
    tolerances,
    tolerancesY,
    tolerancesZ,
    extract,
    gdtConfig,
    pkg,
    extractsByPart,
    selectedPn,
    selectedDrawing,
    stacks,
    activeStackId,
    activeStack,
    result,
    gdtBreakdown,
  ]);

  const handleSave = () => {
    saveProject(buildSavePayload());
    const persisted = canPersistAcrossSessions();
    setSaveMessage(
      persisted
        ? activeProjectId
          ? "Study updated in your account."
          : "Study saved to your account."
        : "Study saved for this browser session. Sign in to keep it across devices/sessions."
    );
  };

  const loadProject = (project: LocalProject<ToleranceProjectData>) => {
    const data = normalizeToleranceProject(project);
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setInputMode(data.inputMode ?? "package");
    setToleranceUnit(data.toleranceUnit ?? "mm");
    setMonteCarloSamples(data.monteCarloSamples ?? 1000);
    setTolerances(data.tolerances ?? [0.05, 0.02, 0.01]);
    setTolerancesY(data.tolerancesY ?? []);
    setTolerancesZ(data.tolerancesZ ?? []);
    setExtract(data.extract ?? null);
    setGdtConfig(data.gdtConfig ?? null);
    setExtractsByPart(data.extractsByPart ?? {});
    setStacks(data.stacks ?? []);
    setActiveStackId(data.activeStackId ?? data.stacks?.[0]?.id ?? null);
    setSelectedPn(data.selectedPn ?? null);
    setSelectedDrawing(data.selectedDrawing ?? null);
    setGdtBreakdown(data.gdtBreakdown);
    setExtractWarnings([]);

    const status: Record<string, "pending" | "done" | "error" | "idle"> = {};
    for (const pn of Object.keys(data.extractsByPart ?? {})) {
      status[pn] = "done";
    }
    setExtractStatus(status);

    if (data.bomRows?.length) {
      const tree = data.tree?.length ? data.tree : buildAssemblyTree(data.bomRows);
      const drawings = data.bomRows.map((row) => ({
        fileName: row.drawingFile,
        path: row.drawingFile,
        bytes: new Uint8Array(),
      }));
      setPkg({
        bomRows: data.bomRows,
        tree,
        drawings,
        issues: [
          ...(data.packageIssues ?? []),
          {
            severity: "warning",
            code: "pdf_not_persisted",
            message:
              "PDF files are not stored with the study. Extracts and stack chains were restored — re-upload the ZIP only if you need to re-extract drawings.",
          },
        ],
        hasBom: data.hasBom,
      });
    } else {
      setPkg(null);
    }

    if (data.resultSnapshot) {
      setResult(wrapResult(data.resultSnapshot));
    } else {
      setResult(null);
    }

    const stackToSolve =
      (data.activeStackId && data.stacks?.find((s) => s.id === data.activeStackId)) ||
      data.stacks?.find((s) => s.chainConfirmed && s.picks.length > 0);

    if (stackToSolve?.chainConfirmed && stackToSolve.picks.length) {
      const { config, result: raw, status: st } = buildAndSolveNamedStack(
        stackToSolve,
        data.extractsByPart ?? {},
        {
          monteCarloSamples: data.monteCarloSamples ?? 0,
          allStacks: data.stacks,
        }
      );
      setStacks((prev) =>
        prev.map((s) =>
          s.id === stackToSolve.id ? { ...s, status: st, resultSnapshot: raw } : s
        )
      );
      setGdtConfig(config);
      mapGdtResult(raw);
    } else if (data.gdtConfig) {
      runGdt(data.gdtConfig);
    }

    setSaveMessage(`Loaded “${project.name}”. Edit and Save to update.`);
    setWorkspacePanel(stackToSolve?.picks.length ? "build" : "structure");
  };

  const packageReady = Boolean(pkg);
  const showWelcome = inputMode === "package" && !packageReady;
  const hasConfirmedStack = stacks.some((s) => s.chainConfirmed && s.picks.length > 0);
  const workflowActive: "upload" | "structure" | "build" | "results" = !packageReady
    ? "upload"
    : result
      ? "results"
      : workspacePanel === "build" || workspacePanel === "assist" || hasConfirmedStack
        ? "build"
        : "structure";

  const onPackageLoaded = (next: DrawingPackage) => {
    setPkg(next);
    setExtractsByPart({});
    setExtractStatus({});
    setStacks([]);
    setActiveStackId(null);
    setSelectedPn(next.tree[0]?.partNumber ?? null);
    setSelectedDrawing(next.tree[0]?.drawingFile ?? null);
    setExtract(null);
    setResult(null);
    setGdtBreakdown(undefined);
    setLastGdtResult(null);
    setWorkspacePanel("structure");
    setInputMode("package");
  };

  const createStack = (name: string, level: StackLevel) => {
    if (!pkg || !selectedPn) return;
    const stack = createNamedStack({
      name,
      contextPartNumber: selectedPn,
      tree: pkg.tree,
      level,
    });
    setStacks((prev) => [...prev, stack]);
    setActiveStackId(stack.id);
    setWorkspacePanel("build");
  };

  const acceptProposal = (proposal: ProposedStack) => {
    if (!pkg) return;
    const stack = createNamedStack({
      name: proposal.name,
      contextPartNumber: proposal.contextPartNumber,
      tree: pkg.tree,
      level: proposal.level,
    });
    stack.picks = proposal.suggestedPicks;
    stack.notes = proposal.reason;
    setStacks((prev) => [...prev, stack]);
    setActiveStackId(stack.id);
    setSelectedPn(proposal.contextPartNumber);
    setWorkspacePanel("build");
  };

  const addAnnotationToStack = (entry: AnnotationEntry) => {
    if (!activeStack) return;
    if (entry.kind !== "dimension" && entry.kind !== "fcf") return;
    const pick: ManualStackPick = {
      candidateKey: entry.key,
      partNumber: entry.partNumber,
      sense: 1,
      axis: "X",
    };
    patchActiveStack({
      picks: [...activeStack.picks, pick],
      chainConfirmed: false,
      status: "draft",
    });
  };

  const applyAllocation = (scales: Record<string, number>) => {
    if (!gdtConfig) return;
    const next = applyContributorScales(gdtConfig, scales);
    runGdt(next);
  };

  return (
    <CalculatorLayout
      moduleId="tolerance"
      title="Tolerance Stackup Calculator"
      hasResults={Boolean(result)}
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProject(project as LocalProject<ToleranceProjectData>)}
          title="Saved tolerance studies"
          emptyMessage="No saved studies yet. Enter a name and click Save study."
        />
      }
      inputs={
        <div className="space-y-4">
          {showWelcome ? (
            <ToleranceWelcome
              projectName={projectName}
              setProjectName={setProjectName}
              savedCount={savedProjects.length}
              onPackage={onPackageLoaded}
              onChooseSimple={() => setInputMode("simple")}
              onShowSaved={() => {
                document
                  .querySelector("[data-tolerance-saved]")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          ) : null}

          {!showWelcome && inputMode === "package" && pkg ? (
            <>
              <ToleranceWorkflowSteps
                active={workflowActive}
                hasPackage={packageReady}
                hasChain={hasConfirmedStack}
                hasResults={Boolean(result)}
              />

              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[10rem] flex-1 space-y-1 text-sm text-slate-600">
                  Study name
                  <input
                    className={calculatorTextInputClass}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className={calculatorPrimaryButtonClass}
                  style={{ width: "auto" }}
                  disabled={saving || !projectName.trim()}
                  onClick={handleSave}
                >
                  {saving ? "Saving…" : activeProjectId ? "Update" : "Save"}
                </button>
                <PackageUploadPanel compact onPackage={onPackageLoaded} />
              </div>
              {saveMessage ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{saveMessage}</p>
              ) : null}

              <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(
                  [
                    ["structure", "Structure"],
                    ["build", "Build stacks"],
                    ["assist", "Assist"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      workspacePanel === id
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                    onClick={() => setWorkspacePanel(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {workspacePanel === "structure" ? (
                <div className="space-y-3">
                  <BomTreeNavigator
                    tree={pkg.tree}
                    selectedPartNumber={selectedPn}
                    issues={pkg.issues}
                    extractStatus={extractStatus}
                    onSelect={(pn, drawing) => {
                      setSelectedPn(pn);
                      setSelectedDrawing(drawing);
                      setExtract(extractsByPart[pn] ?? null);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={calculatorSecondaryButtonClass}
                      disabled={extractBusy || !selectedPn}
                      onClick={() => void extractSelectedDrawing()}
                    >
                      {extractBusy ? "Extracting…" : "Extract selected"}
                    </button>
                    <button
                      type="button"
                      className={calculatorSecondaryButtonClass}
                      disabled={extractBusy || !pkg.hasBom}
                      onClick={() => void extractAllDrawings()}
                    >
                      Extract all (components first)
                    </button>
                    <button
                      type="button"
                      className={calculatorPrimaryButtonClass}
                      style={{ width: "auto" }}
                      onClick={() => setWorkspacePanel("build")}
                    >
                      Continue to build stacks →
                    </button>
                  </div>
                  {extractWarnings.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4 text-xs text-amber-700">
                      {extractWarnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                  <AnnotationLibraryPanel
                    tree={pkg.tree}
                    extractsByPart={extractsByPart}
                    displayUnit={toleranceUnit}
                  />
                </div>
              ) : null}

              {workspacePanel === "build" ? (
                <div className="space-y-4">
                  <StackProgramBoard
                    stacks={stacks}
                    dashboard={dashboard}
                    activeStackId={activeStackId}
                    contextPartNumber={selectedPn}
                    displayUnit={toleranceUnit}
                    onSelect={setActiveStackId}
                    onCreate={createStack}
                    onUpdateActive={patchActiveStack}
                    onDeleteActive={() => {
                      if (!activeStackId) return;
                      setStacks((prev) => prev.filter((s) => s.id !== activeStackId));
                      setActiveStackId(null);
                    }}
                  />
                  <AnnotationLibraryPanel
                    tree={pkg.tree}
                    extractsByPart={extractsByPart}
                    displayUnit={toleranceUnit}
                    allowedPartNumbers={allowedPartNumbers}
                    onAddToStack={activeStack ? addAnnotationToStack : undefined}
                  />
                  <ManualStackBuilder
                    partNumber={selectedPn}
                    drawingFile={selectedDrawing}
                    extract={selectedExtract}
                    externalCandidates={stackCandidates}
                    picks={activeStack?.picks ?? []}
                    displayUnit={toleranceUnit}
                    chainConfirmed={activeStack?.chainConfirmed ?? false}
                    contextLabel={
                      activeStack
                        ? `${activeStack.name} (${activeStack.level} @ ${activeStack.contextPartNumber})`
                        : undefined
                    }
                    onPicksChange={(picks) =>
                      patchActiveStack({ picks, chainConfirmed: false, status: "draft" })
                    }
                    onConfirmChange={(confirmed) =>
                      patchActiveStack({
                        chainConfirmed: confirmed,
                        status: confirmed ? "confirmed" : "draft",
                      })
                    }
                    onSolve={calculate}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-xs text-slate-600">
                      Monte Carlo samples
                      <input
                        type="number"
                        min={0}
                        max={100000}
                        step={100}
                        value={monteCarloSamples}
                        onChange={(e) => setMonteCarloSamples(Number(e.target.value))}
                        className={calculatorNumberInputClass}
                      />
                    </label>
                    <UnitSelector
                      dimension="length"
                      value={toleranceUnit}
                      onChange={setToleranceUnit}
                      label="Units"
                    />
                  </div>
                </div>
              ) : null}

              {workspacePanel === "assist" ? (
                <ToleranceAssistPanel
                  studyName={projectName}
                  tree={pkg.tree}
                  bomRows={pkg.bomRows}
                  extractsByPart={extractsByPart}
                  stacks={stacks}
                  activeExtract={selectedExtract}
                  lastResult={lastGdtResult}
                  gdtConfig={gdtConfig}
                  displayUnit={toleranceUnit}
                  onAcceptProposal={acceptProposal}
                  onApplyAllocation={applyAllocation}
                />
              ) : null}

              <button
                type="button"
                className="text-xs text-slate-500 underline-offset-2 hover:underline"
                onClick={() => {
                  setPkg(null);
                  setResult(null);
                  setStacks([]);
                  setActiveStackId(null);
                  setInputMode("package");
                }}
              >
                Start over
              </button>
            </>
          ) : null}

          {inputMode === "simple" || inputMode === "gdt" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-xs text-cyan-700 hover:underline dark:text-cyan-400"
                  onClick={() => {
                    setInputMode("package");
                    setPkg(null);
                  }}
                >
                  ← Back to drawing package
                </button>
                <select
                  className={calculatorSelectClass}
                  value={inputMode}
                  onChange={(e) => setInputMode(e.target.value as InputMode)}
                >
                  <option value="simple">Simple (bilateral)</option>
                  <option value="gdt">GD&T (single drawing)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[10rem] flex-1 space-y-1 text-sm text-slate-600">
                  Study name
                  <input
                    className={calculatorTextInputClass}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className={calculatorPrimaryButtonClass}
                  style={{ width: "auto" }}
                  disabled={saving || !projectName.trim()}
                  onClick={handleSave}
                >
                  {saving ? "Saving…" : activeProjectId ? "Update" : "Save"}
                </button>
              </div>

              {(inputMode === "gdt" || inputMode === "simple") && (
                <>
                  <DrawingUploadPanel
                    target="tolerance"
                    onExtracted={(next, meta) => {
                      setExtract(next);
                      setExtractWarnings(meta.warnings);
                    }}
                  />
                  {extractWarnings.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4 text-xs text-amber-700">
                      {extractWarnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                  {extract ? (
                    <div className="space-y-3">
                      <DrawingExtractReview
                        extract={extract}
                        displayUnit={toleranceUnit}
                        mode="tolerance"
                        onChange={setExtract}
                      />
                      <DrawingApplyBar
                        onApply={applyExtract}
                        onClear={() => {
                          setExtract(null);
                          setExtractWarnings([]);
                          setGdtConfig(null);
                        }}
                        applyLabel="Apply GD&T stack"
                      />
                    </div>
                  ) : null}
                </>
              )}

              {inputMode === "simple" ? (
                <ToleranceInputs
                  tolerances={tolerances}
                  setTolerances={setTolerances}
                  tolerancesY={tolerancesY}
                  setTolerancesY={setTolerancesY}
                  tolerancesZ={tolerancesZ}
                  setTolerancesZ={setTolerancesZ}
                  toleranceUnit={toleranceUnit}
                  setToleranceUnit={setToleranceUnit}
                  monteCarloSamples={monteCarloSamples}
                  setMonteCarloSamples={setMonteCarloSamples}
                  onCalculate={calculate}
                />
              ) : null}

              {inputMode === "gdt" ? (
                <CalculatorInputPanel
                  title="GD&T stackup"
                  description={
                    gdtConfig
                      ? `${gdtConfig.contributors.length} contributors ready.`
                      : "Upload a PDF and apply the extract."
                  }
                  footer={
                    <CalculatorCalculateButton
                      onClick={calculate}
                      label="Compute GD&T stackup"
                      designAware
                    />
                  }
                >
                  <label className="block space-y-1 text-sm text-slate-600">
                    Monte Carlo samples (0 = skip)
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      step={100}
                      value={monteCarloSamples}
                      onChange={(e) => setMonteCarloSamples(Number(e.target.value))}
                      className={calculatorNumberInputClass}
                    />
                  </label>
                  <UnitSelector
                    dimension="length"
                    value={toleranceUnit}
                    onChange={setToleranceUnit}
                    label="Display units"
                  />
                </CalculatorInputPanel>
              ) : null}
            </div>
          ) : null}

          <div data-tolerance-saved />
        </div>
      }
      results={
        <ToleranceResults
          result={result}
          displayUnit={toleranceUnit}
          gdtBreakdown={gdtBreakdown}
        />
      }
    />
  );
}
