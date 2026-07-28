"use client";

import type { BearingCatalogEntry } from "@/data/catalogs/bearingCatalog";
import { constructionForType, provenanceLabel } from "@/data/bearings/constructionDefaults";
import type { RatingProvenance } from "@/data/bearings/constructionDefaults";

type Props = {
  entry?: BearingCatalogEntry | null;
  bearingType: BearingCatalogEntry["type"];
  ratingsProvenance?: RatingProvenance;
};

export default function BearingConstructionCard({
  entry,
  bearingType,
  ratingsProvenance = "oem_scaled",
}: Props) {
  const info = constructionForType(bearingType, entry?.sealType, entry?.cageType);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Construction & materials</h3>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Ratings: {provenanceLabel(ratingsProvenance)}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Ring material</dt>
          <dd className="text-slate-800 dark:text-slate-200">{info.ringMaterial}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Rolling element</dt>
          <dd className="text-slate-800 dark:text-slate-200">{info.rollingElement}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Cage</dt>
          <dd className="text-slate-800 dark:text-slate-200">{info.cage}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Seal</dt>
          <dd className="text-slate-800 dark:text-slate-200">{entry?.sealType ?? info.seal}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Lubricant</dt>
          <dd className="text-slate-800 dark:text-slate-200">{info.lubricant}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Operating temperature</dt>
          <dd className="text-slate-800 dark:text-slate-200">{info.operatingTemperature}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        Typical applications: {info.typicalApplications.join(", ")}
      </p>
      <p className="mt-1 text-xs text-slate-500">Standards: {info.standards.join(" · ")}</p>
    </div>
  );
}
