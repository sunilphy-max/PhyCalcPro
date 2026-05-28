import { NextResponse } from "next/server";
import { evaluateSafeEquation } from "@/lib/equations";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      expression: string;
      variables: Record<string, number>;
      limits?: {
        maxExpressionLength?: number;
        maxTokens?: number;
        maxOperations?: number;
      };
    };

    const result = evaluateSafeEquation({
      expression: body.expression,
      variables: body.variables ?? {},
      limits: body.limits,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Equation evaluation failed" },
      { status: 400 }
    );
  }
}
