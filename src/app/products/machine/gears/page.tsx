"use client";

import { useCallback, useState } from "react";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import GearInputs from "@/components/machine/gears/GearInputs";
import GearResults from "@/components/machine/gears/GearResults";
import { toBase } from "@/lib/units/conversions";
import { solveGearEngine } from "@/lib/machine/gears/engine";
import type { GearResult, GearMaterial } from "@/lib/machine/gears/types";
import { useDesignCodeUnits } from "@/hooks/useDesignCodeUnits";
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
  const { wrapResult } = useStandardCalculation("gears");
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

  const applyUnits = useCallback((units: Record<string, string>) => {
    if (units.power) setPowerUnit(units.power);
    if (units.module) setModuleUnit(units.module);
    if (units.faceWidth) setFaceWidthUnit(units.faceWidth);
    if (units.length) setLengthUnit(units.length);
    if (units.stress) setStressUnit(units.stress);
  }, []);

  useDesignCodeUnits(
    "gears",
    ["power", "module", "faceWidth", "length", "stress"],
    applyUnits
  );

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
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Use the calculated safety factor and pitch diameters to refine gear geometry for strength and packaging.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Recommended values start with 20–30 pinion teeth for standard spur gears and a module that balances strength with space.
              </p>
            </div>
          </div>
        }
        center={
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
        right={<GearResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
      />
    </DashboardLayout>
  );
}
