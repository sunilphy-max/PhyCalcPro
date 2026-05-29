"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  canExportPdf,
  canUseDesignCode,
  defaultEntitlement,
  tierLabel,
} from "@/lib/licensing/entitlements";
import type { Entitlement, PlanTier } from "@/lib/licensing/types";
import type { DesignCodeId } from "@/lib/standards/types";

const STORAGE_KEY = "phycalcpro-entitlement-token";

type EntitlementContextValue = {
  entitlement: Entitlement;
  tierLabel: string;
  isLoading: boolean;
  setEntitlementToken: (token: string | null) => void;
  clearEntitlement: () => void;
  canUseDesignCode: (code: DesignCodeId) => boolean;
  canExportPdf: () => boolean;
  refreshFromDev: () => void;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

function devEntitlement(): Entitlement | null {
  const raw = process.env.NEXT_PUBLIC_DEV_ENTITLEMENT?.trim().toLowerCase();
  if (raw === "pro" || raw === "supporter" || raw === "free") {
    return {
      tier: raw === "free" ? "free" : raw,
      expiresAt: null,
      source: "dev",
    };
  }
  return null;
}

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>(defaultEntitlement());
  const [isLoading, setIsLoading] = useState(true);

  const loadStored = useCallback(async () => {
    const dev = devEntitlement();
    if (dev) {
      setEntitlement(dev);
      setIsLoading(false);
      return;
    }

    let token: string | null = null;
    try {
      token = localStorage.getItem(STORAGE_KEY);
    } catch {
      token = null;
    }

    if (!token) {
      setEntitlement(defaultEntitlement());
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        const data = (await res.json()) as { entitlement: Entitlement };
        setEntitlement(data.entitlement);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setEntitlement(defaultEntitlement());
      }
    } catch {
      setEntitlement(defaultEntitlement());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStored();
  }, [loadStored]);

  const setEntitlementToken = useCallback(
    (token: string | null) => {
      if (!token) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setEntitlement(devEntitlement() ?? defaultEntitlement());
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEY, token);
      } catch {
        // ignore
      }
      void loadStored();
    },
    [loadStored]
  );

  const clearEntitlement = useCallback(() => {
    setEntitlementToken(null);
  }, [setEntitlementToken]);

  const refreshFromDev = useCallback(() => {
    setEntitlement(devEntitlement() ?? defaultEntitlement());
  }, []);

  const value = useMemo(
    () => ({
      entitlement,
      tierLabel: tierLabel(entitlement.tier),
      isLoading,
      setEntitlementToken,
      clearEntitlement,
      canUseDesignCode: (code: DesignCodeId) => canUseDesignCode(entitlement, code),
      canExportPdf: () => canExportPdf(entitlement),
      refreshFromDev,
    }),
    [entitlement, isLoading, setEntitlementToken, clearEntitlement, refreshFromDev]
  );

  return (
    <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>
  );
}

export function useEntitlement() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error("useEntitlement must be used within EntitlementProvider");
  }
  return ctx;
}
