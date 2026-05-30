"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CorrosionInputs from "@/components/materials/corrosion/CorrosionInputs";
import CorrosionResults from "@/components/materials/corrosion/CorrosionResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { fromBaseUnit, toBaseUnit } from "@/lib/physics/units";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import type { CorrosionConfig, CorrosionResult } from "@/lib/materials/corrosion/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.corrosion;

export default function Page() {
  const { wrapResult } = useStandardCalculation("corrosion", (units) =>
    applyUnitMap(units, {
      initialThickness: setThicknessUnit,
      corrosionRate: setRateUnit,
      designLife: setLifeUnit,
      safetyMargin: setMarginUnit,
    })
  );

  const [initialThickness, setInitialThickness] = useState(10);
  const [thicknessUnit, setThicknessUnit] = useState(defaults.initialThickness.defaultUnit);
  const [corrosionRate, setCorrosionRate] = useState(0.2);
  const [rateUnit, setRateUnit] = useState(defaults.corrosionRate.defaultUnit);
  const [designLife, setDesignLife] = useState(10);
  const [lifeUnit, setLifeUnit] = useState(defaults.designLife.defaultUnit);
  const [safetyMargin, setSafetyMargin] = useState(25);
  const [marginUnit, setMarginUnit] = useState(defaults.safetyMargin.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<CorrosionResult> | null>(null);

  const calculate = () => {
    const config: CorrosionConfig = {
      initialThickness: fromBaseUnit(
        normalizeFieldValue("corrosion", "initialThickness", initialThickness, thicknessUnit),
        "length",
        "mm"
      ),
      corrosionRate: fromBaseUnit(
        normalizeFieldValue("corrosion", "corrosionRate", corrosionRate, rateUnit),
        "lengthPerTime",
        "mm/year"
      ),
      designLife: fromBaseUnit(
        normalizeFieldValue("corrosion", "designLife", designLife, lifeUnit),
        "time",
        "year"
      ),
      safetyMargin: marginUnit === "%" ? safetyMargin : safetyMargin * 100,
    };
    const raw = solveCorrosionEngine(config);
    const toDisplayLength = (mmValue: number) =>
      fromBaseUnit(toBaseUnit(mmValue, "length", "mm"), "length", thicknessUnit);

    setResult(
      wrapResult({
        ...raw,
        corrosionAllowance: toDisplayLength(raw.corrosionAllowance),
        requiredThickness: toDisplayLength(raw.requiredThickness),
        remainingThickness: toDisplayLength(raw.remainingThickness),
      })
    );
  };

  return (
    <DashboardLayout title="Corrosion Allowance">
      <CalculatorLayout
        moduleId="corrosion"
        title="Corrosion Allowance Calculator"
        left={
          <CorrosionInputs
            initialThickness={initialThickness}
            setInitialThickness={setInitialThickness}
            thicknessUnit={thicknessUnit}
            setThicknessUnit={setThicknessUnit}
            corrosionRate={corrosionRate}
            setCorrosionRate={setCorrosionRate}
            rateUnit={rateUnit}
            setRateUnit={setRateUnit}
            designLife={designLife}
            setDesignLife={setDesignLife}
            lifeUnit={lifeUnit}
            setLifeUnit={setLifeUnit}
            safetyMargin={safetyMargin}
            setSafetyMargin={setSafetyMargin}
            marginUnit={marginUnit}
            setMarginUnit={setMarginUnit}
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Corrosion overview">
            <p>
              Produces a corrosion allowance from uniform loss rate and design life, then applies a safety
              margin to the thickness requirement.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<CorrosionResults result={result} thicknessUnit={thicknessUnit} />}
      />
    </DashboardLayout>
  );
}
