/** Shared calculator UI tokens — use across all product modules. */

export const calculatorPanelClass =
  "calculator-panel min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export const calculatorWorkspaceClass = "calculator-workspace min-w-0 space-y-4";

/** Single-column field grid for the narrow module input sidebar (280–340px). */
export const calculatorInputGridClass = "grid min-w-0 grid-cols-1 gap-4";

export const calculatorInputGridTightClass = "grid min-w-0 grid-cols-1 gap-3";

export const calculatorInputGridCompactClass = "grid min-w-0 grid-cols-1 gap-2";

export const calculatorGuidanceClass =
  "rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300";

export const calculatorPrimaryButtonClass =
  "w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200";

export const calculatorSecondaryButtonClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700";

export const calculatorDangerLinkClass =
  "text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300";

/** Text inputs (project name, search, etc.) */
export const calculatorTextInputClass =
  "calculator-number-input w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800";

/** Number inputs: full value visible (no spinner overlap), tabular digits */
export const calculatorNumberInputClass =
  "calculator-number-input min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

/** Select menus */
export const calculatorSelectClass =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

/** Legacy alias — prefer calculatorNumberInputClass or calculatorTextInputClass */
export const calculatorFormControlClass = calculatorNumberInputClass;

export const calculatorFieldLabelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";

export const calculatorSectionClass =
  "space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40";

export const calculatorSectionTitleClass =
  "text-sm font-semibold text-slate-900 dark:text-white";

export const calculatorLoadCardClass =
  "space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950/50";

export const calculatorUnitFieldRowClass = "flex min-w-0 items-stretch gap-2";
export const calculatorUnitSelectorWrapClass = "shrink-0";

export const calculatorUnitSelectClass =
  "min-w-[5.5rem] shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800";
