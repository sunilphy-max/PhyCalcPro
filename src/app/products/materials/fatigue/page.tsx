"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import FatigueInputs from "@/components/materials/fatigue/FatigueInputs";
import FatigueResults from "@/components/materials/fatigue/FatigueResults";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { displayFieldValue, normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { FatigueConfig, FatigueResult, FatigueLoadType, SurfaceFinish } from "@/lib/materials/fatigue/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.fatigue;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("fatigue", (units) =>
    applyUnitMap(units, {
      alternatingStress: setAlternatingUnit,
      meanStress: setMeanUnit,
      ultimateStrength: setUltimateUnit,
      enduranceLimit: setEnduranceUnit,
    })
  );

  const [alternatingStress, setAlternatingStress] = useState(120);
  const [alternatingUnit, setAlternatingUnit] = useState(defaults.alternatingStress.defaultUnit);
  const [meanStress, setMeanStress] = useState(30);
  const [meanUnit, setMeanUnit] = useState(defaults.meanStress.defaultUnit);
  const [ultimateStrength, setUltimateStrength] = useState(520);
  const [ultimateUnit, setUltimateUnit] = useState(defaults.ultimateStrength.defaultUnit);
  const [enduranceLimit, setEnduranceLimit] = useState(240);
  const [enduranceUnit, setEnduranceUnit] = useState(defaults.enduranceLimit.defaultUnit);
  const [meanStressMethod, setMeanStressMethod] = useState<"goodman" | "gerber" | "morrow">("goodman");
  const [surfaceFinish, setSurfaceFinish] = useState<SurfaceFinish>("machined");
  const [loadType, setLoadType] = useState<FatigueLoadType>("bending");
  const [result, setResult] = useState<WithCalculationSpec<FatigueResult> | null>(null);

  const toStressPa = (value: number, unit: string) =>
    normalizeFieldValue("fatigue", "alternatingStress", value, unit);

  const runCheck = () => {
    const config: FatigueConfig = {
      alternatingStress: toStressPa(alternatingStress, alternatingUnit),
      meanStress: toStressPa(meanStress, meanUnit),
      ultimateStrength: toStressPa(ultimateStrength, ultimateUnit),
      enduranceLimit: toStressPa(enduranceLimit, enduranceUnit),
      meanStressMethod,
      surfaceFinish,
      loadType,
    };
    const raw = solveFatigueEngine(config);
    setResult(
      wrapResult({
        ...raw,
        allowableStress: displayFieldValue("fatigue", "alternatingStress", raw.allowableStress, alternatingUnit),
        correctedEndurance: displayFieldValue("fatigue", "enduranceLimit", raw.correctedEndurance, enduranceUnit),
      })
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      stressAmplitude: alternatingStress * 1e6,
      meanStress: meanStress * 1e6,
      enduranceLimit: enduranceLimit * 1e6,
      targetCycles: 1e6,
    }), [alternatingStress, meanStress, enduranceLimit]);

  useSyncDesignInputs("fatigue", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    alternatingStress: (v) => setAlternatingStress(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("fatigue", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="fatigue"
        title="Fatigue Life Calculator"
        inputs={
          <>
            <CrossCalcHandoffBanner
              moduleId="fatigue"
              onApply={(params) => {
                if (params.alternatingStress != null) {
                  setAlternatingStress(
                    displayFieldValue("fatigue", "alternatingStress", params.alternatingStress, alternatingUnit)
                  );
                }
                if (params.meanStress != null) {
                  setMeanStress(
                    displayFieldValue("fatigue", "meanStress", params.meanStress, meanUnit)
                  );
                }
              }}
            />
            <FatigueInputs
            alternatingStress={alternatingStress}
            setAlternatingStress={setAlternatingStress}
            alternatingUnit={alternatingUnit}
            setAlternatingUnit={setAlternatingUnit}
            meanStress={meanStress}
            setMeanStress={setMeanStress}
            meanUnit={meanUnit}
            setMeanUnit={setMeanUnit}
            ultimateStrength={ultimateStrength}
            setUltimateStrength={setUltimateStrength}
            ultimateUnit={ultimateUnit}
            setUltimateUnit={setUltimateUnit}
            enduranceLimit={enduranceLimit}
            setEnduranceLimit={setEnduranceLimit}
            enduranceUnit={enduranceUnit}
            setEnduranceUnit={setEnduranceUnit}
            meanStressMethod={meanStressMethod}
            setMeanStressMethod={setMeanStressMethod}
            surfaceFinish={surfaceFinish}
            setSurfaceFinish={setSurfaceFinish}
            loadType={loadType}
            setLoadType={setLoadType}
            onCalculate={calculate}
          />
          </>
        }
        results={
          <FatigueResults
            result={result}
            alternatingUnit={alternatingUnit}
            chartInputs={
              result
                ? {
                    meanStress,
                    alternatingStress,
                    ultimateStrength,
                    stressUnit: alternatingUnit,
                  }
                : undefined
            }
          />
        }
      />
  );
}
