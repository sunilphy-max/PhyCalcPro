import React, { useEffect, useState } from "react";
import PlotCard from "./components/PlotCard";

function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/example?x=4")
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to PhyCalcPro</h1>
      {result && (
        <div>
          <p>Example Calculation: x = {result.x}, y = {result.y.toFixed(3)}</p>
          <PlotCard src={result.plot} />
        </div>
      )}
    </div>
  );
}

export default App;