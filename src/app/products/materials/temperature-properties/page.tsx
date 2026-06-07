"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import TemperaturePropertiesInputs from "@/components/materials/temperatureProperties/TemperaturePropertiesInputs";
import TemperaturePropertiesResults from "@/components/materials/temperatureProperties/TemperaturePropertiesResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { solveTemperaturePropertiesEngine } from "@/lib/materials/temperatureProperties/engine";
import type {
  TemperaturePropertiesConfig,
  TemperaturePropertiesResult,
} from "@/lib/materials/temperatureProperties/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles["temperature-properties"];

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("temperature-properties", (units) =>
    applyUnitMap(units, {
      baseYield: setYieldUnit,
      baseModulus: setModulusUnit,
      coefficient: setCoeffUnit,
      temperature: setTempUnit,
    })
  );

  const [baseYield, setBaseYield] = useState(250);
  const [yieldUnit, setYieldUnit] = useState(defaults.baseYield.defaultUnit);
  const [baseModulus, setBaseModulus] = useState(210);
  const [modulusUnit, setModulusUnit] = useState(defaults.baseModulus.defaultUnit);
  const [coefficient, setCoefficient] = useState(12e-6);
  const [coeffUnit, setCoeffUnit] = useState(defaults.coefficient.defaultUnit);
  const [temperature, setTemperature] = useState(120);
  const [tempUnit, setTempUnit] = useState(defaults.temperature.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<TemperaturePropertiesResult> | null>(null);

  const runCheck = () => {
    const config: TemperaturePropertiesConfig = {
      baseYield,
      baseModulus,
      coefficientThermalExpansion: coefficient,
      temperature,
    };
    setResult(wrapResult(solveTemperaturePropertiesEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      temperature,
      E: baseModulus * 1e9,
    }), [temperature, baseModulus]);

  useSyncDesignInputs("temperature-properties", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("temperature-properties", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="temperature-properties"
        title="Temperature Derating Calculator"
        left={
          <TemperaturePropertiesInputs
            baseYield={baseYield}
            setBaseYield={setBaseYield}
            yieldUnit={yieldUnit}
            setYieldUnit={setYieldUnit}
            baseModulus={baseModulus}
            setBaseModulus={setBaseModulus}
            modulusUnit={modulusUnit}
            setModulusUnit={setModulusUnit}
            coefficient={coefficient}
            setCoefficient={setCoefficient}
            coeffUnit={coeffUnit}
            setCoeffUnit={setCoeffUnit}
            temperature={temperature}
            setTemperature={setTemperature}
            tempUnit={tempUnit}
            setTempUnit={setTempUnit}
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Temperature derating overview">
            <p>
              Estimates how yield strength and stiffness change with temperature using a conservative linear derating
              factor.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<TemperaturePropertiesResults result={result} />}
      />
  );
}
