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
import { setClientUnlockAll } from "@/lib/licensing/clientUnlock";
import {
  allFeaturesUnlocked,
  isFreeLaunch,
  isMonetizationEnabled,
  isValidationMode,
} from "@/lib/licensing/validationMode";
import type { Entitlement, PlanTier } from "@/lib/licensing/types";
import type { DesignCodeId } from "@/lib/standards/types";

const STORAGE_KEY = "phycalcpro-entitlement-token";
const DEV_TIER_KEY = "phycalcpro-dev-tier";

type EntitlementContextValue = {
  entitlement: Entitlement;
  tierLabel: string;
  isLoading: boolean;
  isLocalDev: boolean;
  isValidationMode: boolean;
  isFreeLaunch: boolean;
  isMonetizationEnabled: boolean;
  canSwitchTier: boolean;
  setEntitlementToken: (token: string | null) => void;
  clearEntitlement: () => void;
  setDevTier: (tier: PlanTier) => void;
  featuresUnlocked: boolean;
  canUseDesignCode: (code: DesignCodeId) => boolean;
  canExportPdf: () => boolean;
  unlockAllFeatures: () => void;
  refreshFromDev: () => void;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

function isLocalDevRuntime(): boolean {
  return process.env.NODE_ENV === "development";
}

function devEntitlementFromEnv(): Entitlement | null {
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

function canUseSessionTier(): boolean {
  return isLocalDevRuntime() || isValidationMode();
}

function devEntitlementFromSession(): Entitlement | null {
  if (!canUseSessionTier() || devEntitlementFromEnv()) return null;
  try {
    const raw = sessionStorage.getItem(DEV_TIER_KEY)?.trim().toLowerCase();
    if (raw === "pro" || raw === "supporter" || raw === "free") {
      return {
        tier: raw === "free" ? "free" : raw,
        expiresAt: null,
        source: "dev",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function resolveDevEntitlement(): Entitlement | null {
  return devEntitlementFromEnv() ?? devEntitlementFromSession();
}

function launchEntitlement(): Entitlement {
  return { tier: "free", expiresAt: null, source: "default" };
}

function initialEntitlementState(): Entitlement {
  if (isFreeLaunch()) return launchEntitlement();
  return resolveDevEntitlement() ?? (allFeaturesUnlocked() ? proDevEntitlement() : defaultEntitlement());
}

function proDevEntitlement(): Entitlement {
  return { tier: "pro", expiresAt: null, source: "dev" };
}

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>(initialEntitlementState);
  const [featuresUnlocked, setFeaturesUnlocked] = useState(allFeaturesUnlocked);
  const [isLoading, setIsLoading] = useState(true);

  const syncUnlockState = useCallback(() => {
    const unlocked = allFeaturesUnlocked();
    setFeaturesUnlocked(unlocked);
    if (unlocked) {
      setClientUnlockAll(true);
    }
  }, []);

  const loadStored = useCallback(async () => {
    syncUnlockState();

    if (allFeaturesUnlocked()) {
      const dev = resolveDevEntitlement();
      setEntitlement(
        isFreeLaunch() ? launchEntitlement() : dev ?? proDevEntitlement()
      );
      setIsLoading(false);
      return;
    }

    const dev = resolveDevEntitlement();
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
    void loadStored();
  }, [loadStored]);

  useEffect(() => {
    syncUnlockState();
  }, [syncUnlockState]);

  const setEntitlementToken = useCallback(
    (token: string | null) => {
      if (!token) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setEntitlement(resolveDevEntitlement() ?? defaultEntitlement());
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
    setEntitlement(resolveDevEntitlement() ?? defaultEntitlement());
  }, []);

  const unlockAllFeatures = useCallback(() => {
    setClientUnlockAll(true);
    setFeaturesUnlocked(true);
    setEntitlement(proDevEntitlement());
  }, []);

  const setDevTier = useCallback((tier: PlanTier) => {
    if (!canUseSessionTier()) return;
    if (devEntitlementFromEnv()) {
      return;
    }
    try {
      sessionStorage.setItem(DEV_TIER_KEY, tier);
    } catch {
      // ignore
    }
    setEntitlement({
      tier,
      expiresAt: null,
      source: "dev",
    });
  }, []);

  const value = useMemo(
    () => ({
      entitlement,
      tierLabel: isFreeLaunch() ? "Early access" : tierLabel(entitlement.tier),
      isLoading,
      isLocalDev: isLocalDevRuntime(),
      isValidationMode: isValidationMode(),
      isFreeLaunch: isFreeLaunch(),
      isMonetizationEnabled: isMonetizationEnabled(),
      canSwitchTier:
        isMonetizationEnabled() && canUseSessionTier() && !devEntitlementFromEnv(),
      setEntitlementToken,
      clearEntitlement,
      setDevTier,
      featuresUnlocked,
      canUseDesignCode: (code: DesignCodeId) =>
        featuresUnlocked || canUseDesignCode(entitlement, code),
      canExportPdf: () => featuresUnlocked || canExportPdf(entitlement),
      unlockAllFeatures,
      refreshFromDev,
    }),
    [
      entitlement,
      isLoading,
      featuresUnlocked,
      setEntitlementToken,
      clearEntitlement,
      setDevTier,
      unlockAllFeatures,
      refreshFromDev,
    ]
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
