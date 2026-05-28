"use client";

import { useState } from "react";
import { evaluateSafeEquation } from "@/lib/equations";

type RunRecordPayload = {
  projectId: string;
  modelId: string;
  equationId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

type UseEquationWorkflowArgs = {
  initialExpression: string;
  fromBaseOutput: (value: number) => number;
};

export function useEquationWorkflow({
  initialExpression,
  fromBaseOutput,
}: UseEquationWorkflowArgs) {
  const [equationExpression, setEquationExpression] = useState(initialExpression);
  const [equationValueDisplay, setEquationValueDisplay] = useState<number | null>(null);
  const [equationError, setEquationError] = useState<string | null>(null);
  const [runStatusMessage, setRunStatusMessage] = useState<string | null>(null);

  const evaluateExpression = (variables: Record<string, number>) => {
    let baseValue: number | null = null;
    let failure: string | null = null;

    try {
      const result = evaluateSafeEquation({
        expression: equationExpression,
        variables,
      });
      baseValue = result.value;
      setEquationValueDisplay(fromBaseOutput(result.value));
      setEquationError(null);
    } catch (error) {
      failure = error instanceof Error ? error.message : "Equation evaluation failed";
      setEquationValueDisplay(null);
      setEquationError(failure);
    }

    return { baseValue, failure };
  };

  const recordRun = async (payload: RunRecordPayload) => {
    try {
      const response = await fetch("/api/workspaces/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-phycalc-user-id": "anonymous",
        },
        body: JSON.stringify({
          ...payload,
          status: "succeeded",
        }),
      });
      setRunStatusMessage(
        response.ok
          ? "Run recorded in workspace history."
          : "Run saved locally only (workspace API unavailable)."
      );
    } catch {
      setRunStatusMessage("Run saved locally only (workspace API unavailable).");
    }
  };

  return {
    equationExpression,
    setEquationExpression,
    equationValueDisplay,
    equationError,
    runStatusMessage,
    evaluateExpression,
    recordRun,
  };
}
