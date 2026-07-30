"use client";

import { useCallback, useRef, useState } from "react";
import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
} from "@/components/calculator/styles";
import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";
import { emptyDrawingExtract } from "@/lib/manufacturing/gdt/schema";

type Target = "tolerance" | "fits";

type Props = {
  target: Target;
  onExtracted: (extract: DrawingExtract, meta: { warnings: string[]; source: string }) => void;
  disabled?: boolean;
};

export default function DrawingUploadPanel({ target, onExtracted, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        setError("Only PDF engineering drawings are supported.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF must be 10 MB or smaller.");
        return;
      }

      setBusy(true);
      try {
        const { rasterizePdfInBrowser } = await import(
          "@/lib/manufacturing/gdt/rasterizePdfClient"
        );
        const raster = await rasterizePdfInBrowser(file);

        const form = new FormData();
        form.set("file", file);
        form.set("target", target);
        if (raster.pages.length > 0) {
          form.set(
            "pageImages",
            JSON.stringify(raster.pages.map((p) => p.dataUrl))
          );
        }
        const res = await fetch("/api/manufacturing/parse-drawing", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as {
          error?: string;
          extract?: DrawingExtract;
          warnings?: string[];
          source?: string;
        };
        if (!res.ok) {
          setError(data.error ?? `Upload failed (${res.status})`);
          return;
        }
        const warnings = [...(raster.warnings ?? []), ...(data.warnings ?? [])];
        onExtracted(data.extract ?? emptyDrawingExtract(), {
          warnings,
          source: data.source ?? "unavailable",
        });
        if (data.source === "unavailable") {
          setError(
            (warnings[0]) ||
              "Drawing parse unavailable — configure OPENAI_API_KEY or enter values manually."
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onExtracted, target]
  );

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-900/40">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Upload engineering drawing
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          PDF only (≤10 MB, first 5 pages). Vision extract is assistive — review before applying.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={calculatorPrimaryButtonClass}
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Parsing drawing…" : "Choose PDF"}
        </button>
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          disabled={disabled || busy}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
        >
          Or drop PDF here
        </button>
      </div>

      {fileName ? (
        <p className="truncate text-xs text-slate-600 dark:text-slate-300">{fileName}</p>
      ) : null}
      {error ? <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p> : null}
    </div>
  );
}
