"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
export default function AccountClient() {
  const { configured, user, loading, signInWithEmail, signOut } = useAuth();
  const {
    entitlement,
    tierLabel,
    clearEntitlement,
    setEntitlementToken,
    setDevTier,
    canSwitchTier,
    isValidationMode,
  } = useEntitlement();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch("/api/account/entitlement", {
        headers: { "x-phycalc-user-id": user.id },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { token?: string | null };
      if (data.token) setEntitlementToken(data.token);
    })();
  }, [user, setEntitlementToken]);

  const syncToCloud = async () => {
    if (!user) return;
    const token = localStorage.getItem("phycalcpro-entitlement-token");
    if (!token) {
      setMessage("No local license to sync.");
      return;
    }
    const res = await fetch("/api/account/entitlement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-phycalc-user-id": user.id,
      },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setMessage(data.stored ? "License synced to your account." : data.message ?? data.error ?? "Sync failed.");
  };

  const openPortal = async () => {
    if (!entitlement.stripeCustomerId) {
      setMessage("Complete Pro checkout first to get a billing profile.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: entitlement.stripeCustomerId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setMessage(data.error ?? "Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Account</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          License, billing, and optional cloud sign-in.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Current plan</h2>
        <p className="mt-2 text-2xl font-semibold capitalize">{tierLabel}</p>
        <p className="mt-1 text-sm text-slate-500">
          Source: {entitlement.source}
          {entitlement.expiresAt
            ? ` · expires ${new Date(entitlement.expiresAt).toLocaleDateString()}`
            : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            Change plan
          </Link>
          {entitlement.tier === "pro" ? (
            <button
              type="button"
              onClick={openPortal}
              disabled={portalLoading}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              {portalLoading ? "Opening…" : "Manage subscription"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={clearEntitlement}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600"
          >
            Reset local license
          </button>
        </div>
      </div>

      {canSwitchTier ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {isValidationMode ? "Validation tier preview" : "Local tier (no Stripe)"}
          </p>
          <p className="mt-1">
            {isValidationMode
              ? "All design standards and PDF are unlocked. Switch label to preview Free vs Pro UI."
              : "Switch plan for this browser session, or set a fixed tier in .env.local."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDevTier("free")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                entitlement.tier === "free"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "border border-slate-300"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setDevTier("pro")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                entitlement.tier === "pro"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "border border-slate-300"
              }`}
            >
              Pro
            </button>
          </div>
          <p className="mt-2 text-xs">
            Or add <code className="rounded bg-white px-1 dark:bg-slate-800">NEXT_PUBLIC_DEV_ENTITLEMENT=pro</code> to{" "}
            <code className="rounded bg-white px-1 dark:bg-slate-800">.env.local</code> and restart dev.
          </p>
        </div>
      ) : null}

      {configured ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Sign in</h2>
          {loading ? (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          ) : user ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-slate-600">Signed in as {user.email}</p>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm font-semibold underline"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={syncToCloud}
                className="block rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Sync license to cloud
              </button>
            </div>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const { error } = await signInWithEmail(email);
                setMessage(error ?? "Check your email for the magic link.");
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                Send magic link
              </button>
            </form>
          )}
        </div>
      ) : null}

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <p className="text-sm text-slate-500">
        <Link href="/status" className="underline">
          Quality dashboard
        </Link>{" "}
        ·{" "}
        <Link href="/trust" className="underline">
          Trust & disclaimers
        </Link>
      </p>
    </div>
  );
}
