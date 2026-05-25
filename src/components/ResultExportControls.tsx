"use client";

import { useState } from "react";
import type { RefObject } from "react";

type CSVRow = Record<string, string | number | null | undefined>;

type Props = {
  reportRef: RefObject<HTMLElement | null>;
  fileName: string;
  title?: string;
  description?: string;
  csvRows?: CSVRow[];
};

function downloadCsv(fileName: string, rows: CSVRow[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(
    rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const formatted = value != null ? String(value) : "";
          return `"${formatted.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ResultExportControls({
  reportRef,
  fileName,
  title = "Export summary",
  description,
  csvRows,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const exportPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight + margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight + margin;
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = () => {
    if (!csvRows || csvRows.length === 0) return;
    setDownloading(true);
    try {
      downloadCsv(fileName, csvRows);
    } catch (error) {
      console.error("CSV export error:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportPdf}
            disabled={exporting}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Exporting PDF…" : "Export PDF"}
          </button>
          {csvRows && csvRows.length > 0 ? (
            <button
              type="button"
              onClick={exportCsv}
              disabled={downloading}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download CSV"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
