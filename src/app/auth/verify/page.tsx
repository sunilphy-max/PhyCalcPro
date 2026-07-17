import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify email | PhyCalcPro",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <VerifyEmailClient />
      </Suspense>
    </main>
  );
}
