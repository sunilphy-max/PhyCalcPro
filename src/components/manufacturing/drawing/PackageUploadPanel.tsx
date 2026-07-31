"use client";

import { useCallback, useRef, useState } from "react";
import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
} from "@/components/calculator/styles";
import {
  singlePdfPackage,
  unpackDrawingZip,
  type DrawingPackage,
} from "@/lib/manufacturing/package";

type Props = {
  onPackage: (pkg: DrawingPackage) => void;
  disabled?: boolean;
};

export default function PackageUploadPanel({ onPackage, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      setBusy(true);
      try {
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".zip")) {
          const pkg = await unpackDrawingZip(file);
          onPackage(pkg);
          const fatal = pkg.issues.filter((i) => i.severity === "error");
          if (fatal.length) {
            setError(fatal[0]!.message);
          }
        } else if (lower.endsWith(".pdf") || file.type === "application/pdf") {
          const bytes = new Uint8Array(await file.arrayBuffer());
          onPackage(singlePdfPackage(file, bytes));
        } else {
          setError("Upload a PDF or a ZIP containing BOM.xlsx + PDF drawings.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Package upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onPackage]
  );

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-900/40">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Drawing package
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Single PDF, or ZIP with required <code className="text-[11px]">BOM.xlsx</code> + part/assembly
          PDFs. BOM defines hierarchy — stacks stay auditable.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.zip,application/pdf,application/zip"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={calculatorPrimaryButtonClass}
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Reading package…" : "Upload PDF or ZIP"}
        </button>
        <a
          className={calculatorSecondaryButtonClass}
          href="/templates/PhyCalcPro-BOM-template.csv"
          download
        >
          BOM template
        </a>
      </div>
      {fileName ? <p className="truncate text-xs text-slate-600">{fileName}</p> : null}
      {error ? <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p> : null}
    </div>
  );
}
