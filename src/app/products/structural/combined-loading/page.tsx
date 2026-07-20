"use client";

import { toBase } from "@/lib/units/conversions";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import CombinedLoadingInputs from "@/components/structural/combinedLoading/CombinedLoadingInputs";
import CombinedLoadingResults from "@/components/structural/combinedLoading/CombinedLoadingResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import type { CombinedLoadingConfig, CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { STEEL_YIELD } from "@/lib/materials/materialDefaults";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";

const defaults = moduleUnitProfiles["combined-loading"];

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("combined-loading", (units) =>
    applyUnitMap(units, {
      axialForce: setAxialUnit,
      bendingMoment: setMomentUnit,
      torque: setTorqueUnit,
      shearForce: setShearUnit,
      sectionWidth: setWidthUnit,
      sectionHeight: setHeightUnit,
      yieldStrength: setStressUnit,
    })
  );

  const [axialForce, setAxialForce] = useState(120000);
  const [axialUnit, setAxialUnit] = useState(defaults.axialForce.defaultUnit);
  const [bendingMoment, setBendingMoment] = useState(85000);
  const [momentUnit, setMomentUnit] = useState(defaults.bendingMoment.defaultUnit);
  const [torque, setTorque] = useState(18000);
  const [torqueUnit, setTorqueUnit] = useState(defaults.torque.defaultUnit);
  const [shearForce, setShearForce] = useState(15000);
  const [shearUnit, setShearUnit] = useState(defaults.shearForce.defaultUnit);
  const [width, setWidth] = useState(0.18);
  const [widthUnit, setWidthUnit] = useState(defaults.sectionWidth.defaultUnit);
  const [height, setHeight] = useState(0.27);
  const [heightUnit, setHeightUnit] = useState(defaults.sectionHeight.defaultUnit);
  const [yieldStrength, setYieldStrength] = useState(STEEL_YIELD / 1e6);
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("structural"));
  const handleMaterialChange = useCallback((name: string) => {
    setMaterial(name);
    if (name !== CUSTOM_MATERIAL) {
      setYieldStrength(getMaterialFieldUpdates(name, "structural").yieldStress / 1e6);
    }
  }, []);
  const [stressUnit, setStressUnit] = useState(defaults.yieldStrength.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<CombinedLoadingResult> | null>(null);

  const runCheck = () => {
    const config: CombinedLoadingConfig = {
      axialForce: normalizeFieldValue("combined-loading", "axialForce", axialForce, axialUnit),
      bendingMoment: normalizeFieldValue("combined-loading", "bendingMoment", bendingMoment, momentUnit),
      torque: normalizeFieldValue("combined-loading", "torque", torque, torqueUnit),
      shearForce: normalizeFieldValue("combined-loading", "shearForce", shearForce, shearUnit),
      width: normalizeFieldValue("combined-loading", "sectionWidth", width, widthUnit),
      height: normalizeFieldValue("combined-loading", "sectionHeight", height, heightUnit),
      yieldStrength:
        normalizeFieldValue("combined-loading", "yieldStrength", yieldStrength, stressUnit) / 1e6,
    };
    setResult(wrapResult(solveCombinedLoadingEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      axialLoad: toBase(axialForce, "force", axialUnit),
      bendingMoment: toBase(bendingMoment, "moment", momentUnit),
      torque: toBase(torque, "torque", torqueUnit),
      shearForce: toBase(shearForce, "force", shearUnit),
      allowableStressPa: toBase(yieldStrength, "stress", stressUnit) * 1e6,
    }), [axialForce, axialUnit, bendingMoment, momentUnit, torque, torqueUnit, shearForce, shearUnit, yieldStrength, stressUnit]);

  useSyncDesignInputs("combined-loading", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    const d = fields.diameter != null ? Number(fields.diameter) : null;
    if (d != null && Number.isFinite(d)) {
      setWidth(d);
      setHeight(d);
      return;
    }
    if (fields.width != null) setWidth(fields.width as number);
    if (fields.height != null) setHeight(fields.height as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("combined-loading", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="combined-loading"
        title="Combined Loading Calculator"
        inputs={
          <CombinedLoadingInputs
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialUnit={axialUnit}
            setAxialUnit={setAxialUnit}
            bendingMoment={bendingMoment}
            setBendingMoment={setBendingMoment}
            momentUnit={momentUnit}
            setMomentUnit={setMomentUnit}
            torque={torque}
            setTorque={setTorque}
            torqueUnit={torqueUnit}
            setTorqueUnit={setTorqueUnit}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearUnit={shearUnit}
            setShearUnit={setShearUnit}
            width={width}
            setWidth={setWidth}
            widthUnit={widthUnit}
            setWidthUnit={setWidthUnit}
            height={height}
            setHeight={setHeight}
            heightUnit={heightUnit}
            setHeightUnit={setHeightUnit}
            yieldStrength={yieldStrength}
            setYieldStrength={setYieldStrength}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            material={material}
            onMaterialChange={handleMaterialChange}
            onCalculate={calculate}
          />
        }
        results={<CombinedLoadingResults result={result} />}
      />
  );
}
