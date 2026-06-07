"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import UnitConverterInputs, {
  type UnitConverterDimensionKey,
} from "@/components/tools/unit-converter/UnitConverterInputs";
import UnitConverterResults from "@/components/tools/unit-converter/UnitConverterResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import { solveUnitConverterEngine } from "@/lib/tools/unit-converter/engine";
import type { UnitConverterResult } from "@/lib/tools/unit-converter/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const [value, setValue] = useState(1000);
  const [dimensionKey, setDimensionKey] = useState<UnitConverterDimensionKey>("length");
  const [fromUnit, setFromUnit] = useState("mm");
  const [toUnit, setToUnit] = useState("in");
  const [result, setResult] = useState<(UnitConverterResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const { wrapResult } = useStandardCalculation("unit-converter");

  const onDimensionChange = (key: UnitConverterDimensionKey) => {
    const profile = getModuleFieldProfile("unit-converter", key);
    setDimensionKey(key);
    if (profile) {
      const [first, second] = profile.units;
      setFromUnit(profile.defaultUnit);
      setToUnit(second ?? first ?? profile.defaultUnit);
    }
    setResult(null);
  };

  const runCheck = () => {
    const profile = getModuleFieldProfile("unit-converter", dimensionKey);
    setResult(
      wrapResult(
        solveUnitConverterEngine({
          value,
          dimension: profile?.dimension ?? dimensionKey,
          fromUnit,
          toUnit,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: value,
    }), [value]);

  useSyncDesignInputs("unit-converter", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("unit-converter", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="unit-converter"
      title="Unit Converter"
      left={
        <UnitConverterInputs
          value={value}
          setValue={setValue}
          dimensionKey={dimensionKey}
          setDimensionKey={onDimensionChange}
          fromUnit={fromUnit}
          setFromUnit={setFromUnit}
          toUnit={toUnit}
          setToUnit={setToUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Unit converter">
          <p>
            Uses the shared unit conversion layer (SI base values). Select the physical dimension first, then
            pick compatible from and to units.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<UnitConverterResults result={result} inputValue={value} fromUnit={fromUnit} />}
    />
  );
}
