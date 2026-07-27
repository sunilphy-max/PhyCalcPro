"use client";

import Link from "next/link";

export type TeachPrompt = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  prompts: TeachPrompt[];
  mode?: "student" | "professional";
  onModeChange?: (mode: "student" | "professional") => void;
  pathHref?: string;
};

/**
 * Teach mode prompts beside the calculator (EDP-7).
 */
export default function WorkspaceTeachPanel({
  prompts,
  mode = "student",
  onModeChange,
  pathHref = "/learn",
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Teach mode</h3>
        <div className="flex items-center gap-2">
          {onModeChange ? (
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as "student" | "professional")}
              className="rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="student">Student</option>
              <option value="professional">Professional</option>
            </select>
          ) : null}
          <Link href={pathHref} className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400">
            Learning paths
          </Link>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {mode === "student"
          ? "Concept-first explanations. Same solvers as professional mode."
          : "Denser code-check and standards detail. Same solvers as student mode."}
      </p>
      <ul className="space-y-2">
        {prompts.map((p) => (
          <li key={p.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.question}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{p.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const BEAM_TEACH_PROMPTS: TeachPrompt[] = [
  {
    id: "moment",
    question: "What is bending moment?",
    answer:
      "Bending moment is the internal torque that causes curvature. Maximum moment usually governs section sizing because bending stress σ = M·c / I peaks there.",
  },
  {
    id: "l360",
    question: "Why L/360?",
    answer:
      "L/360 is a common serviceability deflection limit for floors and many general beams — span/360 keeps bounce and finishes within typical architectural expectations. Stricter ratios (L/480, L/600) apply to sensitive finishes.",
  },
  {
    id: "a992",
    question: "Why choose ASTM A992?",
    answer:
      "A992 is the preferred US structural steel for W-shapes: Fy ≈ 345 MPa with good weldability and ductility. European designs often start from S355JR for a similar strength class.",
  },
  {
    id: "sf",
    question: "Why use a safety / resistance factor?",
    answer:
      "Loads, materials, and modeling are uncertain. Code factors (LRFD φ, ASD Ω, Eurocode γ) keep utilization under 1.0 under design loads — PhyCalcPro shows utilization against your chosen allowable or limit.",
  },
];
