"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import RolledSectionsInputs from "@/components/materials/rolled-sections/RolledSectionsInputs";
import RolledSectionsResults from "@/components/materials/rolled-sections/RolledSectionsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { solveRolledSectionsEngine } from "@/lib/materials/rolled-sections/engine";
import type { RolledSectionsResult } from "@/lib/materials/rolled-sections/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("rolled-sections", (units) =>
    applyUnitMap(units, {
      length: setLengthUnit,
      area: setAreaUnit,
      inertia: setInertiaUnit,
    })
  );

  const [family, setFamily] = useState("W");
  const [designation, setDesignation] = useState("W310x97");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [result, setResult] = useState<(RolledSectionsResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(wrapResult(solveRolledSectionsEngine({ designation })));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      sectionDesignation: designation,
    }), [designation]);

  useSyncDesignInputs("rolled-sections", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("rolled-sections", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="rolled-sections"
      title="Rolled Sections"
      left={
        <RolledSectionsInputs
          family={family}
          setFamily={setFamily}
          designation={designation}
          setDesignation={setDesignation}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          areaUnit={areaUnit}
          setAreaUnit={setAreaUnit}
          inertiaUnit={inertiaUnit}
          setInertiaUnit={setInertiaUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Rolled sections">
          <p>
            Indicative catalog values for preliminary member sizing. Confirm dimensions, grades, and design
            resistances against the mill certificate and your governing standard.
          </p>
        </CalculatorGuidancePanel>
      }
      right={
        <RolledSectionsResults
          result={result}
          designation={designation}
          lengthUnit={lengthUnit}
          areaUnit={areaUnit}
          inertiaUnit={inertiaUnit}
        />
      }
    />
  );
}
