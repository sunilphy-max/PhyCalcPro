"use client";

import { useRef, useState } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { BeamResult, Load, SupportType } from "@/lib/beam/types";
import BeamDashboard from "@/components/beam/BeamDashboard";

type Props = {
  result: BeamResult | null;
  length: number;
  support: SupportType;
  loads: Load[];

  onLoadDrag?: (
    id: string,
    updates: Partial<Extract<Load, { type: "point" }>>
  ) => void;
};

export default function BeamResults({
  result,
  length,
  support,
  loads,
  onLoadDrag,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportReport = async () => {
    if (!reportRef.current) return;
    setExporting(true);

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("beam-report.pdf");

    setExporting(false);
  };

  if (!result) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">Run calculation to see results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Beam Results</h2>
          <p className="text-sm text-gray-500">Export a detailed report of the current analysis.</p>
        </div>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          onClick={exportReport}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div ref={reportRef} id="beam-report" className="space-y-4">
        <BeamDashboard
          result={result}
          loads={loads}
          length={length}
          support={support}
          onLoadDrag={onLoadDrag}
        />
      </div>
    </div>
  );
}