"use client";

import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  spec: CalculationSpec | null | undefined;
};

function EquationBlock({ expression, label, description }: { expression: string; label: string; description?: string }) {
  return (
    <li className="space-y-1">
      <p className="font-medium text-slate-800">{label}</p>
      <p className="font-mono text-xs text-slate-700 bg-slate-50 rounded px-2 py-1.5 overflow-x-auto">{expression}</p>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
    </li>
  );
}

export default function CalculationBasisPanel({ spec }: Props) {
  if (!spec) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-sm">
      <h3 className="font-semibold text-slate-900">Calculation basis</h3>

      {spec.standards.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">References</p>
          <ul className="mt-1 space-y-1 text-slate-700">
            {spec.standards.map((ref, index) => (
              <li key={`${ref.document}-${index}`}>
                {ref.body} {ref.document}
                {ref.clause ? ` — ${ref.clause}` : ""}
                {ref.edition ? ` (${ref.edition})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.equations.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Governing equations</p>
          <ul className="mt-2 space-y-3">
            {spec.equations.map((eq) => (
              <EquationBlock key={eq.id} label={eq.label} expression={eq.expression} description={eq.description} />
            ))}
          </ul>
        </div>
      ) : null}

      {spec.assumptions.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assumptions</p>
          <ul className="mt-1 list-disc pl-5 text-slate-600 space-y-1">
            {spec.assumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.limitations.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Limitations</p>
          <ul className="mt-1 list-disc pl-5 text-slate-600 space-y-1">
            {spec.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-2">
        Engine {spec.engineVersion} · {new Date(spec.computedAt).toLocaleString()}
      </p>
      <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
        Indicative and beta results do not constitute code compliance. Verify with the governing
        standard and a qualified engineer.
      </p>
    </div>
  );
}
