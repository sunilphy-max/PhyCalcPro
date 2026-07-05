import { ArrowRight, CheckCircle2, FileOutput, SlidersHorizontal } from "lucide-react";

const flowNodes = [
  {
    step: "01",
    title: "Set inputs and design standard",
    description: "Geometry, loads, materials, and US / EU / ISO defaults.",
    icon: SlidersHorizontal,
    panel: {
      label: "Beam · AISC",
      rows: [
        { key: "Section", value: "W12×26" },
        { key: "Span", value: "4.0 m" },
        { key: "w", value: "12 kN/m" },
        { key: "E", value: "200 GPa" },
      ],
    },
  },
  {
    step: "02",
    title: "Review checks and assumptions",
    description: "Utilization, margins, warnings, and implemented code checks.",
    icon: CheckCircle2,
    panel: {
      label: "Checks",
      rows: [
        { key: "σ_b", value: "142 MPa", status: "pass" as const },
        { key: "Util.", value: "0.71", status: "pass" as const },
        { key: "δ_max", value: "8.4 mm", status: "warn" as const },
        { key: "L/δ", value: "L/476", status: "warn" as const },
      ],
    },
  },
  {
    step: "03",
    title: "Export a defensible summary",
    description: "PDF or CSV with calculation context for review and records.",
    icon: FileOutput,
    panel: {
      label: "Report",
      rows: [
        { key: "Format", value: "PDF + CSV" },
        { key: "Includes", value: "Inputs · plots" },
        { key: "Assumptions", value: "Listed" },
        { key: "Tier", value: "β verified" },
      ],
    },
  },
];

function statusTone(status?: "pass" | "warn") {
  if (status === "pass") return "text-emerald-600 dark:text-emerald-400";
  if (status === "warn") return "text-amber-600 dark:text-amber-400";
  return "text-slate-900 dark:text-white";
}

function FlowConnector() {
  return (
    <div className="hidden items-center justify-center md:flex md:px-1 lg:px-2" aria-hidden>
      <div className="relative flex w-10 items-center lg:w-14">
        <div className="h-px w-full bg-gradient-to-r from-slate-300 via-sky-400 to-slate-300 dark:from-slate-600 dark:via-sky-500 dark:to-slate-600" />
        <span className="workflow-flow-dot absolute left-1/3 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-400" />
        <span className="workflow-flow-dot workflow-flow-dot-delay absolute left-2/3 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-300" />
        <ArrowRight className="absolute -right-1 h-4 w-4 text-slate-400 dark:text-slate-500" />
      </div>
    </div>
  );
}

export default function WorkflowDataFlow() {
  return (
    <div className="mt-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50/60 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/20 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-5 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Data pipeline
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Inputs, checks, and exports stay linked — nothing is a black-box number.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live calculation context
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          {flowNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.step} className="flex flex-1 flex-col md:flex-row md:items-stretch">
                <article className="flex h-full flex-1 flex-col rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tabular-nums text-slate-400">{node.step}</span>
                    <div className="rounded-lg bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{node.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{node.description}</p>

                  <div className="mt-5 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {node.panel.label}
                    </p>
                    <dl className="mt-3 space-y-2">
                      {node.panel.rows.map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-3 text-xs">
                          <dt className="text-slate-500">{row.key}</dt>
                          <dd
                            className={`font-medium tabular-nums ${statusTone(
                              "status" in row ? row.status : undefined
                            )}`}
                          >
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>

                {index < flowNodes.length - 1 ? <FlowConnector /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
