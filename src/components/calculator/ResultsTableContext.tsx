"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MetricStatus, MetricTone } from "./CalculatorMetricCard";

export type ResultTableRow = {
  id: string;
  order: number;
  kind: "metric" | "section";
  label: string;
  value?: ReactNode;
  numericValue?: number | null;
  unit?: string;
  tone?: MetricTone;
  status?: MetricStatus;
};

type RegisterMetricInput = {
  label: string;
  value?: ReactNode;
  numericValue?: number | null;
  unit?: string;
  tone?: MetricTone;
  status?: MetricStatus;
};

type ResultsTableContextValue = {
  registerMetric: (id: string, order: number, row: RegisterMetricInput) => void;
  unregister: (id: string) => void;
  registerSection: (id: string, order: number, title: string) => void;
  rows: ResultTableRow[];
};

const ResultsTableContext = createContext<ResultsTableContextValue | null>(null);

let orderCounter = 0;

function nextOrder() {
  orderCounter += 1;
  return orderCounter;
}

export function ResultsTableProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<ResultTableRow[]>([]);

  useLayoutEffect(() => {
    orderCounter = 0;
    return () => {
      orderCounter = 0;
    };
  }, []);

  const registerMetric = useCallback((id: string, order: number, row: RegisterMetricInput) => {
    setRows((prev) => {
      const without = prev.filter((item) => item.id !== id);
      return [
        ...without,
        {
          id,
          order,
          kind: "metric" as const,
          label: row.label,
          value: row.value,
          numericValue: row.numericValue,
          unit: row.unit,
          tone: row.tone,
          status: row.status,
        },
      ].sort((a, b) => a.order - b.order);
    });
  }, []);

  const registerSection = useCallback((id: string, order: number, title: string) => {
    setRows((prev) => {
      const without = prev.filter((item) => item.id !== id);
      return [
        ...without,
        { id, order, kind: "section" as const, label: title },
      ].sort((a, b) => a.order - b.order);
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setRows((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ registerMetric, unregister, registerSection, rows }),
    [registerMetric, unregister, registerSection, rows]
  );

  return <ResultsTableContext.Provider value={value}>{children}</ResultsTableContext.Provider>;
}

export function useResultsTableOptional() {
  return useContext(ResultsTableContext);
}

export function useResultsTableMetricRegistration(input: RegisterMetricInput) {
  const context = useResultsTableOptional();
  const reactId = useId();
  const orderRef = useRef<number | null>(null);

  const { label, value, numericValue, unit, tone, status } = input;

  useLayoutEffect(() => {
    if (!context) return;
    if (orderRef.current === null) orderRef.current = nextOrder();
    context.registerMetric(reactId, orderRef.current, {
      label,
      value,
      numericValue,
      unit,
      tone,
      status,
    });
    return () => context.unregister(reactId);
  }, [context, label, value, numericValue, unit, tone, status, reactId]);
}

export function useResultsTableSectionRegistration(title: string | undefined) {
  const context = useResultsTableOptional();
  const reactId = useId();
  const orderRef = useRef<number | null>(null);

  useInsertionEffect(() => {
    if (!context || !title) return;
    if (orderRef.current === null) orderRef.current = nextOrder();
    context.registerSection(reactId, orderRef.current, title);
    return () => context.unregister(reactId);
  }, [context, title, reactId]);
}
