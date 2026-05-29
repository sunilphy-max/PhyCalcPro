import type { ReleaseTier } from "@/lib/qa/types";
import { releaseTierLabel, releaseTierStyles } from "@/lib/qa/maturityGates";

type Props = {
  tier: ReleaseTier;
  className?: string;
};

export default function ReleaseTierBadge({ tier, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${releaseTierStyles(tier)} ${className}`}
    >
      {releaseTierLabel(tier)}
    </span>
  );
}
