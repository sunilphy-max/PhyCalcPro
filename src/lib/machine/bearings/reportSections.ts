/**
 * Curated PDF / Excel sections for rolling bearing selection reports.
 */

import type { BearingResult } from "./types";
import type { RecommendationAdvisor } from "./recommendationAdvisor";
import type { ReportSection } from "@/lib/export/reportSections";
import type { ReportRow } from "@/lib/export/reportPayload";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import type { CsvRow } from "@/lib/export/csvRows";
import { flattenReportSectionsToCsv } from "@/lib/export/reportSections";

function lifeSf(result: BearingResult): number | null {
  if (result.lifeSafetyFactor != null && result.lifeSafetyFactor > 0) return result.lifeSafetyFactor;
  if (result.lifeUtilization > 0 && Number.isFinite(result.lifeUtilization)) {
    return 1 / result.lifeUtilization;
  }
  return null;
}

function statusLabel(result: BearingResult): string {
  if (result.designStatus === "safe") return "PASS";
  if (result.designStatus === "warning") return "MARGINAL";
  return "FAIL";
}

export function buildBearingReportSections(
  result: BearingResult,
  advisor?: RecommendationAdvisor | null
): ReportSection[] {
  const sf = lifeSf(result);
  const f = result.modifiedLifeFactors;
  const sections: ReportSection[] = [];

  sections.push({
    id: "design_summary",
    title: "Design summary",
    rows: [
      { parameter: "Overall status", value: statusLabel(result) },
      { parameter: "Governing mode", value: result.governingFailureMode },
      {
        parameter: "Modified life Lnm",
        value: formatDisplayNumber(result.modifiedLife),
        unit: "h",
      },
      {
        parameter: "Life safety factor",
        value: sf != null ? formatDisplayNumber(sf) : "—",
      },
      {
        parameter: "Static safety s₀",
        value: formatDisplayNumber(result.staticSafetyFactor),
      },
      {
        parameter: "Dynamic utilization P/C",
        value: formatDisplayNumber(result.dynamicUtilization),
      },
      {
        parameter: "Speed margin n_lim/n",
        value: result.speedMargin != null ? formatDisplayNumber(result.speedMargin) : "—",
      },
    ],
  });

  if (result.geometry || result.designation) {
    sections.push({
      id: "catalog",
      title: "Catalog & geometry",
      rows: [
        { parameter: "Designation", value: result.designation ?? "—" },
        { parameter: "Family", value: result.bearingType },
        ...(result.geometry
          ? [
              {
                parameter: "d × D × B",
                value: `${result.geometry.boreMm} × ${result.geometry.outerDiameterMm} × ${result.geometry.widthMm}`,
                unit: "mm",
              } satisfies ReportRow,
            ]
          : []),
        {
          parameter: "Dynamic rating C",
          value: formatDisplayNumber(result.dynamicLoadRatingN / 1000),
          unit: "kN",
        },
        {
          parameter: "Static rating C₀",
          value: formatDisplayNumber(result.staticLoadRatingN / 1000),
          unit: "kN",
        },
        {
          parameter: "Limiting speed",
          value: result.limitingSpeedRpm != null ? String(result.limitingSpeedRpm) : "—",
          unit: "rpm",
        },
      ],
    });
  }

  sections.push({
    id: "domain_factors",
    title: "ISO 281 / SKF life factors",
    rows: [
      {
        parameter: "Basic rating life L₁₀",
        value: formatDisplayNumber(result.expectedLife),
        unit: "h",
        notes: "a₁ · (C/P)^p",
      },
      {
        parameter: "Modified rating life Lnm",
        value: formatDisplayNumber(result.modifiedLife),
        unit: "h",
        notes: "a₁ · aSKF · (C/P)^p",
      },
      { parameter: "Reliability factor a₁", value: formatDisplayNumber(result.a1) },
      {
        parameter: "aSKF (≡ aISO)",
        value: formatDisplayNumber(result.aIso),
        notes: "Effective life modification",
      },
      {
        parameter: "aISO (base)",
        value: formatDisplayNumber(f.aIso),
      },
      {
        parameter: "Viscosity ratio κ",
        value: f.kappa > 0 ? formatDisplayNumber(f.kappa) : "—",
        notes: "ν / ν₁",
      },
      {
        parameter: "Contamination eC (ηc)",
        value: formatDisplayNumber(f.eC),
      },
      {
        parameter: "Operating viscosity ν",
        value: f.nuCst > 0 ? formatDisplayNumber(f.nuCst) : "—",
        unit: "cSt",
      },
      {
        parameter: "Rated viscosity ν₁",
        value: f.nu1Cst > 0 ? formatDisplayNumber(f.nu1Cst) : "—",
        unit: "cSt",
      },
      {
        parameter: "Fatigue Pu / P",
        value: formatDisplayNumber(f.puOverP),
      },
    ],
  });

  const arr = result.arrangementAnalysis;
  if (arr) {
    sections.push({
      id: "arrangement",
      title: `Arrangement analysis · ${arr.arrangementLabel}`,
      narrative: arr.note,
      rows: [
        {
          parameter: "Preload",
          value: formatDisplayNumber(arr.preloadForceN / 1000),
          unit: "kN",
          notes: arr.preloadClass,
        },
        {
          parameter: "Axial stiffness Ka",
          value: formatDisplayNumber(arr.axialStiffnessNPerUm),
          unit: "N/µm",
        },
        {
          parameter: "Radial stiffness Kr",
          value: formatDisplayNumber(arr.radialStiffnessNPerUm),
          unit: "N/µm",
        },
        {
          parameter: "Moment stiffness Km",
          value: formatDisplayNumber(arr.momentStiffnessNmPerMrad),
          unit: "N·m/mrad",
        },
        {
          parameter: "Axial displacement δa",
          value: formatDisplayNumber(arr.axialDisplacementUm),
          unit: "µm",
          notes: arr.axialDisplacementStatus,
        },
        ...(arr.thermalGrowthUm != null
          ? [
              {
                parameter: "Thermal growth",
                value: formatDisplayNumber(arr.thermalGrowthUm),
                unit: "µm",
              } satisfies ReportRow,
            ]
          : []),
      ],
    });
  }

  if (result.pairedStations?.length) {
    sections.push({
      id: "stations",
      title: "Paired stations",
      rows: result.pairedStations.flatMap((s) => [
        {
          parameter: `${s.label ?? `Station ${s.index + 1}`} designation`,
          value: s.designation ?? "—",
        },
        {
          parameter: `${s.label ?? `Station ${s.index + 1}`} Lnm`,
          value: formatDisplayNumber(s.modifiedLifeHours),
          unit: "h",
        },
      ]),
      ...(result.weibullSystemLifeHours != null
        ? {
            bullets: [
              `Weibull system life L_sys ≈ ${formatDisplayNumber(result.weibullSystemLifeHours)} h`,
            ],
          }
        : {}),
    });
  }

  if (advisor) {
    sections.push({
      id: "recommendation",
      title: "Engineering advisor recommendation",
      narrative: advisor.narrative,
      bullets: advisor.reasons,
      rows: [
        { parameter: "Summary", value: advisor.summary },
        { parameter: "Cost band", value: advisor.costBand },
      ],
    });
  }

  return sections;
}

export function buildBearingCsvRows(
  result: BearingResult,
  advisor?: RecommendationAdvisor | null
): CsvRow[] {
  const sections = buildBearingReportSections(result, advisor);
  return flattenReportSectionsToCsv(sections);
}
