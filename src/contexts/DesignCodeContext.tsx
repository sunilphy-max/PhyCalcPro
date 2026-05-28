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
  defaultDesignCode,
  designCodeOptions,
  type DesignCodeOption,
} from "@/lib/standards/designCodes";
import type { DesignCodeId } from "@/lib/standards/types";

const STORAGE_KEY = "phycalcpro-design-code";

type DesignCodeContextValue = {
  designCode: DesignCodeId;
  setDesignCode: (code: DesignCodeId) => void;
  option: DesignCodeOption;
};

const DesignCodeContext = createContext<DesignCodeContextValue | null>(null);

export function DesignCodeProvider({ children }: { children: ReactNode }) {
  const [designCode, setDesignCodeState] = useState<DesignCodeId>(defaultDesignCode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as DesignCodeId | null;
      if (stored && designCodeOptions.some((o) => o.id === stored)) {
        setDesignCodeState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setDesignCode = useCallback((code: DesignCodeId) => {
    setDesignCodeState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const option = useMemo(
    () => designCodeOptions.find((o) => o.id === designCode) ?? designCodeOptions[0],
    [designCode]
  );

  const value = useMemo(
    () => ({ designCode, setDesignCode, option }),
    [designCode, setDesignCode, option]
  );

  return (
    <DesignCodeContext.Provider value={value}>{children}</DesignCodeContext.Provider>
  );
}

export function useDesignCode() {
  const ctx = useContext(DesignCodeContext);
  if (!ctx) {
    throw new Error("useDesignCode must be used within DesignCodeProvider");
  }
  return ctx;
}
