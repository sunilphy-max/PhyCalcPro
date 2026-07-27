import { NextResponse } from "next/server";
import { analyzeBrief, deriveParams } from "@/lib/copilot";
import type { CopilotParams } from "@/lib/copilot/types";
import { parseBriefWithLlm } from "@/lib/ai/parseBrief";

export const runtime = "nodejs";

type Body = {
  brief?: string;
  moduleId?: string;
};

/**
 * AI parse-brief endpoint (EDP-5).
 * Tries LLM structured extract when API key present; always falls back to deterministic parser.
 * Does not compute engineering results.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim();
  if (!brief) {
    return NextResponse.json({ error: "brief_required" }, { status: 400 });
  }

  const forcedModule = body.moduleId;
  const llm = await parseBriefWithLlm(brief, forcedModule);
  if (llm) {
    const params: CopilotParams = { ...llm.params };
    deriveParams(params);
    return NextResponse.json({
      params,
      startModuleId: llm.startModuleId ?? forcedModule ?? null,
      explanation: llm.explanation,
      source: "llm" as const,
    });
  }

  const analyzed = analyzeBrief(brief, forcedModule);
  const params: CopilotParams = { ...analyzed.params };
  deriveParams(params);

  return NextResponse.json({
    params,
    startModuleId: analyzed.startModuleId,
    explanation:
      analyzed.startReason +
      "\n\nDeterministic parse (no LLM key or LLM unavailable). Apply these inputs, then Calculate — solvers produce all results.",
    source: "deterministic" as const,
  });
}
