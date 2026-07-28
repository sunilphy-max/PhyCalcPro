"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { findMaterialById } from "@/data/materials";
import MaterialCompareTable from "@/components/materials/MaterialCompareTable";
import { materialCompareHref } from "@/lib/materials/materialPage";

export default function MaterialCompareClient() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("ids") ?? "";
  const ids = useMemo(
    () =>
      raw
        .split(",")
        .map((id) => decodeURIComponent(id.trim()))
        .filter(Boolean)
        .slice(0, 4),
    [raw]
  );

  const materials = useMemo(
    () => ids.map((id) => findMaterialById(id)).filter((m): m is NonNullable<typeof m> => m != null),
    [ids]
  );

  const missing = ids.filter((id) => !findMaterialById(id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/products/materials/database" className="text-blue-600 hover:underline">
          Material Encyclopedia
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700 dark:text-slate-300">Compare</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Material comparison</h1>
        <p className="mt-1 text-sm text-slate-500">
          Side-by-side properties for up to four grades. Share this URL or pick grades from the
          encyclopedia browse list.
        </p>
      </div>

      {materials.length < 2 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">Select at least two materials to compare.</p>
          <p className="mt-1">
            Example:{" "}
            <Link
              href={materialCompareHref(["astm-a36", "astm-a992", "al-6061"])}
              className="font-medium text-blue-700 underline dark:text-blue-300"
            >
              ASTM A36 vs ASTM A992 vs 6061-T6
            </Link>
            .
          </p>
          <Link
            href="/products/materials/database"
            className="mt-3 inline-block text-blue-700 underline dark:text-blue-300"
          >
            Back to encyclopedia →
          </Link>
        </div>
      ) : (
        <>
          {missing.length > 0 ? (
            <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
              Unknown ids ignored: {missing.join(", ")}
            </p>
          ) : null}
          <MaterialCompareTable materials={materials} />
        </>
      )}
    </div>
  );
}
