"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePersistenceOptional } from "@/contexts/PersistenceContext";
import { isSupabaseSignInReady, showGuestHistoryUx } from "@/lib/supabase/setupStatus";

const DISMISS_KEY = "phycalcpro:session:guest-banner-dismissed";

export default function GuestHistoryBanner() {
  const persistence = usePersistenceOptional();
  const [dismissed, setDismissed] = useState(true);
  const signInReady = isSupabaseSignInReady();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!showGuestHistoryUx()) return null;
  if (!persistence || persistence.mode !== "guest") return null;
  if (dismissed) return null;

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">
      <div className="flex items-start justify-between gap-3">
        <p>
          <span className="font-semibold">Browsing as guest.</span> Calculations are kept only for
          this tab session.{" "}
          {signInReady ? (
            <>
              <Link href="/account" className="font-semibold underline">
                Sign in
              </Link>{" "}
              to save your project and calculation history across devices.
            </>
          ) : (
            <>
              <Link href="/account" className="font-semibold underline">
                Cloud sign-in
              </Link>{" "}
              will be available once Supabase is configured.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-sky-700 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-900/60"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
