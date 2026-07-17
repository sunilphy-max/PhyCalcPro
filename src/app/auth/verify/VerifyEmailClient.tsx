"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmailClient() {
  const { resendVerificationEmail, configured } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!configured) {
    return <p className="text-sm text-slate-600">Authentication is not configured.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We sent a confirmation link. Open it to activate your account, or resend below.
        </p>
      </div>

      <form
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onSubmit={async (event) => {
          event.preventDefault();
          setSending(true);
          setMessage(null);
          const { error } = await resendVerificationEmail(email);
          setSending(false);
          setMessage(error ?? "Verification email sent if the account needs confirmation.");
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {sending ? "Sending…" : "Resend verification email"}
        </button>
        {message ? (
          <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
            {message}
          </p>
        ) : null}
      </form>

      <p className="text-sm text-slate-500">
        <Link href="/account" className="underline">
          Back to account
        </Link>
      </p>
    </div>
  );
}
