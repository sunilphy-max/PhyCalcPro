/**
 * Append-only local project revision trail (EDP-6).
 */

export type ProjectRevision = {
  id: string;
  createdAt: string;
  note: string;
  inputHash?: string;
  author?: string;
};

const PREFIX = "phycalcpro:revisions:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function loadRevisions(namespace: string, projectKey: string): ProjectRevision[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(`${PREFIX}${namespace}:${projectKey}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProjectRevision[]) : [];
  } catch {
    return [];
  }
}

export function appendRevision(
  namespace: string,
  projectKey: string,
  note: string,
  inputHash?: string,
  author?: string
): ProjectRevision[] {
  const s = storage();
  const prev = loadRevisions(namespace, projectKey);
  const next: ProjectRevision = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`,
    createdAt: new Date().toISOString(),
    note,
    inputHash,
    author,
  };
  const list = [next, ...prev].slice(0, 100);
  s?.setItem(`${PREFIX}${namespace}:${projectKey}`, JSON.stringify(list));
  return list;
}

/** Stable short hash of JSON-serializable inputs for revision fingerprints. */
export function hashInputs(value: unknown): string {
  const str = JSON.stringify(value);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
