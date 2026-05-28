"use client";

import type { CalculationSpec, EngineeringCheck, EngineeringCheckStatus } from "@/lib/standards/types";

type Props = {
  spec: CalculationSpec | null | undefined;
  title?: string;
};

const statusStyles: Record<EngineeringCheckStatus, string> = {
  pass: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  fail: "bg-red-100 text-red-800",
  not_available: "bg-slate-100 text-slate-600",
  indicative: "bg-sky-100 text-sky-800",
};

const statusLabels: Record<EngineeringCheckStatus, string> = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
  not_available: "Not available",
  indicative: "Indicative",
};

function formatValue(check: EngineeringCheck): string {
  if (check.value == null || !Number.isFinite(check.value)) return "—";
  if (check.metricKind === "utilization") {
    return `${(check.value * 100).toFixed(1)}%`;
  }
  if (check.metricKind === "safety_factor") {
    return check.value >= 999 ? "∞" : check.value.toFixed(2);
  }
  return check.value.toPrecision(4);
}

export default function EngineeringChecksPanel({
  spec,
  title = "Engineering checks",
}: Props) {
  if (!spec) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Run the calculation to see code-specific checks for the selected standard.
      </div>
    );
  }

  const available = spec.checks.filter((c) => c.status !== "not_available");
  const pending = spec.checks.filter((c) => c.status === "not_available");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {spec.designCode} · {spec.method}
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white capitalize">
          {spec.validationStatus}
        </span>
      </div>

      {available.length ? (
        <ul className="space-y-2">
          {available.map((check) => (
            <li
              key={check.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{check.label}</p>
                {check.standardRef ? (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {check.standardRef.body} {check.standardRef.document}
                    {check.standardRef.clause ? ` · ${check.standardRef.clause}` : ""}
                  </p>
                ) : null}
                {check.notes ? (
                  <p className="text-xs text-slate-400 mt-1">{check.notes}</p>
                ) : null}
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[check.status]}`}
                >
                  {statusLabels[check.status]}
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                  {formatValue(check)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No checks are implemented for this standard yet.</p>
      )}

      {pending.length ? (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Required by standard (pending)
          </p>
          <ul className="space-y-1">
            {pending.map((check) => (
              <li key={check.id} className="text-xs text-slate-500">
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
