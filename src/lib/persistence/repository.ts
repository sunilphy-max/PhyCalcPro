import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { memoryCreate, memoryList } from "./memoryStore";
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
  const nextItem = {
    ...payload,
    id: createId(collection.slice(0, 3)),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  } as EntityByCollection[T];

  const client = getSupabaseServerClient();
  if (!client) {
    return memoryCreate(collection, nextItem);
  }

  const { data, error } = await client.from(collection).insert(nextItem).select("*").single();
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
