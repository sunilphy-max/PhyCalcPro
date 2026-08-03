import "server-only";

import type { DrawingExtract } from "./types";
import { emptyDrawingExtract, validateDrawingExtract } from "./schema";

export type ParseDrawingTarget = "tolerance" | "fits";

export type ParseDrawingResult = {
  extract: DrawingExtract;
  warnings: string[];
  source: "llm" | "unavailable";
  pageCount?: number;
};

const SYSTEM_PROMPT = `You are an expert mechanical engineer reading 2D engineering drawings (ASME Y14.5 / ISO GPS).
Extract ONLY factual callouts visible on the drawing pages. Return JSON with keys:
- metadata: { drawingNumber?, revision?, sheet?, title?, material?, scale?, units? }
- datums: [{ id, type: "plane"|"axis"|"point", label? }]
- features: [{ id, label?, nominal, upperLimit, lowerLimit, isInternal }]  // SI metres
- frames: [{ id, characteristic, zoneValue, isDiameterZone?, materialCondition: "RFS"|"MMC"|"LMC", datumRefs: [{ datumId, materialCondition? }], featureOfSizeId?, label?, confidence?, location?: { sheet?, zone?, page? } }]
  characteristic one of: position, perpendicularity, parallelism, profile, concentricity, coaxiality, circularRunout, totalRunout, size
- dimensions: [{ id, label?, nominal, upperDeviation, lowerDeviation, isInternal?, confidence?, location?: { sheet?, zone?, page? } }] // SI metres
- fitCallouts: [{ id, label?, nominal, designation?, holeLetter?, holeGrade?, shaftLetter?, shaftGrade?, holeUpper?, holeLower?, shaftUpper?, shaftLower?, confidence? }]
- suggestedContributors: [{ id, label?, sense: 1|-1, axis: "X"|"Y"|"Z", source: { kind: "size"|"fcf"|"datumShift", featureOfSizeId?, fcfId?, datumId? } }]
- notes: string[]

Rules:
- Convert all lengths to SI metres (e.g. 10 mm → 0.01).
- Never invent stack-up results, clearances, or computed engineering answers.
- Prefer empty arrays over guessing. Set confidence 0–1 when unsure.
- Include location.sheet/zone/page when readable from the drawing for traceability.
- For target "fits", prioritize fitCallouts and limit dimensions on mating diameters.
- For target "tolerance", prioritize dimension chains, FCFs, datums, and suggestedContributors for a 1D stack.`;

/**
 * Parse an engineering drawing PDF into structured GD&T / fit inputs via vision LLM.
 * Returns source "unavailable" when OPENAI_API_KEY is missing or the call fails.
 * Optional `pageImages` (from browser rasterization) enable vision when server has no canvas.
 */
export async function parseDrawingPdf(
  buffer: Buffer,
  target: ParseDrawingTarget,
  pageImages: string[] = []
): Promise<ParseDrawingResult> {
  const warnings: string[] = [];
  // Polyfill before any pdfjs import in this request (API route / Node).
  try {
    const { ensurePdfJsDomPolyfills } = await import("./domMatrixPolyfill");
    ensurePdfJsDomPolyfills();
  } catch {
    // ignore
  }

  let raster;
  try {
    const { rasterizePdf } = await import("./rasterizePdf");
    raster = await rasterizePdf(buffer);
    warnings.push(...raster.warnings);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "PDF rasterization failed";
    // Continue with client page images only when text extract fails (e.g. DOMMatrix).
    if (pageImages.length > 0) {
      warnings.push(`PDF text extract skipped: ${msg}`);
      raster = {
        pages: [],
        textByPage: [],
        pageCount: pageImages.length,
        warnings: [],
      };
    } else {
      return {
        extract: emptyDrawingExtract(),
        warnings: [msg],
        source: "unavailable",
      };
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    warnings.push("OPENAI_API_KEY is not set — drawing vision parse unavailable.");
    return {
      extract: emptyDrawingExtract(),
      warnings,
      source: "unavailable",
      pageCount: raster.pageCount,
    };
  }

  const model = process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";
  const textContext = raster.textByPage
    .map((t, i) => `--- page ${i + 1} text ---\n${t}`)
    .join("\n")
    .slice(0, 12000);

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail?: string } }
  > = [
    {
      type: "text",
      text: `Target module: ${target}.\nExtract GD&T and fit callouts from these drawing pages.\nEmbedded text (may be incomplete):\n${textContext}`,
    },
  ];

  const images =
    pageImages.length > 0
      ? pageImages
      : raster.pages.map((p) => p.dataUrl);

  for (const url of images.slice(0, 5)) {
    if (url.startsWith("data:image/")) {
      content.push({
        type: "image_url",
        image_url: { url, detail: "high" },
      });
    }
  }

  if (images.length === 0) {
    warnings.push("No page images available; attempting text-only extract.");
  }

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      warnings.push(`Vision API error ${res.status}: ${body.slice(0, 200)}`);
      return {
        extract: emptyDrawingExtract(),
        warnings,
        source: "unavailable",
        pageCount: raster.pageCount,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      warnings.push("Vision API returned empty content.");
      return {
        extract: emptyDrawingExtract(),
        warnings,
        source: "unavailable",
        pageCount: raster.pageCount,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      warnings.push("Vision API returned non-JSON content.");
      return {
        extract: emptyDrawingExtract(),
        warnings,
        source: "unavailable",
        pageCount: raster.pageCount,
      };
    }

    const extract = validateDrawingExtract(parsed);
    if (
      extract.frames.length === 0 &&
      extract.dimensions.length === 0 &&
      extract.fitCallouts.length === 0
    ) {
      warnings.push(
        "No dimensions, FCFs, or fit callouts were extracted. Check drawing clarity or enter values manually."
      );
    }

    return {
      extract,
      warnings,
      source: "llm",
      pageCount: raster.pageCount,
    };
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : "Vision parse failed");
    return {
      extract: emptyDrawingExtract(),
      warnings,
      source: "unavailable",
      pageCount: raster.pageCount,
    };
  }
}
