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
import type { DrawingPackage, ManualStackPick } from "@/lib/manufacturing/package";
import { buildAssemblyTree, buildStackFromManualPicks } from "@/lib/manufacturing/package";
import { rasterizePdfInBrowser } from "@/lib/manufacturing/gdt/rasterizePdfClient";
import type { ToleranceProjectData } from "@/lib/manufacturing/toleranceProject";
import type { LocalProject } from "@/lib/localProjects";
import { canPersistAcrossSessions } from "@/lib/persistence/clientStorage";

type InputMode = "simple" | "gdt" | "package";

async function extractPdfBytes(
  bytes: Uint8Array,
  fileName: string
): Promise<{ extract: DrawingExtract; warnings: string[]; source: string }> {
  const file = new File([bytes], fileName, { type: "application/pdf" });
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

  const [pkg, setPkg] = useState<DrawingPackage | null>(null);
  const [selectedPn, setSelectedPn] = useState<string | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [extractsByPart, setExtractsByPart] = useState<Record<string, DrawingExtract>>({});
  const [extractStatus, setExtractStatus] = useState<
    Record<string, "pending" | "done" | "error" | "idle">
  >({});
  const [manualPicks, setManualPicks] = useState<ManualStackPick[]>([]);
  const [chainConfirmed, setChainConfirmed] = useState(false);
  const [extractBusy, setExtractBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const mapGdtResult = useCallback(
    (raw: ReturnType<typeof solveGdtStackEngine>) => {
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
      if (!chainConfirmed || manualPicks.length === 0) return;
      const config = buildStackFromManualPicks(manualPicks, extractsByPart, {
        monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
      });
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
    for (const row of pkg.bomRows) {
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
    return {
      version: 1,
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
      chainConfirmed,
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
    manualPicks,
    chainConfirmed,
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
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setInputMode(project.inputMode ?? "package");
    setToleranceUnit(project.toleranceUnit ?? "mm");
    setMonteCarloSamples(project.monteCarloSamples ?? 1000);
    setTolerances(project.tolerances ?? [0.05, 0.02, 0.01]);
    setTolerancesY(project.tolerancesY ?? []);
    setTolerancesZ(project.tolerancesZ ?? []);
    setExtract(project.extract ?? null);
    setGdtConfig(project.gdtConfig ?? null);
    setExtractsByPart(project.extractsByPart ?? {});
    setManualPicks(project.manualPicks ?? []);
    setChainConfirmed(Boolean(project.chainConfirmed));
    setSelectedPn(project.selectedPn ?? null);
    setSelectedDrawing(project.selectedDrawing ?? null);
    setGdtBreakdown(project.gdtBreakdown);
    setExtractWarnings([]);

    const status: Record<string, "pending" | "done" | "error" | "idle"> = {};
    for (const pn of Object.keys(project.extractsByPart ?? {})) {
      status[pn] = "done";
    }
    setExtractStatus(status);

    if (project.bomRows?.length) {
      const tree = project.tree?.length ? project.tree : buildAssemblyTree(project.bomRows);
      const drawings = project.bomRows.map((row) => ({
        fileName: row.drawingFile,
        path: row.drawingFile,
        bytes: new Uint8Array(),
      }));
      setPkg({
        bomRows: project.bomRows,
        tree,
        drawings,
        issues: [
          ...(project.packageIssues ?? []),
          {
            severity: "warning",
            code: "pdf_not_persisted",
            message:
              "PDF files are not stored with the study. Extracts and stack chain were restored — re-upload the ZIP only if you need to re-extract drawings.",
          },
        ],
        hasBom: project.hasBom,
      });
    } else {
      setPkg(null);
    }

    if (project.resultSnapshot) {
      setResult(wrapResult(project.resultSnapshot));
    } else {
      setResult(null);
    }

    // Re-solve from restored chain so results match current solver
    if (
      (project.inputMode === "package" || project.inputMode === "gdt") &&
      project.manualPicks?.length &&
      project.chainConfirmed
    ) {
      const config = buildStackFromManualPicks(
        project.manualPicks,
        project.extractsByPart ?? {},
        { monteCarloSamples: project.monteCarloSamples ?? 0 }
      );
      const raw = solveGdtStackEngine({
        ...config,
        monteCarloSamples: (project.monteCarloSamples ?? 0) > 0 ? project.monteCarloSamples : 0,
      });
      setGdtConfig(config);
      mapGdtResult(raw);
    } else if (project.gdtConfig) {
      runGdt(project.gdtConfig);
    }

    setSaveMessage(`Loaded “${project.name}”. Edit and Save to update.`);
  };

  return (
    <CalculatorLayout
      moduleId="tolerance"
      title="Tolerance Stackup Calculator"
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
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
            <label className="block space-y-1 text-sm text-slate-600">
              Study name
              <input
                className={calculatorTextInputClass}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Gearbox endplay Rev C"
              />
            </label>
            <button
              type="button"
              className={calculatorPrimaryButtonClass}
              disabled={saving || !projectName.trim()}
              onClick={handleSave}
            >
              {saving ? "Saving…" : activeProjectId ? "Update study" : "Save study"}
            </button>
            <p className="text-[11px] text-slate-500">
              Saves inputs, extracts, confirmed chain, and results. PDF binaries are not stored.
              {canPersistAcrossSessions()
                ? " Signed in — studies persist in your account storage."
                : " Sign in to keep studies across sessions."}
            </p>
            {saveMessage ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">{saveMessage}</p>
            ) : null}
          </div>

          <label className="block space-y-1 text-sm text-slate-600">
            Input mode
            <select
              className={calculatorSelectClass}
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value as InputMode)}
            >
              <option value="package">Drawing package (BOM + PDF/ZIP)</option>
              <option value="simple">Simple (bilateral)</option>
              <option value="gdt">GD&T (single drawing assist)</option>
            </select>
          </label>

          {inputMode === "package" ? (
            <>
              <PackageUploadPanel
                onPackage={(next) => {
                  setPkg(next);
                  setExtractsByPart({});
                  setExtractStatus({});
                  setManualPicks([]);
                  setChainConfirmed(false);
                  setSelectedPn(next.tree[0]?.partNumber ?? null);
                  setSelectedDrawing(next.tree[0]?.drawingFile ?? null);
                  setExtract(null);
                }}
              />
              {pkg ? (
                <>
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
                      {extractBusy ? "Extracting…" : "Extract selected drawing"}
                    </button>
                    <button
                      type="button"
                      className={calculatorSecondaryButtonClass}
                      disabled={extractBusy || !pkg.hasBom}
                      onClick={() => void extractAllDrawings()}
                    >
                      Extract all (BOM)
                    </button>
                  </div>
                  {extractWarnings.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4 text-xs text-amber-700">
                      {extractWarnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                  {selectedExtract?.metadata ? (
                    <p className="text-xs text-slate-500">
                      {[
                        selectedExtract.metadata.drawingNumber,
                        selectedExtract.metadata.revision
                          ? `Rev ${selectedExtract.metadata.revision}`
                          : null,
                        selectedExtract.metadata.title,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <ManualStackBuilder
                    partNumber={selectedPn}
                    drawingFile={selectedDrawing}
                    extract={selectedExtract}
                    picks={manualPicks}
                    displayUnit={toleranceUnit}
                    chainConfirmed={chainConfirmed}
                    onPicksChange={setManualPicks}
                    onConfirmChange={setChainConfirmed}
                    onSolve={calculate}
                  />
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
                </>
              ) : null}
            </>
          ) : null}

          {inputMode === "gdt" || inputMode === "simple" ? (
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
          ) : null}

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
                  : "Upload a PDF and apply the extract, or use Drawing package mode for BOM stacks."
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
