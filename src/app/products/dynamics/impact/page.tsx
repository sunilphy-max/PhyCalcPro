"use client";

import { toBase } from "@/lib/units/conversions";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import ImpactInputs from "@/components/dynamics/impact/ImpactInputs";
import ImpactResults from "@/components/dynamics/impact/ImpactResults";
import { useCalculatorModule } from "@/hooks/useCalculatorModule";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import type { ImpactConfig, ImpactResult } from "@/lib/dynamics/impact/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { toBaseUnit } from "@/lib/physics/units";

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
  const [yieldStrength, setYieldStrength] = useState(250);
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

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

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
        left={
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
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Shock overview">
            <p>
              Convert a sudden change in momentum into an average impact force and translate loading into
              stress for a given section. Compare results across design standards using the selector above.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<ImpactResults result={result} />}
      />
  );
}
