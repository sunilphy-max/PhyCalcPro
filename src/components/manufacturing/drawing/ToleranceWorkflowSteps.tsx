"use client";

type StepId = "upload" | "structure" | "build" | "results";

type Props = {
  active: StepId;
  hasPackage: boolean;
  hasChain: boolean;
  hasResults: boolean;
};

const STEPS: { id: StepId; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "structure", label: "Structure" },
  { id: "build", label: "Build chain" },
  { id: "results", label: "Results" },
];

function stepIndex(id: StepId) {
  return STEPS.findIndex((s) => s.id === id);
}

/** Compact progress strip for package stack-up workflow. */
export default function ToleranceWorkflowSteps({
  active,
  hasPackage,
  hasChain,
  hasResults,
}: Props) {
  const activeIdx = stepIndex(active);
  return (
    <nav aria-label="Stack-up progress" className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done =
          (step.id === "upload" && hasPackage) ||
          (step.id === "structure" && hasPackage) ||
          (step.id === "build" && hasChain) ||
          (step.id === "results" && hasResults);
        const current = i === activeIdx;
        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
            <div
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-1.5 text-center ${
                current
                  ? "bg-cyan-50 dark:bg-cyan-950/40"
                  : done
                    ? "opacity-90"
                    : "opacity-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  current
                    ? "bg-cyan-600 text-white"
                    : done
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {done && !current ? "✓" : i + 1}
              </span>
              <span className="mt-1 truncate text-[10px] font-medium text-slate-700 dark:text-slate-300">
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div
                className={`h-px w-2 shrink-0 sm:w-4 ${
                  i < activeIdx || done ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
