"use client";

import { useState } from "react";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import GearInputs from "@/components/machine/gears/GearInputs";
import GearResults from "@/components/machine/gears/GearResults";
import { toBase } from "@/lib/units/conversions";
import { solveGearEngine } from "@/lib/machine/gears/engine";
import type { GearResult, GearMaterial } from "@/lib/machine/gears/types";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import type { CalculationSpec } from "@/lib/standards/types";

const MATERIALS: Record<string, GearMaterial> = {
  Steel: {
    name: "Steel",
    E: 210e9,
    yieldStress: 250e6,
    poisson: 0.3,
  },
  Aluminum: {
    name: "Aluminum",
    E: 70e9,
    yieldStress: 150e6,
    poisson: 0.33,
  },
  Bronze: {
    name: "Bronze",
    E: 103e9,
    yieldStress: 140e6,
    poisson: 0.34,
  },
};

export default function Page() {
  const { wrapResult } = useStandardCalculation("gears", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      module: setModuleUnit,
      faceWidth: setFaceWidthUnit,
      length: setLengthUnit,
      stress: setStressUnit,
    })
  );
  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [rpm, setRpm] = useState(1200);
  const [pinionTeeth, setPinionTeeth] = useState(20);
  const [gearRatio, setGearRatio] = useState(4);
  const [module, setModule] = useState(5);
  const [moduleUnit, setModuleUnit] = useState("mm");
  const [faceWidth, setFaceWidth] = useState(40);
  const [faceWidthUnit, setFaceWidthUnit] = useState("mm");
  const [material, setMaterial] = useState("Steel");
  const [stressUnit, setStressUnit] = useState("Pa");
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(GearResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : power;
    const config = {
      power: normalizedPower,
      speed: rpm,
      module: toBase(module, "length", moduleUnit),
      faceWidth: toBase(faceWidth, "length", faceWidthUnit),
      pinionTeeth,
      gearRatio,
      material: MATERIALS[material] || MATERIALS.Steel,
    };

    const raw = solveGearEngine(config);
    setResult(wrapResult(raw));
  };

  return (
    <DashboardLayout title="Gear Design Module">
      <CalculatorLayout
        moduleId="gears"
        title="Spur Gear Design"
        left={
          <GearInputs
            power={power}
            setPower={setPower}
            powerUnit={powerUnit}
            setPowerUnit={setPowerUnit}
            rpm={rpm}
            setRpm={setRpm}
            pinionTeeth={pinionTeeth}
            setPinionTeeth={setPinionTeeth}
            gearRatio={gearRatio}
            setGearRatio={setGearRatio}
            module={module}
            setModule={setModule}
            moduleUnit={moduleUnit}
            setModuleUnit={setModuleUnit}
            faceWidth={faceWidth}
            setFaceWidth={setFaceWidth}
            faceWidthUnit={faceWidthUnit}
            setFaceWidthUnit={setFaceWidthUnit}
            material={material}
            setMaterial={setMaterial}
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Gear design">
            <p>
              Use safety factor and pitch diameters to refine geometry. Start with 20–30 pinion teeth and a module that
              balances strength with packaging.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<GearResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
      />
    </DashboardLayout>
  );
}
