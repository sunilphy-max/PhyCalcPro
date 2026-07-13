"use client";

import type { BearingCatalogEntry } from "@/data/catalogs/bearingCatalog";
import { BEARING_MANUFACTURER_LABELS, BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import { sealLabelForOem, AVAILABILITY_LABEL } from "@/data/catalogs/bearing/manufacturerDesignations";

type Props = {
  entry: BearingCatalogEntry;
};

export default function BearingCatalogDetail({ entry }: Props) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-xs dark:border-slate-700/60 dark:bg-slate-900/40">
      <p className="font-semibold text-slate-900 dark:text-white">
        {BEARING_MANUFACTURER_LABELS[entry.manufacturer]} {entry.designation}
      </p>
      <p className="mt-0.5 text-slate-500">{BEARING_TYPE_LABELS[entry.type]} · series {entry.series}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">Dimensions</dt>
          <dd className="font-medium tabular-nums">
            d {entry.boreMm} · D {entry.outerDiameterMm} · B {entry.widthMm} mm
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Dynamic C</dt>
          <dd className="font-medium tabular-nums">{(entry.dynamicRatingN / 1000).toFixed(2)} kN</dd>
        </div>
        <div>
          <dt className="text-slate-400">Static C₀</dt>
          <dd className="font-medium tabular-nums">{(entry.staticRatingN / 1000).toFixed(2)} kN</dd>
        </div>
        {entry.fatigueLoadLimitN != null ? (
          <div>
            <dt className="text-slate-400">
              Fatigue limit Pu
              {entry.fatigueLoadLimitFromDatasheet ? " (datasheet)" : " (est.)"}
            </dt>
            <dd className="font-medium tabular-nums">
              {(entry.fatigueLoadLimitN / 1000).toFixed(2)} kN
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-slate-400">Limiting speed</dt>
          <dd className="font-medium tabular-nums">{entry.limitingSpeedRpm} rpm</dd>
        </div>
        {entry.unitSystem === "inch" ? (
          <div>
            <dt className="text-slate-400">Inch size</dt>
            <dd className="font-medium tabular-nums">
              {entry.boreIn?.toFixed(3)} × {entry.outerDiameterIn?.toFixed(3)} ×{" "}
              {entry.widthIn?.toFixed(3)} in
            </dd>
          </div>
        ) : null}
        {entry.contactAngleDeg != null ? (
          <div>
            <dt className="text-slate-400">Contact angle</dt>
            <dd className="font-medium tabular-nums">{entry.contactAngleDeg}°</dd>
          </div>
        ) : null}
        {entry.referenceSpeedRpm != null ? (
          <div>
            <dt className="text-slate-400">Reference speed</dt>
            <dd className="font-medium tabular-nums">{entry.referenceSpeedRpm} rpm</dd>
          </div>
        ) : null}
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
        <div>
          <dt className="text-slate-400">Clearance</dt>
          <dd className="font-medium">{entry.clearance}</dd>
        </div>
        <div className="col-span-full">
          <dt className="text-slate-400">Availability</dt>
          <dd className="font-medium text-slate-500">{AVAILABILITY_LABEL}</dd>
        </div>
      </dl>
    </div>
  );
}
