"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import TrussInputs from "@/components/structural/trusses/TrussInputs";
import TrussResults from "@/components/structural/trusses/TrussResults";
import { toBase } from "@/lib/units/conversions";
import { solveTrussEngine } from "@/lib/structural/trusses/engine";
import type { TrussResult } from "@/lib/structural/trusses/types";

export default function Page() {
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

  const calculate = () => {
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
