"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import RivetInputs from "@/components/fasteners/rivets/RivetInputs";
import RivetResults from "@/components/fasteners/rivets/RivetResults";
import { toBase } from "@/lib/units/conversions";
import { solveRivetEngine } from "@/lib/fasteners/rivets/engine";
import type { RivetResult, RivetType } from "@/lib/fasteners/rivets/types";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { resolveMaterial, toRivetMaterial } from "@/lib/materials/materialCatalogService";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
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
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("rivet"));
  const [rivetType, setRivetType] = useState<RivetType>("solid");
  const [result, setResult] = useState<RivetResult | null>(null);

  const runCheck = () => {
    const config = {
      rivetDiameter: toBase(rivetDiameter, "length", rivetDiameterUnit),
      plateThickness: toBase(plateThickness, "length", plateThicknessUnit),
      quantity: Math.max(1, Math.round(quantity)),
      shearForce: toBase(shearForce, "force", shearUnit),
      axialForce: toBase(axialForce, "force", axialUnit),
      material: toRivetMaterial(resolveMaterial(material, "rivet")),
      rivetType,
    };

    setResult(wrapResult(solveRivetEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(shearForce, "force", shearUnit),
      count: quantity,
    }), [shearForce, shearUnit, quantity]);

  useSyncDesignInputs("rivets", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    rivetDiameter: (v) => setRivetDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("rivets", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="rivets"
        title="Rivet Joint Strength"
        inputs={
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
        results={
          <RivetResults
            result={result}
            lengthUnit={rivetDiameterUnit}
            forceUnit={shearUnit}
            stressUnit="Pa"
          />
        }
      />
  );
}
