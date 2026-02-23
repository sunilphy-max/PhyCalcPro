"use client";

import { useState } from "react";
import BeamPlot from "../components/BeamPlot";

export default function Home() {
  const [x, setX] = useState<number[]>([]);
  const [moment, setMoment] = useState<number[]>([]);

  const calculateBeam = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/beam/data`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          length: 10,
          load: 5,
        }),
      }
    );

    const data = await response.json();

    setX(data.x);
    setMoment(data.moment);
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">Beam Calculator</h1>

      <button
        onClick={calculateBeam}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Calculate
      </button>

      {x.length > 0 && <BeamPlot x={x} moment={moment} />}
    </main>
  );
}