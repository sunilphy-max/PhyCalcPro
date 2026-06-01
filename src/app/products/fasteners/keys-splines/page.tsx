"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import KeysSplinesInputs from "@/components/fasteners/keys-splines/KeysSplinesInputs";
import KeysSplinesResults from "@/components/fasteners/keys-splines/KeysSplinesResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveKeysSplinesEngine } from "@/lib/fasteners/keys-splines/engine";
import type { KeysSplinesResult } from "@/lib/fasteners/keys-splines/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("keys-splines", (units) =>
    applyUnitMap(units, {
      torque: setTorqueUnit,
      shaftDiameter: setLengthUnit,
      keyWidth: setLengthUnit,
      keyHeight: setLengthUnit,
      keyLength: setLengthUnit,
      stress: setStressUnit,
    })
  );

  const [torque, setTorque] = useState(500);
  const [torqueUnit, setTorqueUnit] = useState("N·m");
  const [shaftDiameter, setShaftDiameter] = useState(40);
  const [keyWidth, setKeyWidth] = useState(12);
  const [keyHeight, setKeyHeight] = useState(8);
  const [keyLength, setKeyLength] = useState(60);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [yieldStress, setYieldStress] = useState(350);
  const [stressUnit, setStressUnit] = useState("MPa");
  const [keyType, setKeyType] = useState<"parallel" | "spline">("parallel");
  const [splineTeeth, setSplineTeeth] = useState(6);
  const [result, setResult] = useState<(KeysSplinesResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    setResult(
      wrapResult(
        solveKeysSplinesEngine({
          torque: toBase(torque, "torque", torqueUnit),
          shaftDiameter: toBase(shaftDiameter, "length", lengthUnit),
          keyWidth: toBase(keyWidth, "length", lengthUnit),
          keyHeight: toBase(keyHeight, "length", lengthUnit),
          keyLength: toBase(keyLength, "length", lengthUnit),
          yieldStress: toBase(yieldStress, "stress", stressUnit),
          keyType,
          splineTeeth: keyType === "spline" ? Math.max(1, Math.round(splineTeeth)) : undefined,
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="keys-splines"
      title="Keys & Splines"
      left={
        <KeysSplinesInputs
          torque={torque}
          setTorque={setTorque}
          torqueUnit={torqueUnit}
          setTorqueUnit={setTorqueUnit}
          shaftDiameter={shaftDiameter}
          setShaftDiameter={setShaftDiameter}
          keyWidth={keyWidth}
          setKeyWidth={setKeyWidth}
          keyHeight={keyHeight}
          setKeyHeight={setKeyHeight}
          keyLength={keyLength}
          setKeyLength={setKeyLength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          yieldStress={yieldStress}
          setYieldStress={setYieldStress}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          keyType={keyType}
          setKeyType={setKeyType}
          splineTeeth={splineTeeth}
          setSplineTeeth={setSplineTeeth}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Keys & splines">
          <p>
            Parallel keys are checked for shear in the key and bearing on the shaft/keyway. Allowable shear is
            0.6×σy and bearing 1.5×σy. Confirm key dimensions against ISO/DIN tables for the shaft size.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<KeysSplinesResults result={result} stressUnit={stressUnit} torqueUnit={torqueUnit} />}
    />
  );
}
