import { describe, expect, it } from "vitest";
import {
  buildInputRowsFromUserInputs,
  buildReportPayload,
  formatCheckSummaryText,
  normalizeCsvRow,
  normalizeResultRows,
  summarizeChecks,
} from "@/lib/export/reportPayload";

describe("reportPayload", () => {
  it("humanizes metric keys when label is absent", () => {
    const row = normalizeCsvRow({ metric: "hoopStress", value: 120e6 });
    expect(row.parameter).toBe("Hoop Stress");
    expect(row.value).toBe("1.2000e+8");
  });

  it("preserves explicit labels and units from module csv rows", () => {
    const row = normalizeCsvRow({
      metric: "maxStress",
      label: "Maximum stress",
      value: 250,
      unit: "MPa",
    });
    expect(row.parameter).toBe("Maximum stress");
    expect(row.value).toBe("250");
    expect(row.unit).toBe("MPa");
  });

  it("builds input rows from design workflow user inputs", () => {
    const rows = buildInputRowsFromUserInputs({
      length: 2.5,
      lengthUnit: "m",
      power: 15000,
      powerUnit: "W",
      loads: [{ id: "l1", type: "point", value: 1, position: 0.5 }],
    });
    expect(rows.some((r) => r.parameter === "Length" && r.value === "2.5" && r.unit === "m")).toBe(
      true
    );
    expect(rows.some((r) => r.parameter === "Power" && r.unit === "W")).toBe(true);
    expect(rows.some((r) => r.parameter === "Loads")).toBe(false);
  });

  it("prefers explicit input rows over user input fallback", () => {
    const payload = buildReportPayload({
      fileName: "shaft",
      moduleTitle: "Shaft analysis",
      inputRows: [{ parameter: "Diameter", value: "50", unit: "mm" }],
      userInputs: { length: 1.2, lengthUnit: "m" },
      resultRows: [{ metric: "safetyFactor", value: 2.1 }],
    });
    expect(payload.inputRows).toEqual([
      { parameter: "Diameter", value: "50", unit: "mm" },
    ]);
    expect(payload.resultRows[0]?.parameter).toBe("Safety Factor");
  });

  it("summarizes engineering check statuses", () => {
    const summary = summarizeChecks(["pass", "pass", "warning", "fail"]);
    expect(formatCheckSummaryText(summary)).toBe("2 pass · 1 warning · 1 fail");
  });

  it("includes branding and check summary in payload", () => {
    const payload = buildReportPayload({
      fileName: "shell-report",
      moduleTitle: "Shell stress",
      spec: {
        moduleId: "shells",
        designCode: "INDICATIVE",
        method: "Membrane theory",
        validationStatus: "indicative",
        standards: [],
        equations: [],
        assumptions: ["Thin wall"],
        limitations: [],
        checks: [
          {
            id: "sf",
            label: "Safety factor",
            metricKind: "safety_factor",
            status: "pass",
            value: 2.5,
            limit: 1.5,
          },
        ],
        engineVersion: "0.1.0",
        computedAt: new Date().toISOString(),
      },
      resultRows: normalizeResultRows([{ metric: "vonMisesStress", value: 100e6 }]),
    });

    expect(payload.productName).toBe("PhyCalcPro");
    expect(payload.siteUrl).toMatch(/^https?:\/\//);
    expect(payload.checkSummary?.pass).toBe(1);
    expect(payload.disclaimer).toContain("design-assist");
  });
});
