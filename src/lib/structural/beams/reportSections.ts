/**
 * Curated PDF / Excel sections for beam design-review reports (EDP-6 pilot).
 */

import type { BeamResult, Load } from "./types";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ReportSection } from "@/lib/export/reportSections";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { CsvRow } from "@/lib/export/csvRows";
import { flattenReportSectionsToCsv } from "@/lib/export/reportSections";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import type { Material } from "@/data/materials";

export type BeamReportContext = {
  projectName?: string;
  length: number;
  lengthUnit?: string;
  support: string;
  sectionDesignation?: string;
  I: number;
  c: number;
  loads: Load[];
  meshSegments?: number;
  material?: Material | null;
  calculationSpec?: CalculationSpec | null;
};

function checkStatusLabel(spec: CalculationSpec | null | undefined): string {
  if (!spec?.checks?.length) return "NOT RUN";
  if (spec.checks.some((c) => c.status === "fail")) return "FAIL";
  if (spec.checks.some((c) => c.status === "warning")) return "MARGINAL";
  if (spec.checks.every((c) => c.status === "pass" || c.status === "indicative" || c.status === "not_available")) {
    const actionable = spec.checks.filter((c) => c.status === "pass" || c.status === "indicative");
    if (actionable.length === 0) return "INCOMPLETE";
    if (actionable.some((c) => c.status === "indicative")) return "INDICATIVE PASS";
    return "PASS";
  }
  return "REVIEW";
}

function governingCheck(spec: CalculationSpec | null | undefined): string {
  if (!spec?.checks?.length) return "—";
  const failed = spec.checks.find((c) => c.status === "fail");
  if (failed) return failed.label;
  const warn = spec.checks.find((c) => c.status === "warning");
  if (warn) return warn.label;
  const util = [...spec.checks]
    .filter((c) => c.metricKind === "utilization" && typeof c.value === "number")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  return util?.label ?? spec.checks[0]?.label ?? "—";
}

function loadSummary(loads: Load[]): string {
  if (!loads.length) return "None";
  return loads
    .map((l) => {
      if (l.type === "point") return `Point ${formatDisplayNumber(l.value)} @ ${formatDisplayNumber(l.position)}`;
      if (l.type === "moment") return `Moment ${formatDisplayNumber(l.value)} @ ${formatDisplayNumber(l.position)}`;
      if (l.type === "udl")
        return `UDL ${formatDisplayNumber(l.value)} [${formatDisplayNumber(l.start)}–${formatDisplayNumber(l.end)}]`;
      return `Triangular ${formatDisplayNumber(l.wStart)}→${formatDisplayNumber(l.wEnd)} [${formatDisplayNumber(l.start)}–${formatDisplayNumber(l.end)}]`;
    })
    .join("; ");
}

export function buildBeamInputRows(ctx: BeamReportContext): ReportRow[] {
  return [
    { parameter: "Project", value: ctx.projectName ?? "—" },
    { parameter: "Span length", value: formatDisplayNumber(ctx.length), unit: ctx.lengthUnit ?? "m" },
    { parameter: "Support", value: ctx.support },
    {
      parameter: "Section",
      value: ctx.sectionDesignation?.trim() || "Custom",
    },
    { parameter: "I", value: formatDisplayNumber(ctx.I), unit: "m⁴" },
    { parameter: "c", value: formatDisplayNumber(ctx.c), unit: "m" },
    { parameter: "Loads", value: loadSummary(ctx.loads) },
    {
      parameter: "Mesh segments",
      value: ctx.meshSegments != null ? String(ctx.meshSegments) : "—",
    },
    { parameter: "Material", value: ctx.material?.name ?? "—" },
  ];
}

export function buildBeamReportSections(
  result: BeamResult,
  ctx: BeamReportContext
): ReportSection[] {
  const spec =
    ctx.calculationSpec ??
    (result as BeamResult & { calculationSpec?: CalculationSpec }).calculationSpec ??
    null;
  const status = checkStatusLabel(spec);
  const governing = governingCheck(spec);
  const sections: ReportSection[] = [];

  sections.push({
    id: "design_summary",
    title: "Design summary",
    rows: [
      { parameter: "Overall status", value: status },
      { parameter: "Governing check", value: governing },
      {
        parameter: "Max moment",
        value: formatDisplayNumber(result.maxMoment),
        unit: "N·m",
      },
      {
        parameter: "Max shear",
        value: formatDisplayNumber(result.maxShear),
        unit: "N",
      },
      {
        parameter: "Max stress",
        value: formatDisplayNumber(result.maxStress / 1e6),
        unit: "MPa",
      },
      {
        parameter: "Max deflection",
        value: formatDisplayNumber(result.maxDeflection * 1000),
        unit: "mm",
      },
    ],
  });

  if (spec?.assumptions?.length) {
    sections.push({
      id: "assumptions",
      title: "Assumptions",
      bullets: spec.assumptions,
    });
  }

  if (spec?.equations?.length) {
    sections.push({
      id: "equations",
      title: "Equations",
      bullets: spec.equations.map((eq) => `${eq.label}: ${eq.expression}`),
      rows: spec.equations.map((eq) => ({
        parameter: eq.label,
        value: eq.expression,
        notes: eq.description,
      })),
    });
  }

  if (spec?.standards?.length) {
    sections.push({
      id: "standards",
      title: "Standards",
      rows: spec.standards.map((s) => ({
        parameter: `${s.body} ${s.document}`,
        value: s.note ?? "—",
      })),
    });
  }

  const intermediateRows: ReportRow[] = [
    {
      parameter: "Peak moment",
      value: formatDisplayNumber(result.maxMoment),
      unit: "N·m",
    },
    {
      parameter: "Peak shear",
      value: formatDisplayNumber(result.maxShear),
      unit: "N",
    },
    {
      parameter: "Peak bending stress",
      value: formatDisplayNumber(result.maxStress / 1e6),
      unit: "MPa",
      notes: "σ = M c / I",
    },
    {
      parameter: "Peak deflection",
      value: formatDisplayNumber(result.maxDeflection * 1000),
      unit: "mm",
    },
  ];
  for (const r of result.supportReactions ?? []) {
    intermediateRows.push({
      parameter: `Reaction ${r.supportId} Fy`,
      value: formatDisplayNumber(r.Fy),
      unit: "N",
    });
    if (r.Mz != null) {
      intermediateRows.push({
        parameter: `Reaction ${r.supportId} Mz`,
        value: formatDisplayNumber(r.Mz),
        unit: "N·m",
      });
    }
  }
  if (spec?.worksheetSteps?.length) {
    for (const step of spec.worksheetSteps) {
      intermediateRows.push({
        parameter: step.label,
        value: step.value,
        unit: step.unit,
        notes: step.symbol,
      });
    }
  }
  sections.push({
    id: "intermediates",
    title: "Intermediate calculations",
    rows: intermediateRows,
  });

  if (spec?.checks?.length) {
    sections.push({
      id: "checks",
      title: "Safety checks",
      rows: spec.checks.map((c) => ({
        parameter: c.label,
        value:
          c.value != null
            ? formatDisplayNumber(c.value)
            : c.status.toUpperCase(),
        unit: c.unit ?? (c.metricKind === "utilization" ? "—" : undefined),
        notes: `${c.status.toUpperCase()}${
          c.standardRef
            ? ` · ${c.standardRef.body} ${c.standardRef.document}${c.standardRef.clause ? ` ${c.standardRef.clause}` : ""}`
            : ""
        }`,
      })),
    });
  }

  if (ctx.material) {
    sections.push({
      id: "materials",
      title: "Material properties",
      rows: [
        { parameter: "Grade", value: ctx.material.name },
        {
          parameter: "Young's modulus E",
          value: formatDisplayNumber(ctx.material.E / 1e9),
          unit: "GPa",
        },
        {
          parameter: "Yield stress Fy",
          value: formatDisplayNumber((ctx.material.yieldStress ?? 0) / 1e6),
          unit: "MPa",
        },
        {
          parameter: "Density",
          value: formatDisplayNumber(ctx.material.density),
          unit: "kg/m³",
        },
        {
          parameter: "Thermal expansion α",
          value: formatDisplayNumber((ctx.material.thermalExpansion ?? 0) * 1e6),
          unit: "µ/°C",
        },
      ],
    });
  }

  const conclusionNarrative =
    status === "PASS" || status === "INDICATIVE PASS"
      ? `Beam design ${status === "PASS" ? "satisfies" : "indicatively satisfies"} the evaluated limit states. Governing check: ${governing}. Attach this report to the design review package.`
      : status === "FAIL"
        ? `Beam design fails one or more limit states. Governing check: ${governing}. Resize the section, reduce loads, or revise supports before release.`
        : status === "MARGINAL"
          ? `Beam design is marginal against ${governing}. Review utilization margins and serviceability before release.`
          : `Beam calculation complete. Review checks and assumptions before attaching to a design review.`;

  sections.push({
    id: "conclusion",
    title: "Conclusion",
    narrative: conclusionNarrative,
    rows: [
      { parameter: "Status", value: status },
      { parameter: "Governing check", value: governing },
      { parameter: "Design code", value: spec?.designCode ?? "—" },
      { parameter: "Method", value: spec?.method ?? "—" },
    ],
  });

  return sections;
}

export function buildBeamCsvRows(result: BeamResult, ctx: BeamReportContext): CsvRow[] {
  const sections = buildBeamReportSections(result, ctx);
  const inputCsv = buildBeamInputRows(ctx).map((row) => ({
    metric: `input.${row.parameter}`,
    value: row.unit ? `${row.value} ${row.unit}` : row.value,
    notes: row.notes ?? "",
  }));
  return [...inputCsv, ...flattenReportSectionsToCsv(sections)];
}
