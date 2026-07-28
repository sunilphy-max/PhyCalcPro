import type { ReactNode } from "react";
import Link from "next/link";
import {
  MATERIAL_PAGE_SECTIONS,
  type MaterialPageModel,
  type MaterialPageSectionId,
  materialDatasheetHref,
} from "@/lib/materials/materialPage";
import { materialCategoryLabels } from "@/data/materials";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { modulesAcceptingCatalogMaterial } from "@/lib/workspace/workspaceRegistry";

type Props = {
  page: MaterialPageModel;
};

function NotPublished() {
  return (
    <p className="text-sm italic text-slate-500 dark:text-slate-400">Not published for this grade.</p>
  );
}

function Section({
  id,
  title,
  published,
  children,
}: {
  id: MaterialPageSectionId;
  title: string;
  published: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-slate-200 pt-6 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-3">{published ? children : <NotPublished />}</div>
    </section>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm last:border-0 dark:border-slate-800">
      <span className="text-slate-500">{label}</span>
      <span className="tabular-nums font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

export default function MaterialDatasheetPage({ page }: Props) {
  const { material, sectionAvailability: avail } = page;
  const targets = modulesAcceptingCatalogMaterial();
  const relatedCalcs = [
    {
      title: "Temperature Properties",
      href: `/products/materials/temperature-properties?material=${encodeURIComponent(material.name)}`,
    },
    {
      title: "Fatigue",
      href: `/products/materials/fatigue?material=${encodeURIComponent(material.name)}`,
    },
    {
      title: "Corrosion Allowance",
      href: `/products/materials/corrosion?material=${encodeURIComponent(material.name)}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/products/materials/database" className="text-blue-600 hover:underline">
          Material Encyclopedia
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700 dark:text-slate-300">{material.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0 space-y-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {materialCategoryLabels[material.category]}
                  {material.standard ? ` · ${material.standard}` : ""}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {material.name}
                </h1>
                {page.aliases.length > 0 ? (
                  <p className="mt-1 text-sm text-slate-500">Also known as: {page.aliases.join(", ")}</p>
                ) : null}
              </div>
              {page.hasDatasheet ? (
                <span className="rounded bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                  Full datasheet
                </span>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Catalog properties
                </span>
              )}
            </div>

            <nav className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              {MATERIAL_PAGE_SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`rounded-md px-2 py-1 text-xs ${
                    avail[s.id]
                      ? "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                      : "bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <Section id="overview" title="Overview" published={avail.overview}>
              {page.summary ? <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{page.summary}</p> : null}
              {page.formSupply ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Typical supply:</span>{" "}
                  {page.formSupply}
                </p>
              ) : null}
            </Section>

            <Section id="mechanical" title="Mechanical Properties" published>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <PropRow label="Young's modulus E" value={formatEngineeringValue(material.E / 1e9, "GPa", { digits: 1 })} />
                <PropRow label="Shear modulus G" value={formatEngineeringValue(page.shearModulusPa / 1e9, "GPa", { digits: 1 })} />
                <PropRow label="Yield / proof Re" value={formatEngineeringValue(material.yieldStress / 1e6, "MPa", { digits: 0 })} />
                <PropRow label="Ultimate Rm" value={formatEngineeringValue(material.ultimateStrength / 1e6, "MPa", { digits: 0 })} />
                <PropRow label="Density ρ" value={formatEngineeringValue(material.density, "kg/m³", { digits: 0 })} />
                <PropRow label="Poisson's ratio ν" value={formatEngineeringValue(material.poisson, "", { digits: 3 })} />
                {material.enduranceLimit != null ? (
                  <PropRow label="Endurance limit Se" value={formatEngineeringValue(material.enduranceLimit / 1e6, "MPa", { digits: 0 })} />
                ) : null}
                {material.hardnessHB != null ? (
                  <PropRow label="Hardness" value={`${material.hardnessHB} HB`} />
                ) : null}
                {material.shearStrength != null ? (
                  <PropRow label="Shear strength" value={formatEngineeringValue(material.shearStrength / 1e6, "MPa", { digits: 0 })} />
                ) : null}
                {material.bearingStrength != null ? (
                  <PropRow label="Bearing strength" value={formatEngineeringValue(material.bearingStrength / 1e6, "MPa", { digits: 0 })} />
                ) : null}
              </div>
            </Section>

            <Section id="thermal" title="Thermal Properties" published={avail.thermal}>
              <div className="grid gap-x-8 sm:grid-cols-2">
                {material.thermalExpansion != null ? (
                  <PropRow
                    label="Thermal expansion α"
                    value={formatEngineeringValue(material.thermalExpansion * 1e6, "µm/(m·K)", { digits: 1 })}
                  />
                ) : null}
                {material.thermalConductivity != null ? (
                  <PropRow
                    label="Thermal conductivity k"
                    value={formatEngineeringValue(material.thermalConductivity, "W/(m·K)", { digits: 1 })}
                  />
                ) : null}
                {material.specificHeat != null ? (
                  <PropRow label="Specific heat" value={formatEngineeringValue(material.specificHeat, "J/(kg·K)", { digits: 0 })} />
                ) : null}
                {material.meltingPoint != null ? (
                  <PropRow
                    label="Melting / solidus"
                    value={`${formatEngineeringValue(material.meltingPoint, "K", { digits: 0 })} (${formatEngineeringValue(material.meltingPoint - 273.15, "°C", { digits: 0 })})`}
                  />
                ) : null}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                For temperature derating, open{" "}
                <Link
                  href={`/products/materials/temperature-properties?material=${encodeURIComponent(material.name)}`}
                  className="text-blue-600 hover:underline"
                >
                  Temperature Properties
                </Link>
                .
              </p>
            </Section>

            <Section id="electrical" title="Electrical Properties" published={avail.electrical}>
              <div className="grid gap-x-8 sm:grid-cols-2">
                {page.electrical?.resistivity != null ? (
                  <PropRow
                    label="Resistivity"
                    value={formatEngineeringValue(page.electrical.resistivity, "Ω·m", { useExponential: true })}
                  />
                ) : null}
                {page.electrical?.conductivityIacsPct != null ? (
                  <PropRow
                    label="Conductivity"
                    value={`${page.electrical.conductivityIacsPct} % IACS`}
                  />
                ) : null}
              </div>
              {page.electrical?.notes ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{page.electrical.notes}</p>
              ) : null}
            </Section>

            <Section id="composition" title="Chemical Composition" published={avail.composition}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Element</th>
                      <th className="py-2 pr-4 font-semibold">Min wt%</th>
                      <th className="py-2 pr-4 font-semibold">Max wt%</th>
                      <th className="py-2 font-semibold">Typical wt%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.composition.map((row) => (
                      <tr key={row.element} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-1.5 pr-4 font-medium">{row.element}</td>
                        <td className="py-1.5 pr-4 tabular-nums">{row.min ?? "—"}</td>
                        <td className="py-1.5 pr-4 tabular-nums">{row.max ?? "—"}</td>
                        <td className="py-1.5 tabular-nums">{row.typical ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Typical / limit values for reference selection only — verify against mill certs for certified work.
              </p>
            </Section>

            <Section id="applications" title="Applications" published={avail.applications}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {page.applications.map((app) => (
                  <li key={app}>{app}</li>
                ))}
              </ul>
            </Section>

            <Section id="standards" title="Standards" published={avail.standards}>
              <ul className="space-y-2 text-sm">
                {page.standards.map((std) => (
                  <li key={std.code} className="rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">{std.code}</span>
                    {std.title ? <span className="text-slate-500"> — {std.title}</span> : null}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="machinability" title="Machinability" published={avail.machinability}>
              {page.machinabilityIndex != null ? (
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Machinability index:{" "}
                  <span className="font-semibold tabular-nums">{page.machinabilityIndex}</span>
                  <span className="text-slate-500"> (AISI 1212 ≈ 100)</span>
                </p>
              ) : null}
              {page.machinabilityNotes ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{page.machinabilityNotes}</p>
              ) : null}
            </Section>

            <Section id="cost" title="Cost" published={avail.cost}>
              {page.costBand ? (
                <p className="text-sm capitalize text-slate-700 dark:text-slate-300">
                  Relative cost band: <span className="font-semibold">{page.costBand}</span>
                </p>
              ) : null}
              {page.costNotes ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{page.costNotes}</p>
              ) : null}
            </Section>

            <Section id="corrosion" title="Corrosion" published={avail.corrosion}>
              {page.corrosionClass ? (
                <p className="text-sm capitalize text-slate-700 dark:text-slate-300">
                  Class: <span className="font-semibold">{page.corrosionClass}</span>
                </p>
              ) : null}
              {page.corrosionNotes ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{page.corrosionNotes}</p>
              ) : null}
              {page.environments.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {page.environments.map((env) => (
                    <li
                      key={env.name}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-slate-100 px-3 py-1.5 dark:border-slate-800"
                    >
                      <span>{env.name}</span>
                      <span className="capitalize text-slate-500">{env.rating}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                For allowance / life screening, open{" "}
                <Link
                  href={`/products/materials/corrosion?material=${encodeURIComponent(material.name)}`}
                  className="text-blue-600 hover:underline"
                >
                  Corrosion Allowance
                </Link>
                .
              </p>
            </Section>

            <Section id="alternatives" title="Alternatives" published={avail.alternatives}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {page.alternatives.map((alt) => (
                  <li key={alt.id}>
                    <Link
                      href={materialDatasheetHref(alt.id)}
                      className="block rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{alt.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {materialCategoryLabels[alt.category]} · Re{" "}
                        {Math.round(alt.yieldStress / 1e6)} MPa
                        {alt.hasDatasheet ? " · datasheet" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>

        <aside className="mt-6 space-y-4 lg:sticky lg:top-20 lg:mt-0 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Use in calculators</h2>
            <p className="mt-1 text-xs text-slate-500">
              Applies catalog properties into the module via deep link.
            </p>
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
              {targets.map((mod) => (
                <li key={mod.id}>
                  <Link
                    href={`${mod.route}?material=${encodeURIComponent(material.name)}`}
                    className="block rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-slate-50 dark:border-slate-600 dark:text-blue-300 dark:hover:bg-slate-800"
                  >
                    {mod.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Related materials tools</h2>
            <ul className="mt-3 space-y-1.5">
              {relatedCalcs.map((c) => (
                <li key={c.title}>
                  <Link
                    href={c.href}
                    className="block rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
