"use client";

import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";

const LAYOUTS = [
  {
    id: "fixed-free",
    title: "Fixed–free (locating + floating)",
    body: "One bearing takes axial location; the other floats axially to allow thermal growth. Default for most shafts with moderate ΔT.",
  },
  {
    id: "fixed-fixed",
    title: "Fixed–fixed",
    body: "Both ends locate axially — only for short spans or when expansion is negligible. Risk of thermal preload.",
  },
  {
    id: "back-to-back",
    title: "Back-to-back (O arrangement)",
    body: "Angular-contact or tapered pairs with wide effective spread — good moment stiffness.",
  },
  {
    id: "face-to-face",
    title: "Face-to-face (X arrangement)",
    body: "Narrower spread; more tolerant of misalignment than O; lower moment stiffness.",
  },
  {
    id: "tandem",
    title: "Tandem (T arrangement)",
    body: "Shares axial load in one direction — pair with a locating partner for reverse thrust.",
  },
];

export default function BearingArrangementPage() {
  return (
    <BearingSuiteChrome>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Bearing arrangement</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose locating/floating or duplex O / X / T before sizing life.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {LAYOUTS.map((layout) => (
            <div
              key={layout.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <h2 className="font-semibold text-slate-900 dark:text-white">{layout.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{layout.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white p-4 dark:border-cyan-900 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Duplex reference</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {(["back_to_back", "face_to_face", "tandem"] as const).map((arr) => (
              <BearingReferenceVisual
                key={arr}
                bearingType="angular_contact"
                arrangement={arr}
                compact
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Apply an arrangement in{" "}
          <Link href="/products/bearings/selection" className="font-medium text-cyan-700 underline dark:text-cyan-400">
            Selection
          </Link>{" "}
          (Operating step) for duplex load split and stiffness screens.
        </p>
      </div>
    </BearingSuiteChrome>
  );
}
