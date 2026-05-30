"use client";

import { calculatorPrimaryButtonClass } from "./styles";

type Props = {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
};

export default function CalculatorCalculateButton({
  onClick,
  label = "Calculate",
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${calculatorPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
    </button>
  );
}
