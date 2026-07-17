"use client";

import Link from "next/link";
import AuthForm from "@/components/account/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { isSupabaseSignInReady, showAccountNav } from "@/lib/supabase/setupStatus";

export default function HomeSignInPanel() {
  const { user, loading } = useAuth();
  const { tierLabel } = useEntitlement();
  const accountNavVisible = showAccountNav();
  const signInReady = isSupabaseSignInReady();

  if (!accountNavVisible) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60">
        Checking sign-in…
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
        <p className="font-semibold">Signed in as {user.email}</p>
        <p className="mt-1 text-xs opacity-80">
          Plan: {tierLabel}. Projects and calculation history sync to your account.
        </p>
        <Link
          href="/projects"
          className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
        >
          Open projects & history
        </Link>
      </div>
    );
  }

  if (!signInReady) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white">Browsing as Guest</p>
        <p className="mt-1 text-xs">
          Plan: {tierLabel}. Session history stays in this tab until cloud sign-in is configured.
        </p>
        <Link
          href="/account"
          className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
        >
          Account & setup
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          Sign in to save your work
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          You are a Guest on {tierLabel}. Optional — browse without an account, or sign in to keep
          projects across devices.
        </p>
      </div>
      <AuthForm compact />
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Prefer the menu? Use <span className="font-medium">Guest</span> in the top bar on any page.
      </p>
    </div>
  );
}
