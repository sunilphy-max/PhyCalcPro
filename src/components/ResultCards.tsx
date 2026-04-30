"use client";

import { BeamResult } from "@/lib/beam/types";

type Props = {
  result: BeamResult;
};

export default function ResultCards({ result }: Props) {
  const maxShear = result.shear?.length > 0 ? Math.max(...result.shear.map(Math.abs)) : 0;
  const maxMoment = result.moment?.length > 0 ? Math.max(...result.moment.map(Math.abs)) : 0;
  const maxDeflection = result.deflection?.length > 0 ? Math.max(...result.deflection.map(Math.abs)) : 0;
  const maxStress = result.stress?.length > 0 ? Math.max(...result.stress.map(Math.abs)) : 0;

  const cards = [
    {
      label: "Max Shear",
      value: maxShear.toFixed(2),
      unit: "N",
    },
    {
      label: "Max Moment",
      value: maxMoment.toFixed(2),
      unit: "N·m",
    },
    {
      label: "Max Deflection",
      value: maxDeflection.toExponential(3),
      unit: "m",
    },
    {
      label: "Max Stress",
      value: maxStress.toExponential(3),
      unit: "Pa",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow p-4 border border-gray-100"
        >
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="text-lg font-semibold text-blue-700 mt-1">
            {card.value}
          </div>
          <div className="text-xs text-gray-400">{card.unit}</div>
        </div>
      ))}
    </div>
  );
}