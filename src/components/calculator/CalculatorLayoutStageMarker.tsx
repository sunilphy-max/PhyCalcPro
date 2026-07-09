"use client";

import { useEffect } from "react";
import { useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";

type Props = {
  active: boolean;
};

/** Opt-in stage signal for modules that do not use CalculatorResultsShell. */
export default function CalculatorLayoutStageMarker({ active }: Props) {
  const reportContext = useCalculatorReportOptional();

  useEffect(() => {
    reportContext?.setResultsStageActive(active);
  }, [active, reportContext]);

  return null;
}
