"use client";

type Props = {
  message?: string;
};

export default function CalculatorEmptyResults({
  message = "Run calculation to see results.",
}: Props) {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl bg-white p-6 shadow-sm">
      <p className="text-center text-gray-500">{message}</p>
    </div>
  );
}
