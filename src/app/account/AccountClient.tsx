"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { usePersistence } from "@/contexts/PersistenceContext";
import { isSupabaseSignInReady, showGuestHistoryUx } from "@/lib/supabase/setupStatus";
import SupabaseSetupPanel from "@/components/account/SupabaseSetupPanel";

export default function AccountClient() {
  const { configured, user, loading, signInWithEmail, signOut } = useAuth();
  const persistence = usePersistence();
  const {
    entitlement,
    tierLabel,
    clearEntitlement,
    setEntitlementToken,
    setDevTier,
    canSwitchTier,
    isValidationMode,
    unlockAllFeatures,
    featuresUnlocked,
    isMonetizationEnabled,
  } = useEntitlement();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const signInReady = isSupabaseSignInReady();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await persistence.getAccessToken();
      const headers: Record<string, string> = { "x-phycalc-user-id": user.id };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/account/entitlement", { headers });
      if (!res.ok) return;
      const data = (await res.json()) as { token?: string | null };
      if (data.token) setEntitlementToken(data.token);
    })();
  }, [user, setEntitlementToken, persistence]);

  const syncToCloud = async () => {
    if (!user) return;
    const token = localStorage.getItem("phycalcpro-entitlement-token");
    if (!token) {
      setMessage("No local license to sync.");
      return;
    }
    const accessToken = await persistence.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-phycalc-user-id": user.id,
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch("/api/account/entitlement", {
      method: "POST",
      headers,
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
          {signInReady
            ? "Sign in to keep saved projects and calculation history across sessions and devices."
            : showGuestHistoryUx()
              ? "You are in guest mode. Session history works in this tab; cloud sign-in activates when Supabase is configured."
              : "License, billing, and optional cloud sign-in."}
        </p>
      </div>

      {!signInReady && showGuestHistoryUx() ? (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Guest mode</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Calculations and saved studies are stored in this browser tab only. When you close the
              tab, that history is cleared.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View session projects & history
            </Link>
          </div>
          <SupabaseSetupPanel />
        </>
      ) : null}

      {signInReady ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Sign in</h2>
          {loading || persistence.merging ? (
            <p className="mt-2 text-sm text-slate-500">
              {persistence.merging ? "Syncing your session data…" : "Loading…"}
            </p>
          ) : user ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Signed in as <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Your calculation history and saved projects are stored to your account.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                >
                  View projects & history
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
                >
                  Sign out
                </button>
              </div>
              {isMonetizationEnabled ? (
                <button
                  type="button"
                  onClick={syncToCloud}
                  className="block rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
                >
                  Sync license to cloud
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You are browsing as a <span className="font-semibold">guest</span>. History is kept
                only until you close this browser tab.
              </p>
              <form
                className="space-y-3"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                >
                  Send magic link
                </button>
              </form>
            </div>
          )}
        </div>
      ) : null}

      {isMonetizationEnabled ? (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Current plan</h2>
            <p className="mt-2 text-2xl font-semibold capitalize">{tierLabel}</p>
            <p className="mt-1 text-sm text-slate-500">
              Source: {entitlement.source}
              {entitlement.expiresAt
                ? ` · expires ${new Date(entitlement.expiresAt).toLocaleDateString()}`
                : ""}
            </p>
            {featuresUnlocked ? (
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                All design standards and PDF export are unlocked in this browser.
              </p>
            ) : (
              <button
                type="button"
                onClick={unlockAllFeatures}
                className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Unlock all features (validation)
              </button>
            )}
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
                Or add{" "}
                <code className="rounded bg-white px-1 dark:bg-slate-800">
                  NEXT_PUBLIC_DEV_ENTITLEMENT=pro
                </code>{" "}
                to{" "}
                <code className="rounded bg-white px-1 dark:bg-slate-800">.env.local</code> and
                restart dev.
              </p>
            </div>
          ) : null}

          {configured && !signInReady ? (
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
        </>
      ) : null}

      {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}

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
