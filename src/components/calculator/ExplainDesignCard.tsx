"use client";

type Props = {
  title?: string;
  bullets: string[];
  disclaimer?: string;
};

/**
 * Grounded design explanation from calculationSpec / checks (EDP-5) — not free-form LLM inventing numbers.
 */
export default function ExplainDesignCard({
  title = "Why this design",
  bullets,
  disclaimer = "Explanations are grounded in the active calculation basis and checks. Screening tools are not a substitute for stamped engineering judgment.",
}: Props) {
  if (bullets.length === 0) return null;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-slate-700 dark:text-slate-200">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">{disclaimer}</p>
    </div>
  );
}
