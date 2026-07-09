/** Shared calculator UI tokens — use across all product modules. */

export const calculatorPanelClass =
  "calculator-panel relative min-w-0 space-y-5 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

export const calculatorWorkspaceClass = "calculator-workspace min-w-0 space-y-4";

/** Single-column field grid for the module input sidebar (320–420px). */
export const calculatorInputGridClass = "calculator-input-grid grid min-w-0 grid-cols-1 gap-4";

export const calculatorInputGridTightClass = "grid min-w-0 grid-cols-1 gap-3";

export const calculatorInputGridCompactClass = "grid min-w-0 grid-cols-1 gap-2";

export const calculatorGuidanceClass =
  "rounded-2xl border border-slate-200/70 bg-slate-50/90 p-6 text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300";

export const calculatorPrimaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-sky-500 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.99] dark:from-cyan-500 dark:to-sky-500 dark:shadow-cyan-900/30";

export const calculatorSecondaryButtonClass =
  "rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80";

export const calculatorDangerLinkClass =
  "text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300";

const calculatorFieldBaseClass =
  "w-full min-w-0 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600/80 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20";

/** Text inputs (project name, search, etc.) */
export const calculatorTextInputClass = `calculator-number-input ${calculatorFieldBaseClass}`;

/** Number inputs: full value visible (no spinner overlap), tabular digits */
export const calculatorNumberInputClass = `calculator-number-input min-w-0 flex-1 ${calculatorFieldBaseClass} tabular-nums`;

/** Select menus */
export const calculatorSelectClass = calculatorFieldBaseClass;

/** Legacy alias — prefer calculatorNumberInputClass or calculatorTextInputClass */
export const calculatorFormControlClass = calculatorNumberInputClass;

export const calculatorFieldLabelClass =
  "block text-[0.8125rem] font-medium tracking-wide text-slate-600 dark:text-slate-300";

export const calculatorSectionClass =
  "space-y-3.5 rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 dark:border-slate-700/50 dark:bg-slate-800/30";

export const calculatorSectionTitleClass =
  "text-sm font-semibold tracking-tight text-slate-900 dark:text-white";

export const calculatorLoadCardClass =
  "space-y-2 rounded-xl border border-slate-200/70 bg-white/80 p-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-950/40";

export const calculatorUnitFieldRowClass = "flex min-w-0 items-stretch gap-2";
export const calculatorUnitSelectorWrapClass = "shrink-0";

export const calculatorUnitSelectClass =
  "min-w-[5.5rem] shrink-0 rounded-xl border border-slate-200/80 bg-white/90 px-2.5 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600/80 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20";

/** Compact sidebar panel when results are visible. */
export const calculatorSidebarClass =
  "calculator-sidebar rounded-2xl border border-slate-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40";
