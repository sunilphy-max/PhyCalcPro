"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CombinedLoadingInputs from "@/components/structural/combinedLoading/CombinedLoadingInputs";
import CombinedLoadingResults from "@/components/structural/combinedLoading/CombinedLoadingResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import type { CombinedLoadingConfig, CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles["combined-loading"];

export default function Page() {
  const { wrapResult } = useStandardCalculation("combined-loading", (units) =>
    applyUnitMap(units, {
      axialForce: setAxialUnit,
      bendingMoment: setMomentUnit,
      torque: setTorqueUnit,
      shearForce: setShearUnit,
      sectionWidth: setWidthUnit,
      sectionHeight: setHeightUnit,
      yieldStrength: setStressUnit,
    })
  );

  const [axialForce, setAxialForce] = useState(120000);
  const [axialUnit, setAxialUnit] = useState(defaults.axialForce.defaultUnit);
  const [bendingMoment, setBendingMoment] = useState(85000);
  const [momentUnit, setMomentUnit] = useState(defaults.bendingMoment.defaultUnit);
  const [torque, setTorque] = useState(18000);
  const [torqueUnit, setTorqueUnit] = useState(defaults.torque.defaultUnit);
  const [shearForce, setShearForce] = useState(15000);
  const [shearUnit, setShearUnit] = useState(defaults.shearForce.defaultUnit);
  const [width, setWidth] = useState(0.18);
  const [widthUnit, setWidthUnit] = useState(defaults.sectionWidth.defaultUnit);
  const [height, setHeight] = useState(0.27);
  const [heightUnit, setHeightUnit] = useState(defaults.sectionHeight.defaultUnit);
  const [yieldStrength, setYieldStrength] = useState(250);
  const [stressUnit, setStressUnit] = useState(defaults.yieldStrength.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<CombinedLoadingResult> | null>(null);

  const calculate = () => {
    const config: CombinedLoadingConfig = {
      axialForce: normalizeFieldValue("combined-loading", "axialForce", axialForce, axialUnit),
      bendingMoment: normalizeFieldValue("combined-loading", "bendingMoment", bendingMoment, momentUnit),
      torque: normalizeFieldValue("combined-loading", "torque", torque, torqueUnit),
      shearForce: normalizeFieldValue("combined-loading", "shearForce", shearForce, shearUnit),
      width: normalizeFieldValue("combined-loading", "sectionWidth", width, widthUnit),
      height: normalizeFieldValue("combined-loading", "sectionHeight", height, heightUnit),
      yieldStrength:
        normalizeFieldValue("combined-loading", "yieldStrength", yieldStrength, stressUnit) / 1e6,
    };
    setResult(wrapResult(solveCombinedLoadingEngine(config)));
  };

  return (
          <CalculatorLayout
        moduleId="combined-loading"
        title="Combined Loading Calculator"
        left={
          <CombinedLoadingInputs
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialUnit={axialUnit}
            setAxialUnit={setAxialUnit}
            bendingMoment={bendingMoment}
            setBendingMoment={setBendingMoment}
            momentUnit={momentUnit}
            setMomentUnit={setMomentUnit}
            torque={torque}
            setTorque={setTorque}
            torqueUnit={torqueUnit}
            setTorqueUnit={setTorqueUnit}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearUnit={shearUnit}
            setShearUnit={setShearUnit}
            width={width}
            setWidth={setWidth}
            widthUnit={widthUnit}
            setWidthUnit={setWidthUnit}
            height={height}
            setHeight={setHeight}
            heightUnit={heightUnit}
            setHeightUnit={setHeightUnit}
            yieldStrength={yieldStrength}
            setYieldStrength={setYieldStrength}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Combined loading overview">
            <p>
              Combines axial, bending, torsion, and shear loads into a von Mises-style stress check for a rectangular
              cross-section.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<CombinedLoadingResults result={result} />}
      />
  );
}
