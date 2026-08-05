"use client";

import type { ReactNode } from "react";

/**
 * @deprecated Use `BearingDesignerSpine` with System → Duty → Size → Verify → Report stages.
 */
export type BearingInputTabId = "application" | "loads" | "operating" | "selection";

type Props = {
  children: (activeTab: BearingInputTabId) => ReactNode;
  defaultTab?: BearingInputTabId;
};

/** Legacy shim — prefer BearingDesignerSpine. */
export default function BearingInputTabs({ children, defaultTab = "application" }: Props) {
  return <div className="space-y-4">{children(defaultTab)}</div>;
}
