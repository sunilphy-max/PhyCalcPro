"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import LoadCaseManagerInputs from "@/components/structural/loadCaseManager/LoadCaseManagerInputs";
import LoadCaseManagerResults from "@/components/structural/loadCaseManager/LoadCaseManagerResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { solveLoadCaseManagerEngine } from "@/lib/structural/loadCaseManager/engine";
import type { LoadCase, LoadCaseManagerConfig, LoadCaseManagerResult } from "@/lib/structural/loadCaseManager/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles["load-case-manager"];

export default function Page() {
  const { wrapResult } = useStandardCalculation("load-case-manager", (units) =>
    applyUnitMap(units, {
      sectionWidth: setWidthUnit,
      sectionHeight: setHeightUnit,
      yieldStrength: setStressUnit,
    })
  );

  const [cases, setCases] = useState<LoadCase[]>([
    { name: "Case 1", axialForce: 50000, bendingMoment: 60000, shearForce: 12000 },
    { name: "Case 2", axialForce: 30000, bendingMoment: 90000, shearForce: 15000 },
    { name: "Case 3", axialForce: 75000, bendingMoment: 45000, shearForce: 10000 },
  ]);
  const [width, setWidth] = useState(0.2);
  const [widthUnit, setWidthUnit] = useState(defaults.sectionWidth.defaultUnit);
  const [height, setHeight] = useState(0.25);
  const [heightUnit, setHeightUnit] = useState(defaults.sectionHeight.defaultUnit);
  const [yieldStrength, setYieldStrength] = useState(250);
  const [stressUnit, setStressUnit] = useState(defaults.yieldStrength.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<LoadCaseManagerResult> | null>(null);

  const updateCase = (index: number, key: keyof LoadCase, value: number | string) => {
    setCases((current) =>
      current.map((loadCase, idx) =>
        idx === index
          ? { ...loadCase, [key]: typeof value === "string" ? value : Number(value) }
          : loadCase
      )
    );
  };

  const calculate = () => {
    const config: LoadCaseManagerConfig = {
      cases,
      width: normalizeFieldValue("load-case-manager", "sectionWidth", width, widthUnit),
      height: normalizeFieldValue("load-case-manager", "sectionHeight", height, heightUnit),
      yieldStrength:
        normalizeFieldValue("load-case-manager", "yieldStrength", yieldStrength, stressUnit) / 1e6,
    };
    setResult(wrapResult(solveLoadCaseManagerEngine(config)));
  };

  return (
          <CalculatorLayout
        moduleId="load-case-manager"
        title="Load Case Envelope Calculator"
        left={
          <LoadCaseManagerInputs
            cases={cases}
            updateCase={updateCase}
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
          <CalculatorGuidancePanel title="Envelope summary">
            <p>
              Computes peak axial, bending, and shear values across all cases, then a combined stress envelope for a
              rectangular section.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<LoadCaseManagerResults result={result} />}
      />
  );
}
