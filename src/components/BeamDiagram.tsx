export default function BeamDiagram({ length, loads }) {
  return (
    <svg width="100%" height="120">
      <line x1="10" y1="60" x2="90%" y2="60" stroke="black" />

      {/* supports */}
      <circle cx="10%" cy="60" r="6" fill="blue" />
      <rect x="88%" y="50" width="10" height="20" fill="gray" />

      {/* point loads */}
      {loads.map((l, i) =>
        l.type === "point" ? (
          <line
            key={i}
            x1="50%"
            y1="20"
            x2="50%"
            y2="60"
            stroke="red"
          />
        ) : null
      )}
    </svg>
  );
}