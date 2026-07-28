"use client";

import { useState } from "react";
import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import {
  ratedViscosityNu1,
  viscosityRatio,
  CONTAMINATION_EC,
  type ContaminationLevel,
} from "@/lib/machine/bearings/iso281Life";
import { calculateGreaseService } from "@/lib/machine/bearings/greaseLife";

export default function BearingLubricationPage() {
  const [dm, setDm] = useState(40);
  const [speed, setSpeed] = useState(1500);
  const [visc, setVisc] = useState(40);
  const [contamination, setContamination] = useState<ContaminationLevel>("normal_clean");
  const [tempC, setTempC] = useState(70);

  const nu1 = ratedViscosityNu1(dm, speed);
  const kappa = viscosityRatio(visc, nu1);
  const eC = CONTAMINATION_EC[contamination];
  const grease = calculateGreaseService({
    meanDiameterMm: dm,
    speedRpm: speed,
    operatingTempC: tempC,
    contamination,
    dynamicUtilization: 0.2,
    bearingType: "deep_groove",
    lubricantType: "grease",
    sealed: true,
  });

  return (
    <BearingSuiteChrome>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Bearing lubrication</h1>
          <p className="mt-1 text-sm text-slate-500">
            Viscosity ratio κ = ν/ν₁ and contamination eC drive ISO 281 aISO. Grease life is a
            screening estimate — confirm with OEM charts for critical duty.
          </p>
        </div>

        <div className="grid max-w-xl gap-3">
          <CalculatorUnitField label="Mean diameter dm" value={dm} onChange={setDm} min={1} unit="mm" />
          <CalculatorUnitField label="Speed" value={speed} onChange={setSpeed} min={1} unit="rpm" />
          <CalculatorUnitField label="Operating viscosity ν" value={visc} onChange={setVisc} min={0.1} unit="cSt" />
          <CalculatorUnitField label="Operating temperature" value={tempC} onChange={setTempC} unit="°C" />
          <label className="text-sm font-medium">
            Contamination
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              value={contamination}
              onChange={(e) => setContamination(e.target.value as ContaminationLevel)}
            >
              {(Object.keys(CONTAMINATION_EC) as ContaminationLevel[]).map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Rated ν₁</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{nu1.toFixed(1)} cSt</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500">κ</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{kappa.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500">eC</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{eC}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Grease L10h (screen)</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {grease.greaseLifeHours != null
                ? Math.round(grease.greaseLifeHours).toLocaleString()
                : "—"}{" "}
              h
            </p>
          </div>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Oil bath / circulating oil: use operating viscosity at bearing temperature.</li>
          <li>Grease: effective base-oil viscosity drops with temperature — derate accordingly.</li>
          <li>Oil mist / jet: specialty high-speed practice — treat catalog n_lim carefully.</li>
        </ul>

        <p className="text-sm text-slate-500">
          Feed κ and eC into the{" "}
          <Link href="/products/bearings/life" className="font-medium text-cyan-700 underline dark:text-cyan-400">
            life calculator
          </Link>
          .
        </p>
      </div>
    </BearingSuiteChrome>
  );
}
