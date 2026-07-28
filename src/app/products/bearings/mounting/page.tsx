"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import { recommendBearingFits } from "@/lib/machine/bearings/fitsClearance";
import type { BearingClearance } from "@/data/catalogs/bearingCatalog";

export default function BearingMountingPage() {
  const [boreMm, setBoreMm] = useState(25);
  const [clearance, setClearance] = useState<BearingClearance>("CN");
  const [rotatingInner, setRotatingInner] = useState(true);

  const fit = useMemo(
    () =>
      recommendBearingFits({
        boreMm,
        radialLoadN: 5000,
        speedRpm: 1500,
        clearance,
        mountingRole: rotatingInner ? "locating" : "non_locating",
        innerRingRotates: rotatingInner,
      }),
    [boreMm, clearance, rotatingInner]
  );

  return (
    <BearingSuiteChrome>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Bearing mounting</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shaft/housing fit screening (ISO 286 / OEM tables), clearance, and mounting practice.
          </p>
        </div>

        <div className="grid max-w-xl gap-3">
          <CalculatorUnitField label="Bore diameter" value={boreMm} onChange={setBoreMm} min={1} unit="mm" />
          <label className="text-sm font-medium">
            Clearance class
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              value={clearance}
              onChange={(e) => setClearance(e.target.value as BearingClearance)}
            >
              {(["C2", "CN", "C3", "C4"] as BearingClearance[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rotatingInner}
              onChange={(e) => setRotatingInner(e.target.checked)}
            />
            Rotating inner ring (typical shaft)
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recommended fits (screen)</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Shaft</dt>
              <dd className="font-semibold">{fit.shaftFit}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Housing</dt>
              <dd className="font-semibold">{fit.housingFit}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Clearance reduction</dt>
              <dd className="tabular-nums">{fit.clearanceReductionUm.toFixed(1)} µm</dd>
            </div>
            <div>
              <dt className="text-slate-500">Est. operating clearance</dt>
              <dd className="tabular-nums">{fit.estimatedOperatingClearanceUm.toFixed(1)} µm</dd>
            </div>
          </dl>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {fit.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Press fit / oil injection",
              body: "Use arbor press or hydraulic nut for interference seats. Never hammer on the outer ring of a ball bearing.",
            },
            {
              title: "Thermal mounting",
              body: "Heat inner ring (induction / oil bath, typically below 120 °C) for shrink fit; cool outer for housing interference when required.",
            },
            {
              title: "Locknuts & sleeves",
              body: "Adapter / withdrawal sleeves and locknuts for spherical and some tapered mounts — torque and tab washer per OEM.",
            },
            {
              title: "Clearance check",
              body: "Measure residual radial clearance after mounting when C3/C4 is specified for thermal or heavy fits.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{card.body}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500">
          Continue in{" "}
          <Link href="/products/bearings/selection" className="text-cyan-700 underline dark:text-cyan-400">
            Selection
          </Link>{" "}
          for duty sizing, or{" "}
          <Link href="/products/bearings/housing" className="text-cyan-700 underline dark:text-cyan-400">
            Housings
          </Link>{" "}
          for pillow-block screening.
        </p>
      </div>
    </BearingSuiteChrome>
  );
}
