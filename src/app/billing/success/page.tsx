"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useEntitlement } from "@/contexts/EntitlementContext";

function BillingSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { setEntitlementToken } = useEntitlement();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing checkout session.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/billing/activate?session_id=${encodeURIComponent(sessionId)}`);
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          setStatus("error");
          setMessage(data.error ?? "Activation failed");
          return;
        }
        setEntitlementToken(data.token);
        setStatus("ok");
      } catch {
        setStatus("error");
        setMessage("Could not reach activation service.");
      }
    })();
  }, [sessionId, setEntitlementToken]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {status === "loading" ? (
        <p className="text-slate-600 dark:text-slate-300">Activating your license…</p>
      ) : null}
      {status === "ok" ? (
        <>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Thank you</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Your license is active on this browser. Open any calculator and select US, EU, or ISO.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            Go to calculators
          </Link>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Activation issue</h1>
          <p className="mt-3 text-red-600 dark:text-red-400">{message}</p>
          <Link href="/support" className="mt-6 inline-block text-sm font-semibold underline">
            Contact support
          </Link>
        </>
      ) : null}
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading…</div>}>
      <BillingSuccessContent />
    </Suspense>
  );
}
