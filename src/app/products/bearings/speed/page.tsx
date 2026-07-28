"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import { findBearing } from "@/data/catalogs/bearingCatalog";

function SpeedInner() {
  const searchParams = useSearchParams();
  const designationParam = searchParams.get("designation") ?? "6205";
  const [designation, setDesignation] = useState(designationParam);
  const [speed, setSpeed] = useState(3000);
  const entry = useMemo(() => findBearing(designation), [designation]);

  const dm = entry ? (entry.boreMm + entry.outerDiameterMm) / 2 : 0;
  const dn = dm * speed;
  const nLim = entry?.limitingSpeedRpm ?? 0;
  const nRef = entry?.referenceSpeedRpm;
  const overLim = nLim > 0 && speed > nLim;
  const overRef = nRef != null && speed > nRef;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Bearing speed</h1>
        <p className="mt-1 text-sm text-slate-500">
          DN value and catalog limiting / reference speeds. Grease-filled seals often run below oil
          reference speed.
        </p>
      </div>

      <div className="grid max-w-xl gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Designation
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </label>
        <CalculatorUnitField label="Operating speed" value={speed} onChange={setSpeed} min={0} unit="rpm" />
      </div>

      {entry ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="font-semibold text-slate-900 dark:text-white">
            {entry.designation} · {entry.manufacturer}
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">dm</dt>
              <dd className="tabular-nums font-medium">{dm.toFixed(1)} mm</dd>
            </div>
            <div>
              <dt className="text-slate-500">DN = n · dm</dt>
              <dd className="tabular-nums font-medium">{Math.round(dn).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Limiting speed n_lim</dt>
              <dd className={`tabular-nums font-medium ${overLim ? "text-rose-600" : ""}`}>
                {Math.round(nLim)} rpm
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Reference speed (oil)</dt>
              <dd className={`tabular-nums font-medium ${overRef ? "text-amber-600" : ""}`}>
                {nRef != null ? `${Math.round(nRef)} rpm` : "—"}
              </dd>
            </div>
          </dl>
          {overLim ? (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              Operating speed exceeds catalog limiting speed — reduce n, change series, or switch to
              oil lubrication / cooling per OEM guidance.
            </p>
          ) : overRef ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              Above oil reference speed — thermal and lubrication screening required.
            </p>
          ) : (
            <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
              Speed within catalog limiting speed for this designation.
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Seal type: {entry.sealType}. Grease limits are typically lower than oil reference — see{" "}
            <Link href="/products/bearings/lubrication" className="underline">
              Lubrication
            </Link>
            .
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-700">Designation not found in catalog.</p>
      )}
    </div>
  );
}

export default function BearingSpeedPage() {
  return (
    <BearingSuiteChrome>
      <Suspense fallback={null}>
        <SpeedInner />
      </Suspense>
    </BearingSuiteChrome>
  );
}
