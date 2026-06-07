"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useCallback, useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import FormulaReferenceInputs, {
  defaultFormulaInputs,
  defaultFormulaInputUnits,
} from "@/components/tools/formula-reference/FormulaReferenceInputs";
import FormulaReferenceResults from "@/components/tools/formula-reference/FormulaReferenceResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { toBase } from "@/lib/units/conversions";
import { solveFormulaReferenceEngine } from "@/lib/tools/formula-reference/engine";
import { FORMULA_INPUTS } from "@/lib/tools/formula-reference/formulas";
import type { FormulaReferenceResult } from "@/lib/tools/formula-reference/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import type { PhysicsDimension } from "@/lib/physics/units";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const [formulaId, setFormulaId] = useState("kinetic_energy");
  const [inputs, setInputs] = useState(() => defaultFormulaInputs("kinetic_energy"));
  const [inputUnits, setInputUnits] = useState(() => defaultFormulaInputUnits("kinetic_energy"));
  const [result, setResult] = useState<(FormulaReferenceResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const { wrapResult } = useStandardCalculation("formula-reference", (units) => {
    const next: Record<string, string> = {};
    for (const [profileKey, unit] of Object.entries(units)) {
      const field = (FORMULA_INPUTS[formulaId] ?? []).find((f) => f.moduleFieldKey === profileKey);
      if (field) next[field.key] = unit;
    }
    setInputUnits((prev) => ({ ...prev, ...next }));
  });

  const setInput = useCallback((key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setInputUnit = useCallback((key: string, unit: string) => {
    setInputUnits((prev) => ({ ...prev, [key]: unit }));
  }, []);

  const onFormulaChange = (id: string) => {
    setFormulaId(id);
    setInputs(defaultFormulaInputs(id));
    setInputUnits(defaultFormulaInputUnits(id));
    setResult(null);
  };

  const toBaseInputs = () => {
    const base: Record<string, number> = { ...inputs };
    for (const field of FORMULA_INPUTS[formulaId] ?? []) {
      if (!field.moduleFieldKey) continue;
      const profile = getModuleFieldProfile("formula-reference", field.moduleFieldKey);
      if (!profile) continue;
      const unit = inputUnits[field.key] ?? profile.defaultUnit;
      base[field.key] = toBase(inputs[field.key] ?? 0, profile.dimension as PhysicsDimension, unit);
    }
    return base;
  };

  const runCheck = () => {
    setResult(wrapResult(solveFormulaReferenceEngine({ formulaId, inputs: toBaseInputs() })));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({

    }), []);

  useSyncDesignInputs("formula-reference", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("formula-reference", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="formula-reference"
      title="Engineering Formulas"
      left={
        <FormulaReferenceInputs
          formulaId={formulaId}
          setFormulaId={onFormulaChange}
          inputs={inputs}
          setInput={setInput}
          inputUnits={inputUnits}
          setInputUnit={setInputUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Formula reference">
          <p>
            Screening calculations for common mechanics and fluids relationships. Confirm units and
            assumptions before using results in design checks.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<FormulaReferenceResults result={result} />}
    />
  );
}
