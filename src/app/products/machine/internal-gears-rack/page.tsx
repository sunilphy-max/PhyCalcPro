"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import InternalGearsRackInputs from "@/components/machine/internal-gears-rack/InternalGearsRackInputs";
import InternalGearsRackResults from "@/components/machine/internal-gears-rack/InternalGearsRackResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveInternalGearsRackEngine } from "@/lib/machine/internal-gears-rack/engine";
import type { InternalGearsRackMaterial, InternalGearsRackResult } from "@/lib/machine/internal-gears-rack/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { resolveMaterial, toGearMaterial } from "@/lib/materials/materialCatalogService";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("internal-gears-rack", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      module: setModuleUnit,
      faceWidth: setFaceWidthUnit,
      length: setLengthUnit,
    })
  );

  const [gearType, setGearType] = useState<"internal" | "rack">("internal");
  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speed, setSpeed] = useState(1200);
  const [module, setModule] = useState(5);
  const [moduleUnit, setModuleUnit] = useState("mm");
  const [pinionTeeth, setPinionTeeth] = useState(20);
  const [gearTeeth, setGearTeeth] = useState(80);
  const [faceWidth, setFaceWidth] = useState(40);
  const [faceWidthUnit, setFaceWidthUnit] = useState("mm");
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("machine-gear"));
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("Pa");
  const [result, setResult] = useState<(InternalGearsRackResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : power;
    setResult(
      wrapResult(
        solveInternalGearsRackEngine({
          gearType,
          power: normalizedPower,
          speed,
          module: toBase(module, "length", moduleUnit),
          pinionTeeth,
          gearTeeth,
          faceWidth: toBase(faceWidth, "length", faceWidthUnit),
          material: toGearMaterial(resolveMaterial(material, "machine-gear")) as InternalGearsRackMaterial,
        })
      )
    );
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    power: powerUnit === "kW" ? power * 1000 : power,
    speedDriver: speed,
    module,
    pinionTeeth,
    gearRatio: gearTeeth / Math.max(pinionTeeth, 1),
  }), [power, powerUnit, speed, module, pinionTeeth, gearTeeth]);

  useSyncDesignInputs("internal-gears-rack", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.module != null) setModule(fields.module as number);
    if (fields.pinionTeeth != null) setPinionTeeth(fields.pinionTeeth as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("internal-gears-rack", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="internal-gears-rack"
      title="Internal Gears & Rack"
      inputs={
        <InternalGearsRackInputs
          gearType={gearType}
          setGearType={setGearType}
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speed={speed}
          setSpeed={setSpeed}
          module={module}
          setModule={setModule}
          moduleUnit={moduleUnit}
          setModuleUnit={setModuleUnit}
          pinionTeeth={pinionTeeth}
          setPinionTeeth={setPinionTeeth}
          gearTeeth={gearTeeth}
          setGearTeeth={setGearTeeth}
          faceWidth={faceWidth}
          setFaceWidth={setFaceWidth}
          faceWidthUnit={faceWidthUnit}
          setFaceWidthUnit={setFaceWidthUnit}
          material={material}
          setMaterial={setMaterial}
          onCalculate={calculate}
        />
      }
      results={<InternalGearsRackResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
    />
  );
}
