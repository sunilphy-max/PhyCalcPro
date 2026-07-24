"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import CalculatorLayout from "@/components/CalculatorLayout";
import MaterialDatabase from "@/components/materials/MaterialDatabase";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorExportButton from "@/components/calculator/CalculatorExportButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorPanelClass, calculatorPrimaryButtonClass } from "@/components/calculator/styles";
import { useModuleDesignCalculate } from "@/hooks/useModuleDesignCalculate";
import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { toBase } from "@/lib/units/conversions";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

function MaterialDatabasePageContent() {
  const { wrapResult } = useStandardCalculation("material-db");
  const searchParams = useSearchParams();
  const urlMaterial = searchParams.get("material");
  const decodedUrlMaterial = urlMaterial ? decodeURIComponent(urlMaterial) : null;

  const [requiredStress, setRequiredStress] = useState(200);
  const [stressUnit, setStressUnit] = useState("MPa");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedE, setSelectedE] = useState<number | null>(null);

  const highlightMaterial = selectedMaterial ?? decodedUrlMaterial;
  const querySeed = selectedMaterial ?? decodedUrlMaterial ?? "";

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      allowableStressPa: toBase(requiredStress, "stress", stressUnit),
    }),
    [requiredStress, stressUnit]
  );

  const runCheck = useCallback(() => {
    wrapResult({
      metrics: [],
      warnings: [],
      assumptions: ["Material database browse mode — use Design to screen by allowable stress."],
    });
  }, [wrapResult]);

  const applyDesignFields = useApplyDesignFields({
    material: (v) => setSelectedMaterial(typeof v === "string" ? v : String(v)),
    E: (v) => setSelectedE(typeof v === "number" ? v : Number(v)),
  });

  const { calculate } = useModuleDesignCalculate({
    moduleId: "material-db",
    userInputs: designUserInputs,
    runCheck,
    applyDesign: applyDesignFields,
  });

  return (
    <CalculatorLayout
      moduleId="material-db"
      title="Material Database"
      hasResults={true}
      inputs={
        <div className={calculatorPanelClass}>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Materials Reference</h3>
            <p className="mt-1 text-sm text-slate-500">
              Browse the full catalog on the right. Optionally screen by required allowable stress in Design or Select
              mode, then Apply a candidate.
            </p>
          </div>

          <CalculatorUnitField
            label="Required allowable stress"
            value={requiredStress}
            onChange={setRequiredStress}
            min={0}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="material-db"
                fieldKey="stress"
                value={stressUnit}
                onChange={setStressUnit}
              />
            }
          />

          <div className="flex flex-wrap items-start gap-2">
            <button type="button" onClick={calculate} className={`${calculatorPrimaryButtonClass} min-w-0 flex-1`}>
              Screen materials
            </button>
            <CalculatorExportButton />
          </div>

          {selectedMaterial ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <span className="font-semibold">Applied selection:</span> {selectedMaterial}
              {selectedE ? ` (E = ${selectedE.toExponential(2)} Pa)` : null}
            </div>
          ) : null}
        </div>
      }
      results={
        <MaterialDatabase
          key={querySeed || "catalog"}
          highlightMaterial={highlightMaterial}
          querySeed={querySeed}
        />
      }
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MaterialDatabasePageContent />
    </Suspense>
  );
}
