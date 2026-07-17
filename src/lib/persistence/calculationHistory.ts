import type { CalculationSpec } from "@/lib/standards/types";
import type { ReportMeta } from "@/lib/export/structuredReport";
import type { ReportRow } from "@/lib/export/reportPayload";
import { getAuthHeaders } from "./authHeaders";
import {
  canPersistAcrossSessions,
  getAuthenticatedUserId,
  getPersistenceMode,
  type PersistenceMode,
} from "./clientStorage";
import { defaultProjectId } from "./defaultProject";

export type CalculationSummary = {
  pass: number;
  warning: number;
  fail: number;
};

export type CalculationRecord = {
  id: string;
  moduleId: string;
  designCode: string;
  computedAt: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  calculationSpec: CalculationSpec;
  inputRows?: ReportRow[];
  reportMeta?: ReportMeta;
  summary?: CalculationSummary;
};

export type CalculationHistoryEntry = {
  id: string;
  moduleId: string;
  designCode: string;
  computedAt: string;
  summary?: CalculationSummary;
};

const SESSION_HISTORY_KEY = "phycalcpro:session:history";
const MAX_SESSION_HISTORY = 20;

function createRecordId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function summarizeChecks(spec: CalculationSpec | null | undefined): CalculationSummary | undefined {
  if (!spec?.checks?.length) return undefined;
  return spec.checks.reduce<CalculationSummary>(
    (acc, check) => {
      if (check.status === "pass") acc.pass += 1;
      else if (check.status === "warning") acc.warning += 1;
      else if (check.status === "fail") acc.fail += 1;
      return acc;
    },
    { pass: 0, warning: 0, fail: 0 }
  );
}

function inputRowsToInputs(rows: ReportRow[] | undefined): Record<string, unknown> {
  if (!rows?.length) return {};
  return Object.fromEntries(rows.map((row) => [row.parameter, row.value]));
}

function readSessionHistory(): CalculationRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(SESSION_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CalculationRecord[]) : [];
  } catch {
    return [];
  }
}

function writeSessionHistory(records: CalculationRecord[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    SESSION_HISTORY_KEY,
    JSON.stringify(records.slice(0, MAX_SESSION_HISTORY))
  );
}

function toHistoryEntry(record: CalculationRecord): CalculationHistoryEntry {
  return {
    id: record.id,
    moduleId: record.moduleId,
    designCode: record.designCode,
    computedAt: record.computedAt,
    summary: record.summary,
  };
}

function runToHistoryEntry(run: {
  id: string;
  createdAt: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}): CalculationHistoryEntry | null {
  const input = run.input ?? {};
  const output = run.output ?? {};
  const moduleId = String(input.moduleId ?? "");
  if (!moduleId) return null;
  return {
    id: run.id,
    moduleId,
    designCode: String(input.designCode ?? ""),
    computedAt: String(
      (output.calculationSpec as CalculationSpec | undefined)?.computedAt ?? run.createdAt
    ),
    summary: output.summary as CalculationSummary | undefined,
  };
}

export function getSessionCalculationHistory(): CalculationHistoryEntry[] {
  return readSessionHistory().map(toHistoryEntry);
}

export function clearSessionCalculationHistory(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_HISTORY_KEY);
}

export async function recordCalculation(params: {
  moduleId: string;
  designCode: string;
  result: Record<string, unknown>;
  calculationSpec?: CalculationSpec | null;
  inputRows?: ReportRow[];
  reportMeta?: ReportMeta;
}): Promise<void> {
  const { moduleId, designCode, result, calculationSpec, inputRows, reportMeta } = params;
  if (!result || !calculationSpec) return;

  const record: CalculationRecord = {
    id: createRecordId(),
    moduleId,
    designCode,
    computedAt: calculationSpec.computedAt,
    inputs: inputRowsToInputs(inputRows),
    result,
    calculationSpec,
    inputRows,
    reportMeta,
    summary: summarizeChecks(calculationSpec),
  };

  const mode = getPersistenceMode();

  if (mode === "guest") {
    const history = readSessionHistory();
    writeSessionHistory([record, ...history]);
    return;
  }

  writeSessionHistory([record, ...readSessionHistory()]);

  const userId = getAuthenticatedUserId();
  if (!userId) return;

  try {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    await fetch("/api/workspaces/runs", {
      method: "POST",
      headers,
      body: JSON.stringify({
        projectId: defaultProjectId(userId),
        status: "succeeded",
        input: {
          moduleId,
          designCode,
          inputs: record.inputs,
          inputRows,
          reportMeta,
        },
        output: {
          result,
          calculationSpec,
          summary: record.summary,
        },
      }),
    });
  } catch {
    // Best-effort cloud sync.
  }
}

export async function listCalculationHistory(): Promise<CalculationHistoryEntry[]> {
  const mode = getPersistenceMode();

  if (mode === "guest") {
    return getSessionCalculationHistory();
  }

  if (canPersistAcrossSessions()) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/workspaces/runs", { headers });
      if (res.ok) {
        const data = (await res.json()) as {
          data?: Array<{
            id: string;
            createdAt: string;
            input?: Record<string, unknown>;
            output?: Record<string, unknown>;
          }>;
        };
        const cloud = (data.data ?? [])
          .map(runToHistoryEntry)
          .filter((entry): entry is CalculationHistoryEntry => entry !== null);
        if (cloud.length > 0) {
          return cloud;
        }
      }
    } catch {
      // Fall back to session cache.
    }
  }

  return getSessionCalculationHistory();
}

export async function mergeSessionHistoryToCloud(): Promise<boolean> {
  const records = readSessionHistory();
  if (!records.length) return true;

  const userId = getAuthenticatedUserId();
  if (!userId) return false;

  let allOk = true;
  for (const record of records) {
    try {
      const headers = await getAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/workspaces/runs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          projectId: defaultProjectId(userId),
          status: "succeeded",
          input: {
            moduleId: record.moduleId,
            designCode: record.designCode,
            inputs: record.inputs,
            inputRows: record.inputRows,
            reportMeta: record.reportMeta,
          },
          output: {
            result: record.result,
            calculationSpec: record.calculationSpec,
            summary: record.summary,
          },
        }),
      });
      if (!res.ok) allOk = false;
    } catch {
      allOk = false;
    }
  }
  return allOk;
}

export function getHistoryStorageLabel(mode: PersistenceMode): string {
  return mode === "guest"
    ? "Session only — cleared when you close this tab"
    : "Saved to your account";
}
