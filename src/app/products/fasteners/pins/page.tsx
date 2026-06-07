"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PinInputs from "@/components/fasteners/pins/PinInputs";
import PinResults from "@/components/fasteners/pins/PinResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solvePinEngine } from "@/lib/fasteners/pins/engine";
import type { PinResult } from "@/lib/fasteners/pins/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("pins", (units) =>
    applyUnitMap(units, {
      force: setForceUnit,
      pinDiameter: setLengthUnit,
      plateThickness: setLengthUnit,
      stress: setStressUnit,
    })
  );

  const [force, setForce] = useState(20);
  const [forceUnit, setForceUnit] = useState("kN");
  const [pinDiameter, setPinDiameter] = useState(16);
  const [plateThickness, setPlateThickness] = useState(12);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [pinMaterialYield, setPinMaterialYield] = useState(350);
  const [stressUnit, setStressUnit] = useState("MPa");
  const [pinCount, setPinCount] = useState(1);
  const [result, setResult] = useState<(PinResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solvePinEngine({
          force: toBase(force, "force", forceUnit),
          pinDiameter: toBase(pinDiameter, "length", lengthUnit),
          plateThickness: toBase(plateThickness, "length", lengthUnit),
          pinMaterialYield: toBase(pinMaterialYield, "stress", stressUnit),
          pinCount: Math.max(1, Math.round(pinCount)),
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      shearForce: toBase(force, "force", forceUnit),
      shaftDiameter: toBase(pinDiameter, "length", lengthUnit),
    }), [force, forceUnit, pinDiameter, lengthUnit]);

  useSyncDesignInputs("pins", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    pinDiameter: (v) => setPinDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("pins", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="pins"
      title="Pin & Clevis"
      inputs={
        <PinInputs
          force={force}
          setForce={setForce}
          forceUnit={forceUnit}
          setForceUnit={setForceUnit}
          pinDiameter={pinDiameter}
          setPinDiameter={setPinDiameter}
          plateThickness={plateThickness}
          setPlateThickness={setPlateThickness}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          pinMaterialYield={pinMaterialYield}
          setPinMaterialYield={setPinMaterialYield}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          pinCount={pinCount}
          setPinCount={setPinCount}
          onCalculate={calculate}
        />
      }
      results={<PinResults result={result} stressUnit={stressUnit} />}
    />
  );
}
