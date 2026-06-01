"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import FatigueInputs from "@/components/materials/fatigue/FatigueInputs";
import FatigueResults from "@/components/materials/fatigue/FatigueResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { displayFieldValue, normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { FatigueConfig, FatigueResult } from "@/lib/materials/fatigue/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.fatigue;

export default function Page() {
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
  const [result, setResult] = useState<WithCalculationSpec<FatigueResult> | null>(null);

  const toStressPa = (value: number, unit: string) =>
    normalizeFieldValue("fatigue", "alternatingStress", value, unit);

  const calculate = () => {
    const config: FatigueConfig = {
      alternatingStress: toStressPa(alternatingStress, alternatingUnit),
      meanStress: toStressPa(meanStress, meanUnit),
      ultimateStrength: toStressPa(ultimateStrength, ultimateUnit),
      enduranceLimit: toStressPa(enduranceLimit, enduranceUnit),
      meanStressMethod,
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

  return (
          <CalculatorLayout
        moduleId="fatigue"
        title="Fatigue Life Calculator"
        left={
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
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Fatigue overview">
            <p>
              Evaluates a Goodman-style fatigue criterion and estimates allowable alternating stress for cyclic
              loading.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<FatigueResults result={result} alternatingUnit={alternatingUnit} />}
      />
  );
}
