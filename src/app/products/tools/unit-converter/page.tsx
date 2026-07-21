"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import UnitConverterInputs from "@/components/tools/unit-converter/UnitConverterInputs";
import UnitConverterResults from "@/components/tools/unit-converter/UnitConverterResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import {
  convertToAllUnits,
  solveUnitConverterEngine,
} from "@/lib/tools/unit-converter/engine";
import {
  DIMENSION_DEFAULT_UNITS,
  type UnitConverterDimensionKey,
} from "@/lib/tools/unit-converter/dimensions";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const defaults = DIMENSION_DEFAULT_UNITS.length;
  const [value, setValue] = useState(defaults.value);
  const [dimensionKey, setDimensionKey] = useState<UnitConverterDimensionKey>("length");
  const [fromUnit, setFromUnit] = useState(defaults.from);
  const [toUnit, setToUnit] = useState(defaults.to);

  const { wrapResult } = useStandardCalculation("unit-converter");

  const onDimensionChange = (key: UnitConverterDimensionKey) => {
    const next = DIMENSION_DEFAULT_UNITS[key];
    setDimensionKey(key);
    setFromUnit(next.from);
    setToUnit(next.to);
    setValue(next.value);
  };

  const onSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (Number.isFinite(value)) {
      try {
        const swapped = solveUnitConverterEngine({
          value,
          dimension: dimensionKey,
          fromUnit,
          toUnit,
        });
        setValue(swapped.convertedValue);
      } catch {
        /* keep current value if conversion fails */
      }
    }
  };

  const rawResult = useMemo(() => {
    if (!Number.isFinite(value)) return null;
    try {
      return solveUnitConverterEngine({
        value,
        dimension: dimensionKey,
        fromUnit,
        toUnit,
      });
    } catch {
      return null;
    }
  }, [value, dimensionKey, fromUnit, toUnit]);

  const result = useMemo(
    () => (rawResult ? wrapResult(rawResult) : null),
    [rawResult, wrapResult]
  );

  const equivalents = useMemo(() => {
    if (!Number.isFinite(value)) return [];
    try {
      return convertToAllUnits(value, dimensionKey, fromUnit);
    } catch {
      return [];
    }
  }, [value, dimensionKey, fromUnit]);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      power: value,
    }),
    [value]
  );

  useSyncDesignInputs("unit-converter", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);
  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("unit-converter", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
  };

  return (
    <CalculatorLayout
      moduleId="unit-converter"
      title="Unit Converter"
      inputs={
        <UnitConverterInputs
          value={value}
          setValue={setValue}
          dimensionKey={dimensionKey}
          setDimensionKey={onDimensionChange}
          fromUnit={fromUnit}
          setFromUnit={setFromUnit}
          toUnit={toUnit}
          setToUnit={setToUnit}
          onSwap={onSwap}
          onCalculate={calculate}
        />
      }
      results={
        <UnitConverterResults
          result={result}
          inputValue={value}
          fromUnit={fromUnit}
          equivalents={equivalents}
          dimensionKey={dimensionKey}
        />
      }
    />
  );
}
