import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset password | PhyCalcPro",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <ResetPasswordClient />
      </Suspense>
    </main>
  );
}
