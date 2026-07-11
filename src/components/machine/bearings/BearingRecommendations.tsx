"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import type { CrossManufacturerRecommendation } from "@/lib/machine/bearings/catalogAlternatives";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { BEARING_MANUFACTURER_LABELS } from "@/data/catalogs/bearingCatalog";
import { sealLabelForOem } from "@/data/catalogs/bearing/manufacturerDesignations";

type Props = {
  result: BearingResult;
  recommendation: CrossManufacturerRecommendation;
  onSelect?: (designation: string) => void;
};

function CatalogRow({
  label,
  row,
  onSelect,
  variant,
  expectedLifeH,
  lifeSf,
}: {
  label: string;
  row: CrossManufacturerRecommendation["primary"];
  onSelect?: (designation: string) => void;
  variant: "primary" | "alternative";
  expectedLifeH?: number;
  lifeSf?: number;
}) {
  if (!row) return null;
  const { entry } = row;

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
      {variant === "primary" && expectedLifeH != null ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase text-slate-400">Expected life Lnm</dt>
            <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDisplayNumber(expectedLifeH)} h
            </dd>
          </div>
          {lifeSf != null ? (
            <div>
              <dt className="text-[10px] uppercase text-slate-400">Life safety factor</dt>
              <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
                {formatDisplayNumber(lifeSf)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[10px] uppercase text-slate-400">Static s₀</dt>
            <dd className="font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDisplayNumber(row.staticUtilization > 0 ? 1 / row.staticUtilization : 0)}
            </dd>
          </div>
        </dl>
      ) : null}
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
            {(entry.dynamicRatingN / 1000).toFixed(1)} / {(entry.staticRatingN / 1000).toFixed(1)} kN
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
        {entry.costIndex != null ? (
          <div>
            <dt className="text-slate-400">Cost index</dt>
            <dd className="font-medium tabular-nums">{entry.costIndex.toFixed(2)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span>P/C {formatDisplayNumber(row.dynamicUtilization)}</span>
        <span>n_lim/n {formatDisplayNumber(row.speedMargin)}</span>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(entry.designation)}
            className="ml-auto rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            Select
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function BearingRecommendations({ result, recommendation, onSelect }: Props) {
  const { primary, alternatives } = recommendation;
  if (!primary && alternatives.length === 0) return null;

  const statusLabel =
    result.designStatus === "safe" ? "PASS" : result.designStatus === "warning" ? "MARGINAL" : "FAIL";

  const computedLifeSf =
    result.lifeSafetyFactor ??
    (result.lifeUtilization > 0 && Number.isFinite(result.lifeUtilization)
      ? 1 / result.lifeUtilization
      : undefined);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bearing selection
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
      </div>

      <CatalogRow
        label="Recommended bearing"
        row={primary}
        onSelect={onSelect}
        variant="primary"
        expectedLifeH={result.modifiedLife}
        lifeSf={computedLifeSf}
      />

      {alternatives.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alternatives</p>
          {alternatives.map((alt) => (
            <CatalogRow
              key={alt.entry.designation}
              label={`Alternative · ${BEARING_MANUFACTURER_LABELS[alt.entry.manufacturer]}`}
              row={alt}
              onSelect={onSelect}
              variant="alternative"
            />
          ))}
        </div>
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
