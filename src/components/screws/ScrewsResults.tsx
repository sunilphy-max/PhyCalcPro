"use client";

import { useState, useRef } from "react";
import ScrewsDashboard from "./ScrewsDashboard";
import type { ScrewResult } from "@/lib/screws/types";

type Props = {
  result: ScrewResult | null;
  projectName: string;
};

export default function ScrewsResults({ result, projectName }: Props) {
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        Run a calculation to see results
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

      pdf.save(`${projectName}-screw-analysis.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Results: {projectName}</h2>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div ref={reportRef} className="bg-white rounded-lg p-6 shadow-sm">
        <ScrewsDashboard result={result} />
      </div>
    </div>
  );
}