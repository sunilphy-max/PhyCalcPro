"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import TrussInputs from "@/components/structural/trusses/TrussInputs";
import TrussResults from "@/components/structural/trusses/TrussResults";
import { toBase } from "@/lib/units/conversions";
import { solveTrussEngine } from "@/lib/structural/trusses/engine";
import type { TrussResult } from "@/lib/structural/trusses/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("trusses");
  const [span, setSpan] = useState(6);
  const [height, setHeight] = useState(1.2);
  const [panels, setPanels] = useState(4);
  const [area, setArea] = useState(0.005);
  const [E, setE] = useState(210e9);
  const [load, setLoad] = useState(10000);
  const [spanUnit, setSpanUnit] = useState("m");
  const [heightUnit, setHeightUnit] = useState("m");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [loadUnit, setLoadUnit] = useState("N");
  const [EUnit, setEUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(4);
  const [result, setResult] = useState<TrussResult | null>(null);

  const runCheck = () => {
    const config = {
      span: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      panels: meshSegments < 2 ? 2 : Math.round(meshSegments),
      A: toBase(area, "area", areaUnit),
      E: toBase(E, "stress", EUnit),
      load: toBase(load, "force", loadUnit),
    };

    setResult(wrapResult(solveTrussEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      maxForce: toBase(load, "force", loadUnit),
      E: toBase(E, "stress", EUnit),
      area,
    }), [span, spanUnit, height, heightUnit, load, loadUnit, E, EUnit, area]);

  useSyncDesignInputs("trusses", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.area != null) setArea(fields.area as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("trusses", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="trusses"
      title="Truss Analysis"
      inputs={
        <TrussInputs
          span={span}
          setSpan={setSpan}
          height={height}
          setHeight={setHeight}
          panels={meshSegments}
          setPanels={setMeshSegments}
          area={area}
          setArea={setArea}
          E={E}
          setE={setE}
          load={load}
          setLoad={setLoad}
          spanUnit={spanUnit}
          setSpanUnit={setSpanUnit}
          heightUnit={heightUnit}
          setHeightUnit={setHeightUnit}
          areaUnit={areaUnit}
          setAreaUnit={setAreaUnit}
          loadUnit={loadUnit}
          setLoadUnit={setLoadUnit}
          EUnit={EUnit}
          setEUnit={setEUnit}
          onCalculate={calculate}
        />
      }
      results={<TrussResults result={result} />}
    />
  );
}
