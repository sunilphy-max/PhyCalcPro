"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePowerTrainAssemblyOptional } from "@/contexts/PowerTrainAssemblyContext";
import { stepIdForModule } from "@/lib/design-workflows/powerTrainAssembly";

/** Reads ?assembly= query and binds active power-train assembly for calculator pages. */
export default function PowerTrainAssemblyBootstrap({ moduleId }: { moduleId?: string }) {
  const searchParams = useSearchParams();
  const ctx = usePowerTrainAssemblyOptional();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    const assemblyParam = searchParams.get("assembly");
    if (!assemblyParam || handled.current === assemblyParam) return;
    handled.current = assemblyParam;

    if (assemblyParam === "new") {
      const created = ctx.startAssembly();
      if (moduleId && stepIdForModule(moduleId)) {
        // Mark current module in progress when deep-linking mid-chain (rare).
        ctx.refresh();
      }
      void created;
      return;
    }

    ctx.loadAssembly(assemblyParam);
  }, [searchParams, ctx, moduleId]);

  return null;
}
