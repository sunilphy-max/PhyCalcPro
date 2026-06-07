"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  moduleId: string;
};

/** Shows design-target checklist items when workflow mode is Design or Select. */
export default function DesignTargetFields({ moduleId }: Props) {
  const { mode } = useDesignWorkflow();
  const workflow = getModuleDesignWorkflow(moduleId);

  if (!workflow || (mode !== "design" && mode !== "select")) return null;

  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
        {mode === "select" ? "Select mode — define targets" : "Design mode — define targets"}
      </p>
      <ul className="mt-2 grid gap-1.5 text-sm text-slate-700">
        {workflow.designInputs.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
