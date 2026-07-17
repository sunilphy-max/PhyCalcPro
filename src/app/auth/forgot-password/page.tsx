import type { Metadata } from "next";
import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot password | PhyCalcPro",
  description: "Reset your PhyCalcPro account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <ForgotPasswordClient />
      </Suspense>
    </main>
  );
}
