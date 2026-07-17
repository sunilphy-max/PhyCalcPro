import { getAuthHeaders } from "./authHeaders";
import { defaultProjectId } from "./defaultProject";

export type PersistenceMode = "guest" | "authenticated";

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
const SESSION_PREFIX = `${KEY_PREFIX}session:`;
const USER_PREFIX = `${KEY_PREFIX}user:`;
const KEY_SUFFIX = ":projects";
const MAX_PROJECTS = 50;

let currentMode: PersistenceMode = "guest";
let currentUserId: string | null = null;

export function setPersistenceMode(mode: PersistenceMode, userId?: string | null) {
  currentMode = mode;
  currentUserId = userId ?? null;
}

export function getPersistenceMode(): PersistenceMode {
  return currentMode;
}

export function getAuthenticatedUserId(): string | null {
  return currentUserId;
}

export function canPersistAcrossSessions(): boolean {
  return currentMode === "authenticated";
}

function createProjectId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getProjectsKey(namespace: string, mode: PersistenceMode = currentMode, userId = currentUserId) {
  if (mode === "guest") {
    return `${SESSION_PREFIX}${namespace}${KEY_SUFFIX}`;
  }
  if (!userId) {
    return `${KEY_PREFIX}${namespace}${KEY_SUFFIX}`;
  }
  return `${USER_PREFIX}${userId}:${namespace}${KEY_SUFFIX}`;
}

function getStorage(mode: PersistenceMode = currentMode): Storage | null {
  if (typeof window === "undefined") return null;
  return mode === "guest" ? window.sessionStorage : window.localStorage;
}

export function loadProjects<TData extends object>(namespace: string): LocalProject<TData>[] {
  const storage = getStorage();
  if (!storage) return [];

  const raw = storage.getItem(getProjectsKey(namespace));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalProject<TData>[]) : [];
  } catch {
    return [];
  }
}

export function saveProject<TData extends object>(
  namespace: string,
  name: string,
  data: TData
): LocalProject<TData>[] {
  const storage = getStorage();
  if (!storage) return [];

  const projects = loadProjects<TData>(namespace);
  const nextProject: LocalProject<TData> = {
    ...data,
    id: createProjectId(),
    name,
    created_at: new Date().toISOString(),
  };
  const nextProjects = [nextProject, ...projects].slice(0, MAX_PROJECTS);

  storage.setItem(getProjectsKey(namespace), JSON.stringify(nextProjects));

  if (currentMode === "authenticated") {
    void syncProjectToCloud(namespace, nextProject);
  }

  return nextProjects;
}

export function deleteProject(namespace: string, id: string): void {
  const storage = getStorage();
  if (!storage) return;

  const projects = loadProjects<object>(namespace).filter((p) => p.id !== id);
  storage.setItem(getProjectsKey(namespace), JSON.stringify(projects));

  if (currentMode === "authenticated") {
    void deleteProjectFromCloud(id);
  }
}

export function listAllProjects(): SavedStudy[] {
  const storage = getStorage();
  if (!storage) return [];

  const studies: SavedStudy[] = [];

  if (currentMode === "guest") {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || !key.startsWith(SESSION_PREFIX) || !key.endsWith(KEY_SUFFIX)) continue;
      const namespace = key.slice(SESSION_PREFIX.length, key.length - KEY_SUFFIX.length);
      pushStudiesFromRaw(studies, namespace, storage.getItem(key));
    }
  } else if (currentUserId) {
    const userPrefix = `${USER_PREFIX}${currentUserId}:`;
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || !key.startsWith(userPrefix) || !key.endsWith(KEY_SUFFIX)) continue;
      const namespace = key.slice(userPrefix.length, key.length - KEY_SUFFIX.length);
      pushStudiesFromRaw(studies, namespace, storage.getItem(key));
    }
  }

  return studies.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
}

function pushStudiesFromRaw(studies: SavedStudy[], namespace: string, raw: string | null) {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
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

export function listSessionProjectNamespaces(): string[] {
  if (typeof window === "undefined") return [];
  const namespaces: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key || !key.startsWith(SESSION_PREFIX) || !key.endsWith(KEY_SUFFIX)) continue;
    namespaces.push(key.slice(SESSION_PREFIX.length, key.length - KEY_SUFFIX.length));
  }
  return namespaces;
}

export function loadSessionProjects<TData extends object>(
  namespace: string
): LocalProject<TData>[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(getProjectsKey(namespace, "guest"));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalProject<TData>[]) : [];
  } catch {
    return [];
  }
}

export function clearSessionData(): void {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (key?.startsWith(SESSION_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
  window.sessionStorage.removeItem(`${SESSION_PREFIX}history`);
}

/** Clear authenticated local cache for a specific user (or legacy unscoped keys). */
export function clearAuthenticatedLocalData(userId?: string | null): void {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (userId && key.startsWith(`${USER_PREFIX}${userId}:`)) {
      keysToRemove.push(key);
      continue;
    }
    // Legacy unscoped authenticated keys from before user scoping
    if (
      !userId &&
      key.startsWith(KEY_PREFIX) &&
      !key.startsWith(SESSION_PREFIX) &&
      !key.startsWith(USER_PREFIX) &&
      key.endsWith(KEY_SUFFIX)
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export function hydrateProjectsFromCloud(
  models: Array<{ moduleId: string; payload: Record<string, unknown> }>
): void {
  if (typeof window === "undefined" || currentMode !== "authenticated" || !currentUserId) return;

  const byNamespace = new Map<string, LocalProject<object>[]>();

  for (const model of models) {
    const payload = model.payload;
    if (!payload || typeof payload !== "object" || !("id" in payload) || !("name" in payload)) {
      continue;
    }
    const namespace = model.moduleId;
    const list = byNamespace.get(namespace) ?? [];
    list.push(payload as LocalProject<object>);
    byNamespace.set(namespace, list);
  }

  for (const [namespace, projects] of byNamespace) {
    const sorted = projects.sort((a, b) => (b.created_at > a.created_at ? 1 : -1)).slice(0, MAX_PROJECTS);
    window.localStorage.setItem(
      getProjectsKey(namespace, "authenticated", currentUserId),
      JSON.stringify(sorted)
    );
  }
}

async function syncProjectToCloud(
  namespace: string,
  project: LocalProject<object>
): Promise<boolean> {
  if (typeof window === "undefined" || !currentUserId) return false;
  try {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const res = await fetch("/api/workspaces/models", {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: project.id,
        projectId: defaultProjectId(currentUserId),
        title: project.name,
        moduleId: namespace,
        payload: project,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteProjectFromCloud(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const headers = await getAuthHeaders();
    await fetch(`/api/workspaces/models?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
  } catch {
    // Best-effort cloud delete.
  }
}

export async function mergeSessionProjectsToCloud(): Promise<boolean> {
  if (!currentUserId) return false;
  const namespaces = listSessionProjectNamespaces();
  let allOk = true;
  for (const namespace of namespaces) {
    const projects = loadSessionProjects<object>(namespace);
    for (const project of projects) {
      const ok = await syncProjectToCloud(namespace, project);
      if (!ok) allOk = false;
    }
  }
  return allOk;
}
