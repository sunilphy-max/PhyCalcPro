"use client";

import { useEffect } from "react";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import CalculatorLayout from "@/components/CalculatorLayout";
import MaterialDatabase from "@/components/materials/MaterialDatabase";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";

export default function Page() {
  const { wrapResult } = useStandardCalculation("material-db");
  const { setUserInputs } = useDesignWorkflow();

  useEffect(() => {
    setUserInputs({ allowableStressPa: 200e6 });
  }, [setUserInputs]);

  return (
    <CalculatorLayout
      moduleId="material-db"
      title="Material Database"
      left={
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Materials Reference</h3>
          <p className="mt-1 text-sm text-slate-500">
            Lookup elastic modulus and basic material properties for common engineering materials.
          </p>
        </div>
      }
      center={
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
          <p>Search the material database by name to view basic mechanical properties and modulus values.</p>
        </div>
      }
      right={<MaterialDatabase />}
    />
  );
}
