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
