"use client";

type Props = {
  message?: string;
};

export default function CalculatorEmptyResults({
  message = "Run calculation to see results.",
}: Props) {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
      <p className="text-center text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
