import type {
  EquationEvaluationRequest,
  EquationEvaluationResult,
  EquationExecutionLimits,
  EquationVariableSpec,
} from "./types";

const DEFAULT_LIMITS: EquationExecutionLimits = {
  maxExpressionLength: 300,
  maxTokens: 180,
  maxOperations: 500,
};

const ALLOWED_FUNCTIONS: Record<string, (value: number) => number> = {
  abs: Math.abs,
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log,
  exp: Math.exp,
};

const ALLOWED_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type TokenType = "number" | "identifier" | "operator" | "leftParen" | "rightParen" | "comma";
type Token = { type: TokenType; value: string };

const OP_PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 3,
};

const RIGHT_ASSOCIATIVE = new Set(["^"]);

function tokenize(expression: string, limits: EquationExecutionLimits): Token[] {
  if (expression.length > limits.maxExpressionLength) {
    throw new Error(`Expression exceeds ${limits.maxExpressionLength} characters`);
  }

  const tokens: Token[] = [];
  const normalized = expression.replace(/\s+/g, "");
  let i = 0;

  while (i < normalized.length) {
    const c = normalized[i];
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < normalized.length && /[0-9.]/.test(normalized[j])) j += 1;
      tokens.push({ type: "number", value: normalized.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < normalized.length && /[A-Za-z0-9_]/.test(normalized[j])) j += 1;
      tokens.push({ type: "identifier", value: normalized.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "(") tokens.push({ type: "leftParen", value: c });
    else if (c === ")") tokens.push({ type: "rightParen", value: c });
    else if (c === ",") tokens.push({ type: "comma", value: c });
    else if (OP_PRECEDENCE[c]) tokens.push({ type: "operator", value: c });
    else throw new Error(`Invalid character "${c}" in expression`);
    i += 1;
  }

  if (tokens.length > limits.maxTokens) {
    throw new Error(`Expression exceeds ${limits.maxTokens} tokens`);
  }
  return tokens;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
      continue;
    }
    if (token.type === "identifier") {
      stack.push(token);
      continue;
    }
    if (token.type === "comma") {
      while (stack.length && stack[stack.length - 1].type !== "leftParen") {
        output.push(stack.pop() as Token);
      }
      continue;
    }
    if (token.type === "operator") {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type !== "operator") break;

        const higher =
          OP_PRECEDENCE[top.value] > OP_PRECEDENCE[token.value] ||
          (OP_PRECEDENCE[top.value] === OP_PRECEDENCE[token.value] && !RIGHT_ASSOCIATIVE.has(token.value));

        if (!higher) break;
        output.push(stack.pop() as Token);
      }
      stack.push(token);
      continue;
    }
    if (token.type === "leftParen") {
      stack.push(token);
      continue;
    }
    if (token.type === "rightParen") {
      while (stack.length && stack[stack.length - 1].type !== "leftParen") {
        output.push(stack.pop() as Token);
      }
      const leftParen = stack.pop();
      if (!leftParen || leftParen.type !== "leftParen") {
        throw new Error("Mismatched parentheses");
      }
      if (stack.length && stack[stack.length - 1].type === "identifier") {
        output.push(stack.pop() as Token);
      }
    }
  }

  while (stack.length) {
    const token = stack.pop() as Token;
    if (token.type === "leftParen" || token.type === "rightParen") {
      throw new Error("Mismatched parentheses");
    }
    output.push(token);
  }

  return output;
}

function executeRpn(rpn: Token[], variables: Record<string, number>, limits: EquationExecutionLimits): EquationEvaluationResult {
  const stack: number[] = [];
  let operations = 0;

  for (const token of rpn) {
    operations += 1;
    if (operations > limits.maxOperations) {
      throw new Error(`Exceeded operation limit (${limits.maxOperations})`);
    }

    if (token.type === "number") {
      stack.push(Number(token.value));
      continue;
    }

    if (token.type === "identifier") {
      if (token.value in ALLOWED_FUNCTIONS) {
        const arg = stack.pop();
        if (typeof arg !== "number") throw new Error(`Function "${token.value}" missing argument`);
        const value = ALLOWED_FUNCTIONS[token.value](arg);
        if (!Number.isFinite(value)) throw new Error(`Function "${token.value}" produced invalid value`);
        stack.push(value);
      } else if (token.value in ALLOWED_CONSTANTS) {
        stack.push(ALLOWED_CONSTANTS[token.value]);
      } else if (token.value in variables) {
        stack.push(variables[token.value]);
      } else {
        throw new Error(`Unknown identifier "${token.value}"`);
      }
      continue;
    }

    if (token.type === "operator") {
      const right = stack.pop();
      const left = stack.pop();
      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error(`Operator "${token.value}" has invalid operands`);
      }
      const result =
        token.value === "+"
          ? left + right
          : token.value === "-"
            ? left - right
            : token.value === "*"
              ? left * right
              : token.value === "/"
                ? left / right
                : Math.pow(left, right);
      if (!Number.isFinite(result)) {
        throw new Error(`Operator "${token.value}" produced invalid value`);
      }
      stack.push(result);
      continue;
    }
  }

  if (stack.length !== 1) {
    throw new Error("Expression did not resolve to a single numeric value");
  }

  return {
    value: stack[0],
    operations,
    normalizedExpression: rpn.map((token) => token.value).join(" "),
  };
}

export function validateVariables(specs: EquationVariableSpec[], values: Record<string, number>): void {
  for (const spec of specs) {
    const value = values[spec.key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Variable "${spec.key}" is missing or invalid`);
    }
    if (typeof spec.min === "number" && value < spec.min) {
      throw new Error(`Variable "${spec.key}" is below minimum ${spec.min}`);
    }
    if (typeof spec.max === "number" && value > spec.max) {
      throw new Error(`Variable "${spec.key}" is above maximum ${spec.max}`);
    }
  }
}

export function evaluateSafeEquation(request: EquationEvaluationRequest): EquationEvaluationResult {
  const limits: EquationExecutionLimits = {
    ...DEFAULT_LIMITS,
    ...request.limits,
  };

  const tokens = tokenize(request.expression, limits);
  const rpn = toRpn(tokens);
  return executeRpn(rpn, request.variables, limits);
}

export const equationExecutionPolicy = {
  allowedFunctions: Object.keys(ALLOWED_FUNCTIONS),
  allowedConstants: Object.keys(ALLOWED_CONSTANTS),
  defaultLimits: DEFAULT_LIMITS,
  notes: [
    "No property access, arrays, objects, assignments, or control flow.",
    "Single-argument math functions only.",
    "Deterministic execution enforced with expression/token/operation limits.",
  ],
};
