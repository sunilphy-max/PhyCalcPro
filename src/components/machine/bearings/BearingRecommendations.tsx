"use client";

import { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import type { BearingResult } from "@/lib/machine/bearings/types";
import type { CrossManufacturerRecommendation } from "@/lib/machine/bearings/catalogAlternatives";
import { costBandFromIndex } from "@/lib/machine/bearings/recommendationAdvisor";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { BEARING_MANUFACTURER_LABELS } from "@/data/catalogs/bearingCatalog";
import { sealLabelForOem } from "@/data/catalogs/bearing/manufacturerDesignations";
import type { BearingCompareRow } from "@/components/machine/bearings/BearingCompareTable";
import BearingInterchangeCard from "@/components/machine/bearings/BearingInterchangeCard";

type Props = {
  result: BearingResult;
  recommendation: CrossManufacturerRecommendation;
  compareRows?: BearingCompareRow[];
  onSelect?: (designation: string) => void;
};

function lifeSfFromResult(r: BearingResult): number | undefined {
  if (r.lifeSafetyFactor != null && r.lifeSafetyFactor > 0) return r.lifeSafetyFactor;
  if (r.lifeUtilization > 0 && Number.isFinite(r.lifeUtilization)) return 1 / r.lifeUtilization;
  return undefined;
}

function MetricsStrip({
  expectedLifeH,
  lifeSf,
  staticSf,
  costBand,
  costIndex,
}: {
  expectedLifeH?: number;
  lifeSf?: number;
  staticSf?: number;
  costBand?: string;
  costIndex?: number;
}) {
  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
      {expectedLifeH != null ? (
        <div>
          <dt className="text-[10px] uppercase text-slate-400">Expected life Lnm</dt>
          <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
            {formatDisplayNumber(expectedLifeH)} h
          </dd>
        </div>
      ) : null}
      {lifeSf != null ? (
        <div>
          <dt className="text-[10px] uppercase text-slate-400">Safety factor</dt>
          <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
            {formatDisplayNumber(lifeSf)}
          </dd>
        </div>
      ) : null}
      {staticSf != null ? (
        <div>
          <dt className="text-[10px] uppercase text-slate-400">Static s₀</dt>
          <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
            {formatDisplayNumber(staticSf)}
          </dd>
        </div>
      ) : null}
      {costBand != null ? (
        <div>
          <dt className="text-[10px] uppercase text-slate-400">Cost</dt>
          <dd className="font-bold text-slate-900 dark:text-white">
            {costBand}
            {costIndex != null ? (
              <span className="ml-1 text-xs font-normal text-slate-400">
                (idx {formatDisplayNumber(costIndex)})
              </span>
            ) : null}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function CatalogRow({
  label,
  row,
  onSelect,
  variant,
  expectedLifeH,
  lifeSf,
  costBand,
  differentiator,
}: {
  label: string;
  row: NonNullable<CrossManufacturerRecommendation["primary"]>;
  onSelect?: (designation: string) => void;
  variant: "primary" | "alternative";
  expectedLifeH?: number;
  lifeSf?: number;
  costBand: string;
  differentiator?: string;
}) {
  const { entry } = row;
  const staticSf = row.staticUtilization > 0 ? 1 / row.staticUtilization : undefined;

  return (
    <div
      className={`rounded-xl border p-3 ${
        variant === "primary"
          ? "border-emerald-300/80 bg-white dark:border-emerald-800/50 dark:bg-slate-950/50"
          : "border-slate-200/80 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/50"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {BEARING_MANUFACTURER_LABELS[entry.manufacturer]} {entry.designation}
      </p>
      {differentiator ? (
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{differentiator}</p>
      ) : null}

      <MetricsStrip
        expectedLifeH={expectedLifeH}
        lifeSf={lifeSf}
        staticSf={staticSf}
        costBand={costBand}
        costIndex={entry.costIndex}
      />

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">d × D × B</dt>
          <dd className="font-medium tabular-nums">
            {entry.boreMm} × {entry.outerDiameterMm} × {entry.widthMm} mm
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">C / C₀</dt>
          <dd className="font-medium tabular-nums">
            {formatDisplayNumber(entry.dynamicRatingN / 1000)} /{" "}
            {formatDisplayNumber(entry.staticRatingN / 1000)} kN
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">n_lim</dt>
          <dd className="font-medium tabular-nums">{entry.limitingSpeedRpm} rpm</dd>
        </div>
        <div>
          <dt className="text-slate-400">Seal</dt>
          <dd className="font-medium">{sealLabelForOem(entry.manufacturer, entry.sealType)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Cage</dt>
          <dd className="font-medium">{entry.cageType ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-400">P/C · n_lim/n</dt>
          <dd className="font-medium tabular-nums">
            {formatDisplayNumber(row.dynamicUtilization)} · {formatDisplayNumber(row.speedMargin)}
          </dd>
        </div>
      </dl>
      {onSelect ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onSelect(entry.designation)}
            className="rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            Select
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function BearingRecommendations({
  result,
  recommendation,
  compareRows = [],
  onSelect,
}: Props) {
  const { primary, alternatives, advisor } = recommendation;
  const [explainOpen, setExplainOpen] = useState(false);

  if (!primary && alternatives.length === 0) return null;

  const statusLabel =
    result.designStatus === "safe" ? "PASS" : result.designStatus === "warning" ? "MARGINAL" : "FAIL";

  const computedLifeSf = lifeSfFromResult(result);
  const compareByDesignation = new Map(compareRows.map((r) => [r.designation, r]));

  const primaryCompare = primary ? compareByDesignation.get(primary.entry.designation) : undefined;
  const primaryLife =
    primaryCompare && primaryCompare.result.designation === primary?.entry.designation
      ? primaryCompare.result.modifiedLife
      : result.designation === primary?.entry.designation
        ? result.modifiedLife
        : primaryCompare?.result.modifiedLife ?? result.modifiedLife;
  const primaryLifeSf =
    primaryCompare && primaryCompare.result.designation === primary?.entry.designation
      ? lifeSfFromResult(primaryCompare.result)
      : result.designation === primary?.entry.designation
        ? computedLifeSf
        : primaryCompare
          ? lifeSfFromResult(primaryCompare.result)
          : computedLifeSf;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Intelligent recommendation
          </p>
          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${
              result.designStatus === "safe"
                ? "text-emerald-600 dark:text-emerald-400"
                : result.designStatus === "warning"
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {statusLabel}
          </p>
          {advisor?.summary ? (
            <p className="mt-1 max-w-xl text-xs text-slate-600 dark:text-slate-400">{advisor.summary}</p>
          ) : null}
        </div>
        {advisor ? (
          <button
            type="button"
            onClick={() => setExplainOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {explainOpen ? "Hide explanation" : "Explain Recommendation"}
          </button>
        ) : null}
      </div>

      {explainOpen && advisor ? (
        <div className="rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white p-3.5 dark:border-violet-900/50 dark:from-violet-950/40 dark:to-slate-950/60">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden />
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                AI Engineering Advisor
              </p>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {advisor.narrative}
              </p>
              {advisor.reasons.length > 0 ? (
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  {advisor.reasons.map((reason) => (
                    <li key={reason} className="flex gap-1.5">
                      <span className="text-violet-500">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-[10px] text-slate-400">
                Deterministic engineering narrative from ISO 281 duty inputs — not a generative LLM.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {primary ? (
        <CatalogRow
          label="Recommended"
          row={primary}
          onSelect={onSelect}
          variant="primary"
          expectedLifeH={primaryLife}
          lifeSf={primaryLifeSf}
          costBand={advisor?.costBand ?? costBandFromIndex(primary.entry.costIndex)}
        />
      ) : null}

      {alternatives.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alternatives</p>
          {alternatives.slice(0, 3).map((alt) => {
            const note = advisor?.alternativeNotes.find(
              (n) => n.designation === alt.entry.designation
            );
            const solved = compareByDesignation.get(alt.entry.designation);
            return (
              <CatalogRow
                key={alt.entry.designation}
                label={`Alternative · ${BEARING_MANUFACTURER_LABELS[alt.entry.manufacturer]}`}
                row={alt}
                onSelect={onSelect}
                variant="alternative"
                expectedLifeH={solved?.result.modifiedLife}
                lifeSf={solved ? lifeSfFromResult(solved.result) : undefined}
                costBand={note?.costBand ?? costBandFromIndex(alt.entry.costIndex)}
                differentiator={note?.note}
              />
            );
          })}
        </div>
      ) : null}

      {result.designation ? (
        <BearingInterchangeCard
          designation={result.designation}
          onSelectDesignation={onSelect}
        />
      ) : null}

      {result.pairedStations && result.pairedStations.length >= 2 ? (
        <div className="rounded-lg border border-violet-200/60 bg-violet-50/40 p-2.5 text-[11px] dark:border-violet-900/40 dark:bg-violet-950/20">
          <p className="font-semibold text-violet-900 dark:text-violet-100">System pair analysis</p>
          <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
            {result.pairedStations.map((s) => (
              <li key={s.index}>
                {s.label ?? `Station ${s.index + 1}`}
                {s.designation ? `: ${s.designation}` : ""} — Lnm{" "}
                {formatDisplayNumber(s.modifiedLifeHours)} h
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
