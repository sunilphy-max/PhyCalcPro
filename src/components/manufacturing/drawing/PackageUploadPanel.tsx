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
  /** Compact variant after a package is already loaded */
  compact?: boolean;
};

export default function PackageUploadPanel({ onPackage, disabled, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
          if (fatal.length) setError(fatal[0]!.message);
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

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Reading…" : "Replace package"}
        </button>
        {fileName ? <span className="truncate text-xs text-slate-500">{fileName}</span> : null}
        {error ? <span className="text-xs text-amber-700">{error}</span> : null}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
        dragOver
          ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30"
          : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
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
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Drop your drawing package here
      </p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
        ZIP with required BOM.xlsx + PDFs, or a single PDF. Max 10 MB per drawing.
      </p>
      <button
        type="button"
        className={`${calculatorPrimaryButtonClass} mx-auto mt-4 !w-auto px-6`}
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Reading package…" : "Choose PDF or ZIP"}
      </button>
      {fileName ? <p className="mt-3 truncate text-xs text-slate-600">{fileName}</p> : null}
      {error ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{error}</p> : null}
    </div>
  );
}
