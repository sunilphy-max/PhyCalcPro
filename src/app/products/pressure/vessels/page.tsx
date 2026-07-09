"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PressureVesselInputs from "@/components/pressure/vessels/PressureVesselInputs";
import PressureVesselResults from "@/components/pressure/vessels/PressureVesselResults";
import { toBase } from "@/lib/units/conversions";
import { solvePressureVesselEngine } from "@/lib/pressure/vessels/engine";
import type { PressureVesselResult } from "@/lib/pressure/vessels/types";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { STEEL_E, STEEL_YIELD } from "@/lib/materials/materialDefaults";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("vessels");
  const [radius, setRadius] = useState(0.5);
  const [radiusUnit, setRadiusUnit] = useState("m");
  const [thickness, setThickness] = useState(0.02);
  const [thicknessUnit, setThicknessUnit] = useState("m");
  const [length, setLength] = useState(3);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [pressure, setPressure] = useState(1e6);
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [E, setE] = useState(STEEL_E);
  const [EUnit, setEUnit] = useState("Pa");
  const [allowableStress, setAllowableStress] = useState(STEEL_YIELD * 0.55);
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("pressure"));
  const handleMaterialChange = useCallback((name: string) => {
    setMaterial(name);
    if (name === CUSTOM_MATERIAL) return;
    const u = getMaterialFieldUpdates(name, "pressure");
    setE(u.E);
    setAllowableStress(u.yieldStress * 0.55);
  }, []);
  const [segments, setSegments] = useState(40);
  const [result, setResult] = useState<PressureVesselResult | null>(null);

  const runCheck = () => {
    const config = {
      radius: toBase(radius, "length", radiusUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      length: toBase(length, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      A: toBase(thickness, "length", thicknessUnit) * toBase(length, "length", lengthUnit),
      segments: Math.max(8, Math.round(segments)),
      allowableStress,
    };

    setResult(wrapResult(solvePressureVesselEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      pressure: toBase(pressure, "pressure", pressureUnit),
      length: toBase(radius, "length", radiusUnit),
      E: toBase(E, "stress", EUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      allowableStressPa: allowableStress,
    }), [pressure, pressureUnit, radius, radiusUnit, E, EUnit, thickness, thicknessUnit, allowableStress]);

  useSyncDesignInputs("vessels", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.thickness != null) setThickness(fields.thickness as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("vessels", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="vessels"
      title="Pressure Vessel Analysis"
      inputs={
        <div className="space-y-4">
          <PressureVesselInputs
          radius={radius}
          setRadius={setRadius}
          radiusUnit={radiusUnit}
          setRadiusUnit={setRadiusUnit}
          thickness={thickness}
          setThickness={setThickness}
          thicknessUnit={thicknessUnit}
          setThicknessUnit={setThicknessUnit}
          length={length}
          setLength={setLength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          pressure={pressure}
          setPressure={setPressure}
          pressureUnit={pressureUnit}
          setPressureUnit={setPressureUnit}
          E={E}
          setE={setE}
          EUnit={EUnit}
          setEUnit={setEUnit}
          material={material}
          onMaterialChange={handleMaterialChange}
          segments={segments}
          setSegments={setSegments}
          onCalculate={calculate}
        />
        </div>
      }
      results={<PressureVesselResults result={result} />}
    />
  );
}
