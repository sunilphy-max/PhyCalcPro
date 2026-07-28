import type { DesignCodeId, CalculationSpec, WorksheetStep } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { ShaftResult } from "@/lib/machine/shafts/types";
import { buildShaftCodeChecks, shaftCodeMethod } from "../codeChecks/shafts";

export function attachShaftCalculationSpec(
  result: ShaftResult,
  designCode: DesignCodeId
): ShaftResult & { calculationSpec: CalculationSpec } {
  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeSafetyFactorCheck(
            "von_mises",
            "Combined stress safety factor",
            result.safetyFactor,
            designCode
          ),
          ...(result.fatigueSafetyFactor != null
            ? [
                makeSafetyFactorCheck(
                  "fatigue",
                  "Fatigue safety (Goodman)",
                  result.fatigueSafetyFactor,
                  designCode
                ),
              ]
            : []),
          ...(result.criticalSpeedMargin != null
            ? [
                makeSafetyFactorCheck(
                  "critical_speed",
                  "Critical speed margin",
                  result.criticalSpeedMargin,
                  designCode
                ),
              ]
            : []),
          ...(result.din743Worksheet
            ? buildShaftCodeChecks(result, designCode).filter((c) =>
                c.id.startsWith("din743")
              )
            : []),
        ]
      : buildShaftCodeChecks(result, designCode);

  const din = result.din743Worksheet;
  const worksheetSteps: WorksheetStep[] | undefined = din
    ? [
        { label: "Material (DIN 743-3)", symbol: "Mat", value: din.materialDesignation },
        { label: "Heat treatment", symbol: "HT", value: din.heatTreatment },
        { label: "Technological size K1", symbol: "K1", value: din.K1_strength.toFixed(3) },
        { label: "Roughness Rz", symbol: "Rz", value: `${din.Rz_um.toFixed(1)} µm` },
        { label: "Surface KV", symbol: "KV", value: din.KV.toFixed(3) },
        { label: "Auto K_σ (governing)", symbol: "K_σ", value: din.autoK_sigma.toFixed(3) },
        { label: "Auto K_τ (governing)", symbol: "K_τ", value: din.autoK_tau.toFixed(3) },
        { label: "γ_F (governing)", symbol: "γ_F", value: din.autoGamma_F.toFixed(3) },
        {
          label: "DIN fatigue S",
          symbol: "S_f",
          value: din.governingFatigueSF.toFixed(2),
        },
        {
          label: "DIN static S",
          symbol: "S_s",
          value: din.governingStaticSF.toFixed(2),
        },
        {
          label: "Stations evaluated",
          symbol: "n",
          value: String(din.stations.length),
        },
        ...(result.agma6001Template
          ? [
              {
                label: "AGMA 6001 Ka",
                symbol: "Ka",
                value: result.agma6001Template.Ka.toFixed(2),
              },
              {
                label: "AGMA 6001 interface",
                symbol: "IF",
                value: result.agma6001Template.kind,
              },
            ]
          : []),
      ]
    : undefined;

  const calculationSpec = buildCalculationSpec({
    moduleId: "shafts",
    designCode,
    method: shaftCodeMethod(designCode),
    implementedChecks,
    worksheetSteps,
  });

  return { ...result, calculationSpec };
}
