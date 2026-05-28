import { NextResponse } from "next/server";
import { createRecord, listRecords } from "@/lib/persistence/repository";
import type { CollectionName } from "@/lib/persistence/types";

function resolveUserId(request: Request): string {
  const userId = request.headers.get("x-phycalc-user-id");
  return userId?.trim() || "anonymous";
}

export async function listCollection(collection: CollectionName, request: Request) {
  try {
    const data = await listRecords(collection, resolveUserId(request));
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to list records" },
      { status: 500 }
    );
  }
}

export async function createCollection(collection: CollectionName, request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const data = await createRecord(collection, {
      ...body,
      userId: resolveUserId(request),
    } as never);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create record" },
      { status: 400 }
    );
  }
}
