"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import PinInputs from "@/components/fasteners/pins/PinInputs";
import PinResults from "@/components/fasteners/pins/PinResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solvePinEngine } from "@/lib/fasteners/pins/engine";
import type { PinResult } from "@/lib/fasteners/pins/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
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

  const calculate = () => {
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

  return (
    <CalculatorLayout
      moduleId="pins"
      title="Pin & Clevis"
      left={
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
      center={
        <CalculatorGuidancePanel title="Pins & clevis joints">
          <p>
            Single-shear pins are checked for direct shear and bearing on the plate. Allowable shear is 0.6×σy
            and bearing 1.5×σy. Use multiple pins when load sharing is uniform.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<PinResults result={result} stressUnit={stressUnit} />}
    />
  );
}
