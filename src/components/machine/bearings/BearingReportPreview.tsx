"use client";

import type { ReportRow } from "@/lib/export/reportPayload";
import ModuleReportPreview from "@/components/machine/bearings-shared/ModuleReportPreview";

type Props = {
  inputRows: ReportRow[];
  hasResult: boolean;
};

const REPORT_SECTIONS = [
  "Design summary (PASS / MARGINAL / FAIL + key margins)",
  "Input summary (loads, speed, life target, lubrication, arrangement)",
  "Catalog designation and geometry",
  "ISO 281 / SKF factors — L₁₀, Lnm, a₁, aSKF, κ, eC, ν / ν₁, Pu/P",
  "Arrangement analysis (preload, Ka/Kr/Km, δa, thermal, O/X/T) when duplex",
  "Engineering advisor recommendation narrative",
  "Paired stations and Weibull system life when applicable",
  "Engineering checks, key formulas, and standards basis",
  "Life vs load charts (captured for PDF / Excel)",
  "Assumptions and disclaimer",
];

export default function BearingReportPreview({ inputRows, hasResult }: Props) {
  return (
    <ModuleReportPreview
      title="Professional bearing report (PDF / Excel)"
      description="Structured export with design summary, ISO 281 factors, arrangement analysis, and advisor narrative."
      sections={REPORT_SECTIONS}
      inputRows={inputRows}
      hasResult={hasResult}
    />
  );
}
