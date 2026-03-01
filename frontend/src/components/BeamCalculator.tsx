"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BeamPlot = dynamic(
  () => import("./BeamPlot"),
  { ssr: false }
);

export default function BeamCalculator() {
  const [x, setX] = useState<number[]>([]);
  const [moment, setMoment] = useState<number[]>([]);

  const calculateBeam = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/beam/data`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          load: 5,
          length: 10,
          width: 0.3,
          height: 0.5,
        }),
      }
    );

    const data = await response.json();
    setX(data.x);
    setMoment(data.moment);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <button onClick={calculateBeam}>Calculate</button>
      {x.length > 0 && <BeamPlot x={x} moment={moment} />}
    </main>
  );
}