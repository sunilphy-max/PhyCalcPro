import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { memoryCreate, memoryDelete, memoryList, memoryUpsert } from "./memoryStore";
import type {
  CollectionName,
  PhysicsEquation,
  PhysicsModel,
  PhysicsProject,
  PhysicsRun,
} from "./types";

type EntityByCollection = {
  projects: PhysicsProject;
  models: PhysicsModel;
  equations: PhysicsEquation;
  runs: PhysicsRun;
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function listWithFallback<T extends keyof EntityByCollection>(
  collection: T,
  userId: string
): Promise<EntityByCollection[T][]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return memoryList<EntityByCollection[T]>(collection).filter((item) => item.userId === userId);
  }

  const { data, error } = await client
    .from(collection)
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EntityByCollection[T][];
}

async function createWithFallback<T extends keyof EntityByCollection>(
  collection: T,
  payload: Omit<EntityByCollection[T], "id" | "createdAt" | "updatedAt">
): Promise<EntityByCollection[T]> {
  const providedId = (payload as { id?: string }).id;
  const nextItem = {
    ...payload,
    id: providedId ?? createId(collection.slice(0, 3)),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  } as EntityByCollection[T];

  const client = getSupabaseServerClient();
  if (!client) {
    return memoryUpsert(collection, nextItem);
  }

  const { data, error } = await client.from(collection).upsert(nextItem).select("*").single();
  if (error) throw new Error(error.message);
  return data as EntityByCollection[T];
}

export async function listRecords<T extends CollectionName>(
  collection: T,
  userId: string
): Promise<EntityByCollection[T][]> {
  return listWithFallback(collection, userId);
}

export async function createRecord<T extends CollectionName>(
  collection: T,
  payload: Omit<EntityByCollection[T], "id" | "createdAt" | "updatedAt">
): Promise<EntityByCollection[T]> {
  return createWithFallback(collection, payload);
}

export async function ensureDefaultProject(userId: string): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) {
    const existing = memoryList<EntityByCollection["projects"]>("projects").find(
      (p) => p.id === "default" && p.userId === userId
    );
    if (!existing) {
      memoryCreate("projects", {
        id: "default",
        userId,
        name: "Default",
        tags: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    return;
  }

  const { data } = await client
    .from("projects")
    .select("id")
    .eq("id", "default")
    .eq("userId", userId)
    .maybeSingle();

  if (data) return;

  await client.from("projects").upsert({
    id: "default",
    userId,
    name: "Default",
    tags: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
}

export async function deleteRecord(
  collection: "models",
  userId: string,
  id: string
): Promise<boolean> {
  const client = getSupabaseServerClient();
  if (!client) {
    const item = memoryList<EntityByCollection["models"]>("models").find(
      (entry) => entry.id === id && entry.userId === userId
    );
    if (!item) return false;
    return memoryDelete("models", id);
  }

  const { error, count } = await client
    .from("models")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("userId", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
