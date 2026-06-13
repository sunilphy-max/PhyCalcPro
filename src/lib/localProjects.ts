export type LocalProject<TData extends object> = TData & {
  id: string;
  name: string;
  created_at: string;
};

export type SavedStudy = {
  namespace: string;
  id: string;
  name: string;
  created_at: string;
};

const KEY_PREFIX = "phycalcpro:";
const KEY_SUFFIX = ":projects";

function getStorageKey(namespace: string) {
  return `${KEY_PREFIX}${namespace}${KEY_SUFFIX}`;
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
  const nextProject = {
    ...data,
    id: createProjectId(),
    name,
    created_at: new Date().toISOString(),
  };
  const nextProjects = [nextProject, ...projects].slice(0, 50);

  window.localStorage.setItem(
    getStorageKey(namespace),
    JSON.stringify(nextProjects)
  );

  void syncProjectToCloud(namespace, nextProject);

  return nextProjects;
}

export function deleteLocalProject(namespace: string, id: string): void {
  if (typeof window === "undefined") return;
  const projects = loadLocalProjects<object>(namespace).filter((p) => p.id !== id);
  window.localStorage.setItem(getStorageKey(namespace), JSON.stringify(projects));
}

/** All saved studies across every module namespace, newest first. */
export function listAllLocalProjects(): SavedStudy[] {
  if (typeof window === "undefined") return [];

  const studies: SavedStudy[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX) || !key.endsWith(KEY_SUFFIX)) continue;
    const namespace = key.slice(KEY_PREFIX.length, key.length - KEY_SUFFIX.length);
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        if (item && typeof item === "object" && "id" in item && "name" in item) {
          studies.push({
            namespace,
            id: String(item.id),
            name: String(item.name),
            created_at: String((item as { created_at?: string }).created_at ?? ""),
          });
        }
      }
    } catch {
      // Skip unparseable namespaces.
    }
  }

  return studies.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
}

/** Stable per-browser user id for the workspaces API (until real auth). */
export function getLocalUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  const key = `${KEY_PREFIX}user-id`;
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = createProjectId();
    window.localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Best-effort cloud sync via the workspaces API (Supabase-backed when
 * configured, in-memory fallback otherwise). Never blocks or throws —
 * localStorage remains the source of truth for the browser.
 */
async function syncProjectToCloud(namespace: string, project: LocalProject<object>): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/workspaces/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-phycalc-user-id": getLocalUserId(),
      },
      body: JSON.stringify({
        projectId: "local",
        title: project.name,
        moduleId: namespace,
        payload: project,
      }),
    });
  } catch {
    // Offline or unconfigured backend — local copy is enough.
  }
}
