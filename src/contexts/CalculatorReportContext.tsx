"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RefObject } from "react";
import { useCalculatorReportExport } from "@/hooks/useCalculatorReportExport";
import { getModuleQualityChecklist } from "@/lib/calculation/moduleQualityDefaults";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { CalculationSpec } from "@/lib/standards/types";
import type { CsvRow } from "@/lib/export/csvRows";
import type { ReportMeta } from "@/lib/export/structuredReport";
import { allModules } from "@/data/modules";

export type CalculatorReportRegistration = {
  reportRef: RefObject<HTMLElement | null>;
  fileName: string;
  title?: string;
  description?: string;
  csvRows?: CsvRow[];
  calculationSpec?: CalculationSpec | null;
  reportMeta?: ReportMeta;
  qualityOverrides?: Partial<ModuleQualityChecklist>;
  showQualityChecklist?: boolean;
};

type CalculatorReportContextValue = {
  registered: boolean;
  exportPdf: () => Promise<void>;
  exportCsv: () => void;
  pdfEnabled: boolean;
  exporting: boolean;
  downloading: boolean;
  statusMessage: string | null;
  statusTone: "error" | "success";
  clearStatus: () => void;
  qualityChecklist: ModuleQualityChecklist | null;
  registerReport: (registration: CalculatorReportRegistration) => void;
  unregisterReport: () => void;
};

const CalculatorReportContext = createContext<CalculatorReportContextValue | null>(null);

export function CalculatorReportProvider({
  moduleId,
  children,
}: {
  moduleId?: string;
  children: ReactNode;
}) {
  const [registration, setRegistration] = useState<CalculatorReportRegistration | null>(null);

  const exportConfig = useMemo(() => {
    if (!registration) return null;
    const moduleTitle = moduleId
      ? allModules.find((m) => m.id === moduleId)?.title
      : undefined;
    return {
      reportRef: registration.reportRef,
      fileName: registration.fileName,
      title: registration.title,
      moduleTitle,
      calculationSpec: registration.calculationSpec,
      reportMeta: registration.reportMeta,
      csvRows: registration.csvRows,
    };
  }, [moduleId, registration]);

  const exportState = useCalculatorReportExport(exportConfig);

  const qualityChecklist = useMemo(() => {
    if (!moduleId || registration?.showQualityChecklist === false) return null;
    return getModuleQualityChecklist(moduleId, registration?.qualityOverrides);
  }, [moduleId, registration?.qualityOverrides, registration?.showQualityChecklist]);

  const registerReport = useCallback((next: CalculatorReportRegistration) => {
    setRegistration((prev) => {
      if (!prev) return next;
      if (
        prev.fileName === next.fileName &&
        prev.reportRef === next.reportRef &&
        prev.title === next.title &&
        prev.description === next.description &&
        prev.calculationSpec === next.calculationSpec &&
        prev.reportMeta === next.reportMeta &&
        prev.showQualityChecklist === next.showQualityChecklist &&
        JSON.stringify(prev.qualityOverrides) === JSON.stringify(next.qualityOverrides) &&
        JSON.stringify(prev.csvRows) === JSON.stringify(next.csvRows)
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const unregisterReport = useCallback(() => {
    setRegistration(null);
  }, []);

  const value = useMemo<CalculatorReportContextValue>(
    () => ({
      registered: registration != null,
      exportPdf: exportState.exportPdf,
      exportCsv: exportState.exportCsv,
      pdfEnabled: exportState.pdfEnabled,
      exporting: exportState.exporting,
      downloading: exportState.downloading,
      statusMessage: exportState.statusMessage,
      statusTone: exportState.statusTone,
      clearStatus: exportState.clearStatus,
      qualityChecklist,
      registerReport,
      unregisterReport,
    }),
    [exportState, qualityChecklist, registerReport, registration, unregisterReport]
  );

  return (
    <CalculatorReportContext.Provider value={value}>{children}</CalculatorReportContext.Provider>
  );
}

export function useCalculatorReport() {
  const context = useContext(CalculatorReportContext);
  if (!context) {
    throw new Error("useCalculatorReport must be used within CalculatorReportProvider");
  }
  return context;
}

export function useCalculatorReportOptional() {
  return useContext(CalculatorReportContext);
}
