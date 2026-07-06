type PhyCalcMarkProps = {
  className?: string;
  size?: number;
};

/** Brand mark: P monogram with equals sign and a mini engineering plot (δ result). */
export default function PhyCalcMark({ className = "", size = 44 }: PhyCalcMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="44" height="44" rx="12" fill="#0f172a" />

      {/* Graph grid — calculation workspace */}
      <g opacity="0.32" stroke="#334155" strokeWidth="0.5">
        <path d="M20 23h20M20 29h20M25 15v21M31 15v21M37 15v21" />
      </g>

      {/* Plot axes */}
      <path
        d="M20 36V15M20 36h20"
        stroke="#475569"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M25 36v1.1M31 36v1.1M37 36v1.1M20 23h-1.1M20 29h-1.1"
        stroke="#475569"
        strokeWidth="0.65"
        strokeLinecap="round"
      />

      {/* Compact P — vertical stem with bowl, no diagonal leg */}
      <path
        fillRule="evenodd"
        d="M6 34V10h8.2c4.2 0 6.8 2.2 6.8 5.8 0 2.8-1.7 4.8-4.3 5.4H9.4V34H6zm3.4-17h4.8c2.2 0 3.5.9 3.5 2.7s-1.3 2.7-3.5 2.7H9.4V17z"
        fill="#f8fafc"
      />

      {/* Equals — calculation bridge between input and result */}
      <path
        d="M15.2 26.8h2.2M15.2 28.8h2.2"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Input variable chip */}
      <rect x="21" y="10.5" width="9" height="5" rx="1.2" stroke="#475569" strokeWidth="0.55" fill="#1e293b" />
      <text
        x="25.5"
        y="14.5"
        textAnchor="middle"
        fill="#94a3b8"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="4.5"
        fontWeight="500"
      >
        w
      </text>

      {/* Beam deflection curve */}
      <path
        d="M21.5 33C26 21.5 34 21.5 38.5 33"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Peak annotation — calculated result */}
      <circle cx="30" cy="21" r="2" fill="#38bdf8" />
      <path
        d="M31.4 20L35.5 16.5"
        stroke="#38bdf8"
        strokeWidth="0.75"
        strokeDasharray="1.4 1.4"
        strokeLinecap="round"
      />
      <text
        x="36"
        y="17.8"
        fill="#38bdf8"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="6.5"
        fontWeight="600"
      >
        δ
      </text>
      <text
        x="36"
        y="22.5"
        fill="#94a3b8"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="4.8"
        fontWeight="500"
      >
        8.4
      </text>
    </svg>
  );
}
