import { NextResponse } from "next/server";
import {
  parseDrawingPdf,
  type ParseDrawingTarget,
} from "@/lib/manufacturing/gdt/parseDrawing";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * POST multipart: file (PDF) + target (tolerance | fits).
 * Returns structured drawing extract — never computed engineering results.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  const targetRaw = String(form.get("target") ?? "tolerance");
  const target: ParseDrawingTarget =
    targetRaw === "fits" ? "fits" : "tolerance";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const type = file.type || "";
  if (!name.endsWith(".pdf") && type !== "application/pdf") {
    return NextResponse.json({ error: "pdf_only" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await parseDrawingPdf(buffer, target);

  return NextResponse.json({
    extract: result.extract,
    warnings: result.warnings,
    source: result.source,
    pageCount: result.pageCount ?? null,
  });
}
