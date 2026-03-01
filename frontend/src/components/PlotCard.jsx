import React from "react";

function PlotCard({ src }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
      <img src={src} alt="Plot" />
    </div>
  );
}

export default PlotCard;