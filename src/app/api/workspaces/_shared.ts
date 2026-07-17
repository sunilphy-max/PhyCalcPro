import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabaseServer";
import { defaultProjectId, isDefaultProjectId } from "@/lib/persistence/defaultProject";
import { createRecord, deleteRecord, ensureDefaultProject, listRecords } from "@/lib/persistence/repository";
import type { CollectionName } from "@/lib/persistence/types";

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAuthenticatedUser(request: Request): Promise<AuthResult> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const spoofedId = request.headers.get("x-phycalc-user-id")?.trim();
  if (spoofedId && spoofedId !== user.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User identity mismatch." }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}

export async function listCollection(collection: CollectionName, request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await listRecords(collection, auth.userId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to list records" },
      { status: 500 }
    );
  }
}

export async function createCollection(collection: CollectionName, request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rawProjectId = String(body.projectId ?? "default");
    const projectId = isDefaultProjectId(rawProjectId)
      ? defaultProjectId(auth.userId)
      : rawProjectId;

    if (isDefaultProjectId(rawProjectId)) {
      await ensureDefaultProject(auth.userId);
    }

    const data = await createRecord(collection, {
      ...body,
      projectId,
      userId: auth.userId,
    } as never);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create record" },
      { status: 400 }
    );
  }
}

export async function deleteModel(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing model id." }, { status: 400 });
  }

  try {
    const deleted = await deleteRecord("models", auth.userId, id);
    if (!deleted) {
      return NextResponse.json({ error: "Model not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete record" },
      { status: 500 }
    );
  }
}
