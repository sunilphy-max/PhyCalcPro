"use client";

import type { MountedBomResult } from "@/lib/machine/housing/mountedBom";
import type { HousingSealOption } from "@/data/catalogs/housing";

type Props = {
  bom: MountedBomResult | null;
  seal?: HousingSealOption;
  onSealChange?: (seal: HousingSealOption) => void;
  onHousingSkuChange?: (sku: string) => void;
  housingOptions?: { sku: string; label: string }[];
  compact?: boolean;
};

/** Mounted kit BOM: bearing + housing + seal + grease. */
export default function MountedBomPanel({
  bom,
  seal,
  onSealChange,
  onHousingSkuChange,
  housingOptions,
  compact,
}: Props) {
  if (!bom) return null;

  return (
    <div
      className={`rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20 ${
        compact ? "" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800 dark:text-indigo-200">
        Mounted solution kit (screening)
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">{bom.note}</p>

      {housingOptions && housingOptions.length > 0 && onHousingSkuChange ? (
        <div className="mt-2">
          <label className="text-[10px] text-slate-500">Housing SKU</label>
          <select
            className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
            value={bom.housing.sku}
            onChange={(e) => onHousingSkuChange(e.target.value)}
          >
            {housingOptions.map((o) => (
              <option key={o.sku} value={o.sku}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {onSealChange ? (
        <div className="mt-2">
          <label className="text-[10px] text-slate-500">Seal</label>
          <select
            className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
            value={seal ?? bom.seal}
            onChange={(e) => onSealChange(e.target.value as HousingSealOption)}
          >
            {bom.housing.sealOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <table className="mt-3 w-full text-left text-xs">
        <thead>
          <tr className="border-b border-indigo-200/60 dark:border-indigo-900/40">
            <th className="py-1 font-medium text-slate-500">Kind</th>
            <th className="py-1 font-medium text-slate-500">SKU</th>
            <th className="py-1 font-medium text-slate-500">Qty</th>
            <th className="py-1 font-medium text-slate-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {bom.lines.map((line) => (
            <tr key={`${line.kind}-${line.sku}`} className="border-b border-indigo-100/50 dark:border-indigo-950/40">
              <td className="py-1 capitalize text-slate-500">{line.kind}</td>
              <td className="py-1 font-semibold tabular-nums">{line.sku}</td>
              <td className="py-1 tabular-nums">{line.qty}</td>
              <td className="py-1 text-slate-600 dark:text-slate-400">{line.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-slate-500">
        Geometry from catalog: bolt span {bom.boltSpanMm} mm · base height {bom.baseHeightMm} mm ·
        stiffness ×{bom.stiffnessFactor}
      </p>
    </div>
  );
}
