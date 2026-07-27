import { NextResponse } from "next/server";
import { getModuleSolver, supportedSolverModuleIds } from "@/lib/qa/moduleSolverRegistry";

export const runtime = "nodejs";

type Params = { params: Promise<{ moduleId: string }> };

/**
 * Public calculate API scaffold (cross-cutting / post EDP-1+6).
 * Auth + quotas should wrap this when monetization is enabled.
 */
export async function POST(request: Request, { params }: Params) {
  const { moduleId } = await params;
  const solver = getModuleSolver(moduleId);
  if (!solver) {
    return NextResponse.json(
      { error: "unknown_module", moduleId, available: supportedSolverModuleIds().slice(0, 40) },
      { status: 404 }
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = solver(input as never);
    return NextResponse.json({
      moduleId,
      apiVersion: "v1",
      result,
      disclaimer:
        "Screening calculation from PhyCalcPro solvers. Not a certified design deliverable by itself.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "solve_failed",
        message: err instanceof Error ? err.message : "Unknown solver error",
      },
      { status: 400 }
    );
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { moduleId } = await params;
  const known = Boolean(getModuleSolver(moduleId));
  return NextResponse.json({
    moduleId,
    apiVersion: "v1",
    available: known,
    modules: supportedSolverModuleIds(),
    usage: `POST /api/v1/calculate/${moduleId} with JSON body matching the module solver input.`,
  });
}
