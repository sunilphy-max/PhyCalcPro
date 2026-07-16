"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import MagicLinkSignInForm from "@/components/account/MagicLinkSignInForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { isSupabaseSignInReady, showAccountNav } from "@/lib/supabase/setupStatus";

function displayNameFromEmail(email: string | undefined) {
  if (!email) return "Signed in";
  const local = email.split("@")[0]?.trim();
  return local || email;
}

export default function NavUserMenu() {
  const { user, loading, signOut } = useAuth();
  const { tierLabel, isMonetizationEnabled, entitlement } = useEntitlement();
  const accountNavVisible = showAccountNav();
  const signInReady = isSupabaseSignInReady();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!accountNavVisible) return null;

  const signedIn = Boolean(user);
  const identityLabel = loading
    ? "…"
    : signedIn
      ? displayNameFromEmail(user?.email)
      : "Guest";
  const statusHint = !signInReady && !signedIn ? "Cloud pending" : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-2 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
          <UserRound className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
            {identityLabel}
          </span>
          <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {statusHint ?? tierLabel}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-[70] mt-2 w-[min(100vw-2rem,18rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950"
        >
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {signedIn ? user?.email : "Browsing as Guest"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Plan: {tierLabel}
              {isMonetizationEnabled && entitlement.tier === "free" ? " · upgrade anytime" : null}
            </p>
          </div>

          {!signedIn && signInReady ? (
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="mb-2 text-xs text-slate-600 dark:text-slate-300">
                Sign in to keep projects and history across devices.
              </p>
              <MagicLinkSignInForm compact onSuccess={() => setOpen(false)} />
            </div>
          ) : null}

          {!signedIn && !signInReady ? (
            <div className="border-b border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Cloud sign-in is not configured yet. You can keep using guest session history in this
              tab.
            </div>
          ) : null}

          <div className="flex flex-col p-2 text-sm">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Account
            </Link>
            <Link
              href="/projects"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Projects & history
            </Link>
            {isMonetizationEnabled ? (
              <Link
                href="/pricing"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {entitlement.tier === "free" ? "View pricing & upgrade" : "Pricing"}
              </Link>
            ) : null}
            {signedIn ? (
              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
