const UNLOCK_KEY = "phycalcpro-unlock-all";

export function readClientUnlockAll(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

export function setClientUnlockAll(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) localStorage.setItem(UNLOCK_KEY, "true");
    else localStorage.removeItem(UNLOCK_KEY);
  } catch {
    // ignore
  }
}
