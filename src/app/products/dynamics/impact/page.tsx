"use client";

import { toBase } from "@/lib/units/conversions";
import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import ImpactInputs from "@/components/dynamics/impact/ImpactInputs";
import ImpactResults from "@/components/dynamics/impact/ImpactResults";
import { useCalculatorModule } from "@/hooks/useCalculatorModule";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import type { ImpactConfig, ImpactResult } from "@/lib/dynamics/impact/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { toBaseUnit } from "@/lib/physics/units";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { STEEL_YIELD } from "@/lib/materials/materialDefaults";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";

const profile = moduleUnitProfiles.impact;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useCalculatorModule("impact", (units) =>
    applyUnitMap(units, {
      mass: setMassUnit,
      velocity: setVelocityUnit,
      duration: setDurationUnit,
      area: setAreaUnit,
      stress: setStressUnit,
    })
  );

  const [mass, setMass] = useState(60);
  const [massUnit, setMassUnit] = useState(profile.mass.defaultUnit);
  const [velocityChange, setVelocityChange] = useState(8);
  const [velocityUnit, setVelocityUnit] = useState(profile.velocity.defaultUnit);
  const [impactDuration, setImpactDuration] = useState(50);
  const [durationUnit, setDurationUnit] = useState(profile.duration.defaultUnit);
  const [crossSectionArea, setCrossSectionArea] = useState(100);
  const [areaUnit, setAreaUnit] = useState(profile.area.defaultUnit);
  const [yieldStrength, setYieldStrength] = useState(STEEL_YIELD / 1e6);
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("structural"));
  const handleMaterialChange = useCallback((name: string) => {
    setMaterial(name);
    if (name === CUSTOM_MATERIAL) return;
    setYieldStrength(getMaterialFieldUpdates(name, "structural").yieldStress / 1e6);
  }, []);
  const [stressUnit, setStressUnit] = useState(profile.stress.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<ImpactResult> | null>(null);

  const runCheck = () => {
    const durationMs =
      durationUnit === "ms"
        ? impactDuration
        : toBaseUnit(impactDuration, "time", durationUnit) * 1000;
    const areaCm2 = toBaseUnit(crossSectionArea, "area", areaUnit) * 1e4;
    const config: ImpactConfig = {
      mass: toBaseUnit(mass, "mass", massUnit),
      velocityChange: toBaseUnit(velocityChange, "velocity", velocityUnit),
      impactDuration: durationMs,
      crossSectionArea: areaCm2,
      yieldStrength: toBaseUnit(yieldStrength, "stress", stressUnit) / 1e6,
    };
    setResult(wrapResult(solveImpactEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      mass: toBase(mass, "mass", massUnit),
      velocity: toBase(velocityChange, "velocity", velocityUnit),
      impactDuration,
    }), [mass, massUnit, velocityChange, velocityUnit, impactDuration]);

  useSyncDesignInputs("impact", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    area: (v) => setCrossSectionArea(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("impact", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="impact"
        title="Impact Force Calculator"
        inputs={
          <ImpactInputs
            mass={mass}
            setMass={setMass}
            massUnit={massUnit}
            setMassUnit={setMassUnit}
            velocityChange={velocityChange}
            setVelocityChange={setVelocityChange}
            velocityUnit={velocityUnit}
            setVelocityUnit={setVelocityUnit}
            impactDuration={impactDuration}
            setImpactDuration={setImpactDuration}
            durationUnit={durationUnit}
            setDurationUnit={setDurationUnit}
            crossSectionArea={crossSectionArea}
            setCrossSectionArea={setCrossSectionArea}
            areaUnit={areaUnit}
            setAreaUnit={setAreaUnit}
            yieldStrength={yieldStrength}
            setYieldStrength={setYieldStrength}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            material={material}
            onMaterialChange={handleMaterialChange}
            onCalculate={calculate}
          />
        }
        results={<ImpactResults result={result} />}
      />
  );
}
