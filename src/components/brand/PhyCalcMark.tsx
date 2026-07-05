type PhyCalcMarkProps = {
  className?: string;
  size?: number;
};

/** Brand mark: P letterform with an engineering deflection curve. */
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
      <path
        d="M8 34V10h11.2c5.4 0 8.8 2.8 8.8 7.2 0 3.6-2.2 6-5.6 6.8L30 34h-4.6l-6.8-9.2H12.4V34H8zm4.4-13.2h6.4c2.8 0 4.4-1.2 4.4-3.4S21.6 14 18.8 14h-6.4v6.8z"
        fill="#f8fafc"
      />
      <path
        d="M10 30.5c4-5.2 8.8-7.8 14.4-7.8 2.2 0 4.2.4 6 1.2"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="30.4" cy="24" r="2.2" fill="#38bdf8" />
      <path
        d="M6 8h32M6 36h32M8 6v32M36 6v32"
        stroke="#334155"
        strokeWidth="0.6"
        strokeDasharray="2 3"
        opacity="0.45"
      />
    </svg>
  );
}
