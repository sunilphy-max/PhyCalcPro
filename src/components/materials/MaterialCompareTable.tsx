import Link from "next/link";
import { materialCategoryLabels, type Material } from "@/data/materials";
import { getMaterialDatasheet } from "@/data/materialDatasheets";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { materialDatasheetHref } from "@/lib/materials/materialPage";
import { modulesAcceptingCatalogMaterial } from "@/lib/workspace/workspaceRegistry";

type Props = {
  materials: Material[];
};

function cell(value: string | number) {
  return <span className="tabular-nums">{value}</span>;
}

export default function MaterialCompareTable({ materials }: Props) {
  const targets = modulesAcceptingCatalogMaterial().slice(0, 4);

  const rows: Array<{ label: string; values: Array<string | number> }> = [
    {
      label: "Category",
      values: materials.map((m) => materialCategoryLabels[m.category]),
    },
    {
      label: "Standard",
      values: materials.map((m) => m.standard ?? "—"),
    },
    {
      label: "E",
      values: materials.map((m) => formatEngineeringValue(m.E / 1e9, "GPa", { digits: 0 })),
    },
    {
      label: "Yield Re",
      values: materials.map((m) => formatEngineeringValue(m.yieldStress / 1e6, "MPa", { digits: 0 })),
    },
    {
      label: "Ultimate Rm",
      values: materials.map((m) => formatEngineeringValue(m.ultimateStrength / 1e6, "MPa", { digits: 0 })),
    },
    {
      label: "Density ρ",
      values: materials.map((m) => formatEngineeringValue(m.density, "kg/m³", { digits: 0 })),
    },
    {
      label: "Poisson ν",
      values: materials.map((m) => formatEngineeringValue(m.poisson, "", { digits: 3 })),
    },
    {
      label: "α (thermal)",
      values: materials.map((m) =>
        m.thermalExpansion != null
          ? formatEngineeringValue(m.thermalExpansion * 1e6, "µm/(m·K)", { digits: 1 })
          : "—"
      ),
    },
    {
      label: "Sy / ρ",
      values: materials.map((m) =>
        formatEngineeringValue(m.yieldStress / m.density, "Pa·m³/kg", {
          useExponential: true,
          digits: 2,
        })
      ),
    },
    {
      label: "E / ρ",
      values: materials.map((m) =>
        formatEngineeringValue(m.E / m.density, "Pa·m³/kg", {
          useExponential: true,
          digits: 2,
        })
      ),
    },
    {
      label: "Cost band",
      values: materials.map((m) => m.costBand ?? "—"),
    },
    {
      label: "Corrosion",
      values: materials.map((m) => m.corrosionClass ?? "—"),
    },
    {
      label: "Machinability",
      values: materials.map((m) => m.machinabilityIndex?.toFixed(0) ?? "—"),
    },
    {
      label: "Key applications",
      values: materials.map((m) => {
        const apps = getMaterialDatasheet(m.id)?.applications ?? [];
        return apps.slice(0, 2).join("; ") || "—";
      }),
    },
    {
      label: "Key advantages",
      values: materials.map((m) => {
        const adv = getMaterialDatasheet(m.id)?.advantages ?? [];
        return adv.slice(0, 2).join("; ") || "—";
      }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-3 py-2.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Property
              </th>
              {materials.map((m) => (
                <th key={m.id} className="min-w-[10rem] px-3 py-2.5 font-semibold text-slate-900 dark:text-white">
                  <Link href={materialDatasheetHref(m.id)} className="hover:text-blue-600 hover:underline">
                    {m.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100 dark:border-slate-800">
                <td className="sticky left-0 bg-white px-3 py-2 text-slate-500 dark:bg-slate-900">
                  {row.label}
                </td>
                {row.values.map((value, i) => (
                  <td key={`${row.label}-${materials[i].id}`} className="px-3 py-2 text-slate-800 dark:text-slate-200">
                    {typeof value === "string" && value.length > 60 ? (
                      <span className="text-xs leading-snug">{value}</span>
                    ) : (
                      cell(value)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40"
          >
            <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link
                href={materialDatasheetHref(m.id)}
                className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Datasheet
              </Link>
              {targets.map((mod) => (
                <Link
                  key={mod.id}
                  href={`${mod.route}?material=${encodeURIComponent(m.name)}`}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-blue-600 dark:border-slate-600"
                >
                  {mod.title.replace(/ Workspace$/, "")}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
