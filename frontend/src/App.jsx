import { useState } from "react";
import { getBoltStress } from "./api";

export default function App() {
  const [diameter, setDiameter] = useState(10);
  const [load, setLoad] = useState(1000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const data = await getBoltStress(diameter, load);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Backend not reachable" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>PhyCalcPro — Bolt Stress Calculator</h1>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Diameter (mm):{" "}
          <input
            type="number"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Load (N):{" "}
          <input
            type="number"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleCalculate} style={{ marginTop: "1rem" }}>
        {loading ? "Calculating..." : "Calculate"}
      </button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
