"use client";

import { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  title: string;
};

export default function CalculatorLayout({
  left,
  center,
  right,
  title,
}: Props) {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-xl font-semibold mb-4">{title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1.5fr] gap-6">
        {/* LEFT */}
        <div className="space-y-4">{left}</div>

        {/* CENTER */}
        <div className="space-y-4">{center}</div>

        {/* RIGHT */}
        <div className="space-y-4">{right}</div>
      </div>
    </div>
  );
}