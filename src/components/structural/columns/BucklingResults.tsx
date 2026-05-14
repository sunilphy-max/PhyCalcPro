"use client";

import { useState, useRef } from "react";
import BucklingDashboard from "./BucklingDashboard";
import type { BucklingResult } from "@/lib/structural/columns/types";

type Props = {
  result: BucklingResult | null;
  projectName: string;
};

export default function BucklingResults({ result, projectName }: Props) {
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
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

      pdf.save(`${projectName}-buckling-analysis.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Buckling Results</h2>
        <p className="text-sm text-gray-500">Export a detailed report of the current analysis.</p>
      </div>

      <button
        onClick={handleExportPDF}
        disabled={exporting}
        className="w-full mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition disabled:opacity-50"
      >
        {exporting ? "Exporting..." : "Export PDF"}
      </button>

      <div ref={reportRef}>
        <BucklingDashboard result={result} />
      </div>
    </div>
  );
}
