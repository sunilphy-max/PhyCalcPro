"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

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
  const { mode: workflowMode } = useDesignWorkflow();
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

  const runCheck = () => {
    const config: LoadCaseManagerConfig = {
      cases,
      width: normalizeFieldValue("load-case-manager", "sectionWidth", width, widthUnit),
      height: normalizeFieldValue("load-case-manager", "sectionHeight", height, heightUnit),
      yieldStrength:
        normalizeFieldValue("load-case-manager", "yieldStrength", yieldStrength, stressUnit) / 1e6,
    };
    setResult(wrapResult(solveLoadCaseManagerEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      axialLoad: cases[0]?.axialForce ?? 0,
      bendingMoment: cases[0]?.bendingMoment ?? 0,
      shearForce: cases[0]?.shearForce ?? 0,
      targetSafetyFactor: 2,
    }), [cases]);

  useSyncDesignInputs("load-case-manager", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.height != null) setHeight(fields.height as never);
    if (fields.width != null) setWidth(fields.width as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("load-case-manager", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="load-case-manager"
        title="Load Case Envelope Calculator"
        inputs={
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
        results={<LoadCaseManagerResults result={result} />}
      />
  );
}
