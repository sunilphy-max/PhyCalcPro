"use client";

import { calculatorPrimaryButtonClass, calculatorSecondaryButtonClass } from "@/components/calculator/styles";

type Props = {
  onApply: () => void;
  onClear: () => void;
  applyLabel?: string;
  disabled?: boolean;
};

export default function DrawingApplyBar({
  onApply,
  onClear,
  applyLabel = "Apply to calculator",
  disabled,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={calculatorPrimaryButtonClass}
        disabled={disabled}
        onClick={onApply}
      >
        {applyLabel}
      </button>
      <button type="button" className={calculatorSecondaryButtonClass} onClick={onClear}>
        Clear extract
      </button>
    </div>
  );
}
