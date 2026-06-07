"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getDesignCalculateLabel } from "@/hooks/useDesignCalculateLabel";
import { calculatorPrimaryButtonClass } from "./styles";

type Props = {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  /** When true, label follows Check / Design / Select workflow mode. */
  designAware?: boolean;
};

export default function CalculatorCalculateButton({
  onClick,
  label = "Calculate",
  disabled = false,
  designAware = false,
}: Props) {
  const { mode } = useDesignWorkflow();
  const resolvedLabel = designAware ? getDesignCalculateLabel(mode, label) : label;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${calculatorPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {resolvedLabel}
    </button>
  );
}
