"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import { fromBase, toBase } from "@/lib/units/conversions";
import type { ShaftBearingLifeScreen } from "@/lib/machine/shafts/types";
import {
  buildShaftCatalogLifeRows,
  type ShaftCatalogBearingPick,
} from "@/lib/machine/shafts/shaftBearingCatalog";
import type { CatalogBearingType } from "@/data/catalogs/bearingCatalog";

type Props = {
  screens: ShaftBearingLifeScreen[];
  picks: ShaftCatalogBearingPick[];
  onPick: (positionM: number, designation: string | null) => void;
  shaftDiameterM: number;
  operatingRpm: number;
  lengthUnit?: string;
  forceUnit?: string;
  bearingType?: CatalogBearingType;
};

export default function ShaftBearingCatalogPanel({
  screens,
  picks,
  onPick,
  shaftDiameterM,
  operatingRpm,
  lengthUnit = "m",
  forceUnit = "N",
  bearingType = "deep_groove",
}: Props) {
  // Dashboard result may already be in display units — catalog math needs SI (m, N).
  const screensSi = useMemo(
    () =>
      screens.map((s) => ({
        ...s,
        position: toBase(s.position, "length", lengthUnit),
        radialForce: toBase(s.radialForce, "force", forceUnit),
        requiredDynamicRating: toBase(s.requiredDynamicRating, "force", forceUnit),
        estimatedDynamicRating:
          s.estimatedDynamicRating != null
            ? toBase(s.estimatedDynamicRating, "force", forceUnit)
            : null,
      })),
    [screens, lengthUnit, forceUnit]
  );

  const rows = useMemo(
    () =>
      buildShaftCatalogLifeRows({
        screens: screensSi,
        picks,
        shaftDiameterM,
        operatingRpm,
        bearingType,
      }),
    [screensSi, picks, shaftDiameterM, operatingRpm, bearingType]
  );

  if (screens.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Bearing selection → L10 (catalog)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Reaction forces from FEM → pick a catalog designation → ISO 281 basic L10 with rated C.
          </p>
        </div>
        <Link
          href="/products/bearings/designer"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Open bearings module
        </Link>
      </div>

      {operatingRpm <= 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Set operating speed (RPM) to compute L10 life from catalog C.
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row, i) => {
          const l10 = row.catalogL10Hours ?? row.estimatedL10Hours;
          return (
            <li
              key={`${row.position}-${i}`}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-sm text-slate-900">
                  Support @{" "}
                  {formatEngineeringValue(fromBase(row.position, "length", lengthUnit), lengthUnit)}{" "}
                  — <span className="uppercase tracking-wide">{row.status}</span>
                </div>
                {row.recommended && !row.designation && (
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:underline"
                    onClick={() => onPick(row.position, row.recommended!.entry.designation)}
                  >
                    Apply recommended {row.recommended.entry.designation}
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-600">
                Fr ={" "}
                {formatEngineeringValue(fromBase(row.radialForce, "force", forceUnit), forceUnit)} ·
                required C{" "}
                {formatEngineeringValue(
                  fromBase(row.requiredDynamicRating, "force", forceUnit),
                  forceUnit
                )}{" "}
                · slope {formatDisplayNumber(row.slopeRad * 1000)} mrad
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Catalog designation</span>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  value={row.designation ?? ""}
                  onChange={(e) => onPick(row.position, e.target.value || null)}
                >
                  <option value="">Rough C(d) screen only…</option>
                  {row.ranked.map((r) => (
                    <option key={r.entry.designation} value={r.entry.designation}>
                      {r.entry.designation} · C={formatDisplayNumber(r.entry.dynamicRatingN / 1000)}{" "}
                      kN · d={r.entry.boreMm} mm
                      {r.passes ? "" : " (marginal)"}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs text-slate-700">
                <div>
                  <div className="text-slate-500">Catalog C</div>
                  <div className="font-medium tabular-nums">
                    {row.catalogC != null
                      ? formatEngineeringValue(fromBase(row.catalogC, "force", forceUnit), forceUnit)
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">C₀</div>
                  <div className="font-medium tabular-nums">
                    {row.catalogC0 != null
                      ? formatEngineeringValue(fromBase(row.catalogC0, "force", forceUnit), forceUnit)
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">L10 life</div>
                  <div className="font-medium tabular-nums">
                    {l10 != null ? `${formatDisplayNumber(l10)} h` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Target</div>
                  <div className="font-medium tabular-nums">
                    {formatDisplayNumber(row.targetLifeHours)} h
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
