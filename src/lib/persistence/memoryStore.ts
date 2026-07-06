import type { CollectionName } from "./types";

type GenericEntity = {
  id: string;
  [key: string]: unknown;
};

type MemoryDb = Record<CollectionName, GenericEntity[]>;

const db: MemoryDb = {
  projects: [],
  models: [],
  equations: [],
  runs: [],
};

export function memoryList<T extends GenericEntity>(collection: CollectionName): T[] {
  return [...(db[collection] as T[])];
}

export function memoryCreate<T extends GenericEntity>(collection: CollectionName, item: T): T {
  db[collection].unshift(item);
  return item;
}

export function memoryDelete(collection: CollectionName, id: string): boolean {
  const index = db[collection].findIndex((item) => item.id === id);
  if (index < 0) return false;
  db[collection].splice(index, 1);
  return true;
}

export function memoryUpsert<T extends GenericEntity>(collection: CollectionName, item: T): T {
  const index = db[collection].findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    db[collection][index] = item;
    return item;
  }
  db[collection].unshift(item);
  return item;
}
