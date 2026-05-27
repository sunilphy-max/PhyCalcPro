export type LocalProject<TData extends object> = TData & {
  id: string;
  name: string;
  created_at: string;
};

function getStorageKey(namespace: string) {
  return `phycalcpro:${namespace}:projects`;
}

function createProjectId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadLocalProjects<TData extends object>(
  namespace: string
): LocalProject<TData>[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(getStorageKey(namespace));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalProject<TData>[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalProject<TData extends object>(
  namespace: string,
  name: string,
  data: TData
): LocalProject<TData>[] {
  if (typeof window === "undefined") return [];

  const projects = loadLocalProjects<TData>(namespace);
  const nextProjects = [
    {
      ...data,
      id: createProjectId(),
      name,
      created_at: new Date().toISOString(),
    },
    ...projects,
  ].slice(0, 50);

  window.localStorage.setItem(
    getStorageKey(namespace),
    JSON.stringify(nextProjects)
  );

  return nextProjects;
}
