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

type ResultsTableActions = {
  registerMetric: (id: string, order: number, row: RegisterMetricInput) => void;
  unregister: (id: string) => void;
  registerSection: (id: string, order: number, title: string) => void;
};

const ResultsTableActionsContext = createContext<ResultsTableActions | null>(null);
const ResultsTableRowsContext = createContext<ResultTableRow[]>([]);

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
      const existing = prev.find((item) => item.id === id);
      if (
        existing &&
        existing.kind === "metric" &&
        existing.order === order &&
        existing.label === row.label &&
        existing.value === row.value &&
        existing.numericValue === row.numericValue &&
        existing.unit === row.unit &&
        existing.tone === row.tone &&
        existing.status === row.status
      ) {
        return prev;
      }

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
      const existing = prev.find((item) => item.id === id);
      if (existing && existing.kind === "section" && existing.order === order && existing.label === title) {
        return prev;
      }

      const without = prev.filter((item) => item.id !== id);
      return [
        ...without,
        { id, order, kind: "section" as const, label: title },
      ].sort((a, b) => a.order - b.order);
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setRows((prev) => (prev.some((item) => item.id === id) ? prev.filter((item) => item.id !== id) : prev));
  }, []);

  const actions = useMemo(
    () => ({ registerMetric, unregister, registerSection }),
    [registerMetric, unregister, registerSection]
  );

  return (
    <ResultsTableActionsContext.Provider value={actions}>
      <ResultsTableRowsContext.Provider value={rows}>{children}</ResultsTableRowsContext.Provider>
    </ResultsTableActionsContext.Provider>
  );
}

export function useResultsTableActionsOptional() {
  return useContext(ResultsTableActionsContext);
}

export function useResultsTableRows() {
  return useContext(ResultsTableRowsContext);
}

export function useResultsTableOptional() {
  return useContext(ResultsTableActionsContext);
}

export function useResultsTableMetricRegistration(input: RegisterMetricInput) {
  const actions = useResultsTableActionsOptional();
  const reactId = useId();
  const orderRef = useRef<number | null>(null);
  const inputRef = useRef(input);
  inputRef.current = input;

  const { label, numericValue, unit, tone, status } = input;
  const valueKey =
    typeof input.value === "string" || typeof input.value === "number"
      ? String(input.value)
      : input.value == null
        ? ""
        : reactId;

  useLayoutEffect(() => {
    if (!actions) return;
    if (orderRef.current === null) orderRef.current = nextOrder();
    actions.registerMetric(reactId, orderRef.current, inputRef.current);
    return () => actions.unregister(reactId);
  }, [actions, label, valueKey, numericValue, unit, tone, status, reactId]);
}

export function useResultsTableSectionRegistration(title: string | undefined) {
  const actions = useResultsTableActionsOptional();
  const reactId = useId();
  const orderRef = useRef<number | null>(null);

  useInsertionEffect(() => {
    if (!actions || !title) return;
    if (orderRef.current === null) orderRef.current = nextOrder();
    actions.registerSection(reactId, orderRef.current, title);
    return () => actions.unregister(reactId);
  }, [actions, title, reactId]);
}
