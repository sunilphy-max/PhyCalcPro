"use client";

import { useMemo } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseFromChecks } from "@/lib/design-workflows/diagnoseFromChecks";
import type { ModuleDiagnosis } from "@/lib/design-workflows/diagnosisTypes";

type Props = {
  result: unknown;
  /** Prefer a dedicated diagnosis when available. */
  diagnosis?: ModuleDiagnosis | null;
};

/** Shared Diagnose banner for modules without a dedicated results-tab engine. */
export default function DiagnosisModeBanner({ result, diagnosis: diagnosisProp }: Props) {
  const { mode } = useDesignWorkflow();
  const diagnosis = useMemo(() => {
    if (mode !== "diagnose") return null;
    if (diagnosisProp) return diagnosisProp;
    if (!result) return null;
    return diagnoseFromChecks(result);
  }, [mode, diagnosisProp, result]);

  if (!diagnosis) return null;

  return (
    <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
        Diagnose
      </h3>
      <GenericDiagnosisPanel diagnosis={diagnosis} />
    </div>
  );
}
