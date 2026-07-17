"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { usePersistence } from "@/contexts/PersistenceContext";
import { isSupabaseSignInReady, showGuestHistoryUx } from "@/lib/supabase/setupStatus";
import AuthForm from "@/components/account/AuthForm";
import SupabaseSetupPanel from "@/components/account/SupabaseSetupPanel";

function displayNameFromUser(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.display_name === "string" && meta.display_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    "";
  return fromMeta.trim();
}

export default function AccountClient() {
  const {
    configured,
    user,
    loading,
    signOut,
    updateProfile,
    updatePassword,
    resendVerificationEmail,
  } = useAuth();
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
  const [message, setMessage] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const signInReady = isSupabaseSignInReady();

  useEffect(() => {
    if (!user) {
      setDisplayName("");
      return;
    }
    setDisplayName(displayNameFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await persistence.getAccessToken();
      if (!token) return;
      const res = await fetch("/api/account/entitlement", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (!accessToken) {
      setMessage("Sign in required to sync.");
      return;
    }
    const res = await fetch("/api/account/entitlement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setMessage(data.stored ? "License synced to your account." : data.message ?? data.error ?? "Sync failed.");
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const accessToken = await persistence.getAccessToken();
      if (!accessToken) {
        setMessage("Sign in required to manage billing.");
        return;
      }
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setMessage(data.error ?? "Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const emailConfirmed = Boolean(user?.email_confirmed_at);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Account</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {signInReady
            ? "Manage your profile, password, projects, and plan."
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
          <h2 className="text-lg font-semibold">{user ? "Profile" : "Sign in"}</h2>
          {loading || persistence.merging ? (
            <p className="mt-2 text-sm text-slate-500">
              {persistence.merging ? "Syncing your session data…" : "Loading…"}
            </p>
          ) : user ? (
            <div className="mt-3 space-y-5">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Email status:{" "}
                  {emailConfirmed ? (
                    <span className="text-emerald-700 dark:text-emerald-300">Verified</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300">Unverified</span>
                  )}
                </p>
                {!emailConfirmed && user.email ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold underline"
                    onClick={async () => {
                      const { error } = await resendVerificationEmail(user.email!);
                      setMessage(error ?? "Verification email sent.");
                    }}
                  >
                    Resend verification email
                  </button>
                ) : null}
              </div>

              <form
                className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setProfileSaving(true);
                  setMessage(null);
                  const { error } = await updateProfile({ displayName });
                  setProfileSaving(false);
                  setMessage(error ?? "Profile updated.");
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Display name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </form>

              <form
                className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (newPassword.length < 8) {
                    setMessage("Password must be at least 8 characters.");
                    return;
                  }
                  setProfileSaving(true);
                  setMessage(null);
                  const { error } = await updatePassword(newPassword);
                  setProfileSaving(false);
                  if (!error) setNewPassword("");
                  setMessage(error ?? "Password updated.");
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Set or change password</span>
                  <input
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
                <button
                  type="submit"
                  disabled={profileSaving || newPassword.length < 8}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Update password
                </button>
              </form>

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
              <AuthForm />
              <p className="text-xs text-slate-500">
                Need to confirm an email?{" "}
                <Link href="/auth/verify" className="underline">
                  Resend verification
                </Link>
              </p>
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
              {entitlement.tier === "pro" && user ? (
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
                </div>
              ) : (
                <AuthForm className="mt-4" />
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
