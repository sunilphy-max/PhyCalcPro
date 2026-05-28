"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import RivetInputs from "@/components/fasteners/rivets/RivetInputs";
import RivetResults from "@/components/fasteners/rivets/RivetResults";
import { toBase } from "@/lib/units/conversions";
import { solveRivetEngine } from "@/lib/fasteners/rivets/engine";
import type { RivetMaterial, RivetResult, RivetType } from "@/lib/fasteners/rivets/types";

const MATERIALS: Record<string, RivetMaterial> = {
  Steel: {
    name: "Steel",
    yieldStress: 250e6,
    shearStrength: 145e6,
    bearingStrength: 370e6,
  },
  Aluminum: {
    name: "Aluminum",
    yieldStress: 150e6,
    shearStrength: 95e6,
    bearingStrength: 210e6,
  },
  Brass: {
    name: "Brass",
    yieldStress: 140e6,
    shearStrength: 80e6,
    bearingStrength: 190e6,
  },
};

export default function Page() {
  const { wrapResult } = useStandardCalculation("rivets");
  const [rivetDiameter, setRivetDiameter] = useState(0.01);
  const [rivetDiameterUnit, setRivetDiameterUnit] = useState("m");
  const [plateThickness, setPlateThickness] = useState(0.006);
  const [plateThicknessUnit, setPlateThicknessUnit] = useState("m");
  const [quantity, setQuantity] = useState(4);
  const [shearForce, setShearForce] = useState(12000);
  const [shearUnit, setShearUnit] = useState("N");
  const [axialForce, setAxialForce] = useState(4000);
  const [axialUnit, setAxialUnit] = useState("N");
  const [material, setMaterial] = useState("Steel");
  const [rivetType, setRivetType] = useState<RivetType>("solid");
  const [result, setResult] = useState<RivetResult | null>(null);

  const calculate = () => {
    const config = {
      rivetDiameter: toBase(rivetDiameter, "length", rivetDiameterUnit),
      plateThickness: toBase(plateThickness, "length", plateThicknessUnit),
      quantity: Math.max(1, Math.round(quantity)),
      shearForce: toBase(shearForce, "force", shearUnit),
      axialForce: toBase(axialForce, "force", axialUnit),
      material: MATERIALS[material] || MATERIALS.Steel,
      rivetType,
    };

    setResult(wrapResult(solveRivetEngine(config)));
  };

  return (
    <DashboardLayout title="Rivet Analysis Module">
      <CalculatorLayout
        moduleId="rivets"
        title="Rivet Joint Strength"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Fastener guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Evaluate rivet joint stress states, bearing strength, and governing failure mode with a simple combined load model.
              </p>
            </div>
          </div>
        }
        center={
          <RivetInputs
            rivetDiameter={rivetDiameter}
            setRivetDiameter={setRivetDiameter}
            rivetDiameterUnit={rivetDiameterUnit}
            setRivetDiameterUnit={setRivetDiameterUnit}
            plateThickness={plateThickness}
            setPlateThickness={setPlateThickness}
            plateThicknessUnit={plateThicknessUnit}
            setPlateThicknessUnit={setPlateThicknessUnit}
            quantity={quantity}
            setQuantity={setQuantity}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearUnit={shearUnit}
            setShearUnit={setShearUnit}
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialUnit={axialUnit}
            setAxialUnit={setAxialUnit}
            material={material}
            setMaterial={setMaterial}
            rivetType={rivetType}
            setRivetType={setRivetType}
            onCalculate={calculate}
          />
        }
        right={
          <RivetResults
            result={result}
            lengthUnit={rivetDiameterUnit}
            forceUnit={shearUnit}
            stressUnit="Pa"
          />
        }
      />
    </DashboardLayout>
  );
}
