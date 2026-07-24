import type { ModuleStandardProfile } from "@/lib/standards/types";
import type { ModuleMaturity } from "@/data/moduleMaturity";

type Props = {
  profile: ModuleStandardProfile | undefined;
  maturity: ModuleMaturity | undefined;
  calculatorRoute?: string;
  /** Shown when profile is missing but a calculator still exists. */
  fallbackTitle?: string;
};

export default function ModuleCatalogPanel({
  profile,
  maturity,
  calculatorRoute,
  fallbackTitle,
}: Props) {
  if (!profile && !calculatorRoute) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200">
            {profile ? "Standards catalog" : "Calculator"}
          </p>
          <p className="mt-1 text-sm text-blue-900/90 dark:text-blue-100">
            {profile ? (
              <>
                Validation:{" "}
                <span className="font-semibold capitalize">{profile.validationStatus}</span>
                {maturity ? (
                  <>
                    {" "}
                    · Method band: <span className="font-semibold">{maturity.maturityBand}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>Open the interactive {fallbackTitle ?? "module"} calculator to apply this guide.</>
            )}
          </p>
        </div>
        {calculatorRoute ? (
          <a
            href={calculatorRoute}
            className="shrink-0 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Open calculator
          </a>
        ) : null}
      </div>

      {profile ? (
        <>
          <p className="mt-3 text-sm leading-6 text-blue-950/90 dark:text-blue-50">
            <strong>Indicative method:</strong> {profile.indicativeMethod}
          </p>

          {profile.assumptions.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-50">Assumptions</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-900/90 dark:text-blue-100">
                {profile.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {profile.limitations.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-50">Limitations</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-900/90 dark:text-blue-100">
                {profile.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {profile.checks.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                Engineering checks
              </h3>
              <div className="mt-2 overflow-x-auto rounded-xl border border-blue-200/80 bg-white/60 dark:border-blue-800 dark:bg-slate-900/50">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-blue-100 text-blue-800 dark:border-blue-900 dark:text-blue-200">
                      <th className="px-3 py-2 font-semibold">Check</th>
                      <th className="px-3 py-2 font-semibold">IND</th>
                      <th className="px-3 py-2 font-semibold">US</th>
                      <th className="px-3 py-2 font-semibold">EU</th>
                      <th className="px-3 py-2 font-semibold">ISO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.checks.map((check) => (
                      <tr
                        key={check.id}
                        className="border-b border-blue-50 last:border-0 dark:border-blue-900/50"
                      >
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{check.label}</td>
                        {(["INDICATIVE", "US", "EU", "ISO"] as const).map((code) => (
                          <td key={code} className="px-3 py-2 text-slate-600 dark:text-slate-400">
                            {check.implementation[code] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
