"use client";

import { useState } from "react";

export default function BoltCalculator() {
  const [force, setForce] = useState(0);
  const [area, setArea] = useState(0);
  const [stress, setStress] = useState<number | null>(null);

  const calculate = () => {
    if (area === 0) {
      alert("Area cannot be zero");
      return;
    }
    const result = force / area;
    setStress(result);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bolt Stress Calculator
        </h1>

        <label className="block mb-2">Force (N)</label>
        <input
          type="number"
          value={force}
          onChange={(e) => setForce(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2">Area (mm²)</label>
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white p-2 rounded-lg"
        >
          Calculate
        </button>

        {stress !== null && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">
              Stress: {stress.toFixed(2)} MPa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}