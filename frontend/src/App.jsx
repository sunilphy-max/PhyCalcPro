import React, { useEffect, useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("");
  const [plot, setPlot] = useState("");

  // Fetch hello endpoint
  useEffect(() => {
    fetch("http://127.0.0.1:8000/hello")
      .then(res => res.json())
      .then(data => setMsg(data.message));
  }, []);

  // Fetch plot endpoint
  useEffect(() => {
    fetch("http://127.0.0.1:8000/plot-test")
      .then(res => res.json())
      .then(data => setPlot(`data:image/png;base64,${data.plot}`));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to PhyCalcPro</h1>
      <p>{msg}</p>
      {plot && <img src={plot} alt="Test Plot" />}
    </div>
  );
}