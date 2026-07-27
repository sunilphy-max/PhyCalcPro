import type { CopilotParams } from "@/lib/copilot/types";

export type LlmParseResult = {
  params: CopilotParams;
  startModuleId: string | null;
  explanation: string;
};

/**
 * Optional OpenAI-compatible structured parse.
 * Returns null when OPENAI_API_KEY is unset or the call fails — callers must fall back.
 */
export async function parseBriefWithLlm(
  brief: string,
  forcedModuleId?: string
): Promise<LlmParseResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const system = `You extract engineering design inputs from a natural-language brief.
Return ONLY JSON with keys: params (object of numbers in SI: length m, force N, mass kg, deflection m, pressure Pa, etc.), startModuleId (string or null), explanation (string).
Never invent calculation results, stresses, or safety factors as answers — only proposed INPUTS.
Prefer module id "${forcedModuleId ?? "beams"}" when relevant.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: brief },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      params?: CopilotParams;
      startModuleId?: string | null;
      explanation?: string;
    };
    return {
      params: parsed.params ?? {},
      startModuleId: forcedModuleId ?? parsed.startModuleId ?? null,
      explanation:
        parsed.explanation ??
        "LLM extracted candidate inputs. Run the verified solver to obtain results.",
    };
  } catch {
    return null;
  }
}
