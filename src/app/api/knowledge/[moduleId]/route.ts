import { NextResponse } from "next/server";
import { getModuleDocForDisplay } from "@/lib/documentation/loadReference";

type Params = { params: Promise<{ moduleId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { moduleId } = await params;
  const doc = getModuleDocForDisplay(moduleId);
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    title: doc.title,
    markdown: doc.markdown,
    toc: doc.toc,
  });
}
