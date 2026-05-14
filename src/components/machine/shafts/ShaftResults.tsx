"use client";

import { useState, useRef } from "react";
import ShaftDashboard from "./ShaftDashboard";
import type { ShaftResult } from "@/lib/machine/shafts/types";

type Props = {
  result: ShaftResult | null;
  projectName: string;
};

export default function ShaftResults({ result, projectName }: Props) {
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">Run calculation to see results.</p>
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`${projectName}-shaft-analysis.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Shaft Results</h2>
          <p className="text-sm text-gray-500">Export a detailed report of the current analysis.</p>
        </div>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          onClick={handleExportPDF}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div ref={reportRef} id="shaft-report" className="space-y-4">
        <ShaftDashboard result={result} />
      </div>
    </div>
  );
}
