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
}: {
  label: string;
  row: CrossManufacturerRecommendation["primary"];
  onSelect?: (designation: string) => void;
  variant: "primary" | "alternative";
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
      <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{entry.designation}</p>
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
        {entry.massKg != null ? (
          <div>
            <dt className="text-slate-400">Mass</dt>
            <dd className="font-medium tabular-nums">{entry.massKg} kg</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-slate-400">Seal</dt>
          <dd className="font-medium">{sealLabelForOem(entry.manufacturer, entry.sealType)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Cage</dt>
          <dd className="font-medium">{entry.cageType ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span>P/C {formatDisplayNumber(row.dynamicUtilization)}</span>
        <span>s₀ {formatDisplayNumber(row.staticUtilization > 0 ? 1 / row.staticUtilization : 0)}</span>
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
  const { primary, alternatives, equivalents } = recommendation;
  if (!primary && alternatives.length === 0) return null;

  const statusLabel =
    result.designStatus === "safe" ? "PASS" : result.designStatus === "warning" ? "MARGINAL" : "FAIL";

  const equivalentOthers = equivalents.filter(
    (e) => e.designation !== primary?.entry.designation
  );

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bearing selection</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            <span
              className={
                result.designStatus === "safe"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : result.designStatus === "warning"
                    ? "text-amber-600"
                    : "text-red-600"
              }
            >
              {statusLabel}
            </span>
            <span className="ml-2 text-base font-semibold text-slate-700 dark:text-slate-300">
              · Expected life Lnm {formatDisplayNumber(result.modifiedLife)} h
            </span>
          </p>
        </div>
      </div>

      <CatalogRow label="Recommended bearing" row={primary} onSelect={onSelect} variant="primary" />

      {alternatives.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cross-manufacturer alternatives</p>
          {alternatives.map((alt) => (
            <CatalogRow
              key={alt.entry.designation}
              label={BEARING_MANUFACTURER_LABELS[alt.entry.manufacturer]}
              row={alt}
              onSelect={onSelect}
              variant="alternative"
            />
          ))}
        </div>
      ) : null}

      {equivalentOthers.length > 0 && alternatives.length === 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Same ISO size · other OEMs
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {equivalentOthers.map((entry) => (
              <li key={entry.designation}>
                <button
                  type="button"
                  onClick={() => onSelect?.(entry.designation)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-cyan-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  {entry.designation}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
