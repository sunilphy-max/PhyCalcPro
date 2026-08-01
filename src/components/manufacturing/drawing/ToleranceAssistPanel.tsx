"use client";

import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import { runToleranceCopilot } from "@/lib/copilot/toleranceCopilot";
import type { DrawingExtract, GdtStackConfig, GdtStackResult } from "@/lib/manufacturing/gdt/types";
import {
  buildAnnotationLibrary,
  buildDrPacketJson,
  buildDrPacketMarkdown,
  proposeAllocationPackages,
  stackDashboardRows,
  type AssemblyNode,
  type BomRow,
  type NamedStack,
  type ProposedStack,
} from "@/lib/manufacturing/package";
import { fromBase } from "@/lib/units/conversions";
import { useMemo, useState } from "react";

type Props = {
  studyName: string;
  tree: AssemblyNode[];
  bomRows: BomRow[];
  extractsByPart: Record<string, DrawingExtract>;
  stacks: NamedStack[];
  activeExtract: DrawingExtract | null;
  lastResult: GdtStackResult | null;
  gdtConfig: GdtStackConfig | null;
  displayUnit: string;
  onAcceptProposal: (proposal: ProposedStack) => void;
  onApplyAllocation: (scales: Record<string, number>) => void;
};

export default function ToleranceAssistPanel({
  studyName,
  tree,
  bomRows,
  extractsByPart,
  stacks,
  activeExtract,
  lastResult,
  gdtConfig,
  displayUnit,
  onAcceptProposal,
  onApplyAllocation,
}: Props) {
  const [command, setCommand] = useState("help");
  const [output, setOutput] = useState<string>("Type a command and Run. Suggestions are never auto-applied.");
  const [proposals, setProposals] = useState<ProposedStack[]>([]);

  const library = useMemo(
    () => buildAnnotationLibrary(extractsByPart, tree),
    [extractsByPart, tree]
  );

  const run = () => {
    const action = runToleranceCopilot({
      command,
      extractsByPart,
      tree,
      library,
      activeExtract,
      lastResult,
    });
    if (action.type === "propose_stacks") {
      setProposals(action.proposals);
      setOutput(
        action.proposals.length
          ? `Proposed ${action.proposals.length} stack(s). Review and Accept into the program (still needs confirm + solve).`
          : "No proposals — extract SA/assembly notes or child components first."
      );
      return;
    }
    if (action.type === "list_position_mmc" || action.type === "explain_drivers") {
      const lines = "items" in action ? action.items : action.lines;
      setOutput(lines.join("\n"));
      return;
    }
    setOutput(action.text);
  };

  const exportPacket = (fmt: "md" | "json") => {
    const dashboard = stackDashboardRows(stacks);
    const input = {
      studyName,
      bomRows,
      tree,
      stacks,
      dashboard,
      extractsByPart,
    };
    const body = fmt === "md" ? buildDrPacketMarkdown(input) : buildDrPacketJson(input);
    const blob = new Blob([body], {
      type: fmt === "md" ? "text/markdown" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studyName.replace(/\s+/g, "-") || "tolerance"}-dr-packet.${fmt === "md" ? "md" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allocationPackages =
    gdtConfig && lastResult && lastResult.worstCase > 0
      ? proposeAllocationPackages(gdtConfig, lastResult, {
          targetMetric: "WC",
          targetValueSi: lastResult.worstCase * 0.8,
        })
      : [];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Copilot & packet
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Propose interfaces, explain FCFs/drivers, export DR packet. Solvers own the numbers.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          className={calculatorTextInputClass}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
          }}
          placeholder='e.g. propose stacks'
        />
        <button
          type="button"
          className={calculatorPrimaryButtonClass}
          style={{ width: "auto" }}
          onClick={run}
        >
          Run
        </button>
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
        {output}
      </pre>

      {proposals.length > 0 ? (
        <ul className="space-y-2">
          {proposals.map((p, i) => (
            <li
              key={`${p.contextPartNumber}-${i}`}
              className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-[10px] text-slate-500">
                {p.level} @ {p.contextPartNumber} · {p.suggestedPicks.length} suggested picks
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{p.reason}</p>
              <button
                type="button"
                className={`${calculatorSecondaryButtonClass} mt-2`}
                onClick={() => onAcceptProposal(p)}
              >
                Accept as draft stack
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {allocationPackages.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            What-if allocation (target ~80% of current WC)
          </div>
          {allocationPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
            >
              <div>
                <div className="font-medium">{pkg.label}</div>
                <div className="text-[10px] text-slate-500">{pkg.description}</div>
                <div className="mt-1 text-[10px]">
                  WC→ {fromBase(pkg.predictedWorstCase, "length", displayUnit).toPrecision(3)}{" "}
                  {displayUnit} · RSS→{" "}
                  {fromBase(pkg.predictedRss, "length", displayUnit).toPrecision(3)}{" "}
                  {displayUnit}
                </div>
              </div>
              <button
                type="button"
                className={calculatorSecondaryButtonClass}
                style={{ width: "auto" }}
                onClick={() => onApplyAllocation(pkg.scales)}
              >
                Apply scales
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          onClick={() => exportPacket("md")}
        >
          Export DR packet (.md)
        </button>
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          onClick={() => exportPacket("json")}
        >
          Export DR JSON
        </button>
      </div>
    </div>
  );
}
