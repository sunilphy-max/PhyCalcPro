"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordClient() {
  const { resetPasswordForEmail, configured } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(
    searchParams.get("error") === "recovery_required"
      ? "Open the password reset link from your email to set a new password."
      : null
  );
  const [sending, setSending] = useState(false);

  if (!configured) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Password reset is not available until Supabase Auth is configured.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter your account email and we will send a reset link.
        </p>
      </div>

      <form
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onSubmit={async (event) => {
          event.preventDefault();
          setSending(true);
          setMessage(null);
          const { error } = await resetPasswordForEmail(email);
          setSending(false);
          setMessage(error ?? "If that email is registered, a reset link is on its way.");
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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {sending ? "Sending…" : "Send reset link"}
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
