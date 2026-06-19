"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getDesignCalculateLabel } from "@/hooks/useDesignCalculateLabel";
import CalculatorExportButton from "@/components/calculator/CalculatorExportButton";
import { calculatorPrimaryButtonClass } from "./styles";

type Props = {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  /** When true, label follows Check / Design / Select workflow mode. */
  designAware?: boolean;
  /** When false, hides the adjacent PDF export button. */
  showExport?: boolean;
};

export default function CalculatorCalculateButton({
  onClick,
  label = "Calculate",
  disabled = false,
  designAware = false,
  showExport = true,
}: Props) {
  const { mode } = useDesignWorkflow();
  const resolvedLabel = designAware ? getDesignCalculateLabel(mode, label) : label;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`${calculatorPrimaryButtonClass} min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {resolvedLabel}
        </button>
        {showExport ? <CalculatorExportButton /> : null}
      </div>
    </div>
  );
}
