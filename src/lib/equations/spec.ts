export const userEquationSpecV1 = {
  syntax: {
    operators: ["+", "-", "*", "/", "^"],
    grouping: ["(", ")"],
    numeric: "Floating-point numbers only",
    identifiers: "Alphanumeric and underscore variable names",
  },
  disallowed: [
    "Assignments",
    "Property access",
    "Objects or arrays",
    "Conditionals and loops",
    "Custom function definitions",
  ],
  execution: {
    deterministic: true,
    timeoutModel: "operation-count limit",
    maxExpressionLength: 300,
    maxTokens: 180,
    maxOperations: 500,
  },
};
