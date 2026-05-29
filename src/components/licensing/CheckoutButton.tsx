"use client";

import { useState } from "react";

type Props = {
  planId: string;
  label: string;
  variant?: "primary" | "secondary";
};

export default function CheckoutButton({ planId, label, variant = "primary" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  };

  const className =
    variant === "primary"
      ? "inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      : "inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  return (
    <div className="space-y-2">
      <button type="button" onClick={startCheckout} disabled={loading} className={className}>
        {loading ? "Redirecting…" : label}
      </button>
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
