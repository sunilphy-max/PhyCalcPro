"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { setAccessTokenGetter } from "@/lib/persistence/authHeaders";
import {
  clearAuthenticatedLocalData,
  clearSessionData,
  hydrateProjectsFromCloud,
  mergeSessionProjectsToCloud,
  setPersistenceMode,
  type PersistenceMode,
} from "@/lib/persistence/clientStorage";
import {
  clearSessionCalculationHistory,
  mergeSessionHistoryToCloud,
} from "@/lib/persistence/calculationHistory";

type PersistenceContextValue = {
  mode: PersistenceMode;
  userId: string | null;
  canPersistAcrossSessions: boolean;
  merging: boolean;
  getAccessToken: () => Promise<string | null>;
};

const PersistenceContext = createContext<PersistenceContextValue | null>(null);

async function fetchCloudModels(accessToken: string) {
  const res = await fetch("/api/workspaces/models", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data?: Array<{ moduleId: string; payload: Record<string, unknown> }>;
  };
  return data.data ?? [];
}

export function PersistenceProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [merging, setMerging] = useState(false);
  const mergedForUserRef = useRef<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  const mode: PersistenceMode = user ? "authenticated" : "guest";
  const userId = user?.id ?? null;
  const canPersistAcrossSessions = mode === "authenticated";

  const getAccessToken = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
    return () => setAccessTokenGetter(async () => null);
  }, [getAccessToken]);

  useEffect(() => {
    setPersistenceMode(mode, userId);
  }, [mode, userId]);

  useEffect(() => {
    const previous = previousUserIdRef.current;
    if (previous && previous !== userId) {
      // Account switched or signed out — keep other users' caches isolated.
      clearAuthenticatedLocalData(previous);
    }
    previousUserIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (loading || !user) {
      mergedForUserRef.current = null;
      return;
    }
    if (mergedForUserRef.current === user.id) return;

    let cancelled = false;

    (async () => {
      setMerging(true);
      try {
        const token = await getAccessToken();
        if (!token || cancelled) return;

        const projectsOk = await mergeSessionProjectsToCloud();
        const historyOk = await mergeSessionHistoryToCloud();

        // Only clear guest data after successful cloud writes.
        if (projectsOk && historyOk) {
          clearSessionData();
          clearSessionCalculationHistory();
        }

        const models = await fetchCloudModels(token);
        if (!cancelled && models) {
          hydrateProjectsFromCloud(models);
        }

        if (projectsOk && historyOk && models) {
          mergedForUserRef.current = user.id;
        }
      } finally {
        if (!cancelled) setMerging(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, getAccessToken]);

  const value = useMemo(
    () => ({
      mode,
      userId,
      canPersistAcrossSessions,
      merging,
      getAccessToken,
    }),
    [mode, userId, canPersistAcrossSessions, merging, getAccessToken]
  );

  return <PersistenceContext.Provider value={value}>{children}</PersistenceContext.Provider>;
}

export function usePersistence() {
  const ctx = useContext(PersistenceContext);
  if (!ctx) throw new Error("usePersistence must be used within PersistenceProvider");
  return ctx;
}

export function usePersistenceOptional() {
  return useContext(PersistenceContext);
}
