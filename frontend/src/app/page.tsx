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
}