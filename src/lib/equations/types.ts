import type { PhysicsDimension } from "@/lib/physics/units";

export type EquationVariableSpec = {
  key: string;
  label: string;
  dimension: PhysicsDimension;
  min?: number;
  max?: number;
};

export type EquationTemplate = {
  id: string;
  title: string;
  expression: string;
  outputDimension: PhysicsDimension;
  variables: EquationVariableSpec[];
};

export type EquationExecutionLimits = {
  maxExpressionLength: number;
  maxTokens: number;
  maxOperations: number;
};

export type EquationEvaluationRequest = {
  expression: string;
  variables: Record<string, number>;
  limits?: Partial<EquationExecutionLimits>;
};

export type EquationEvaluationResult = {
  value: number;
  operations: number;
  normalizedExpression: string;
};
