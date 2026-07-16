"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type MagicLinkSignInFormProps = {
  /** Compact layout for nav dropdowns */
  compact?: boolean;
  onSuccess?: () => void;
  className?: string;
};

export default function MagicLinkSignInForm({
  compact = false,
  onSuccess,
  className = "",
}: MagicLinkSignInFormProps) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  return (
    <form
      className={`space-y-3 ${className}`}
      onSubmit={async (event) => {
        event.preventDefault();
        setSending(true);
        setMessage(null);
        const { error } = await signInWithEmail(email);
        setSending(false);
        if (error) {
          setMessage(error);
          return;
        }
        setMessage("Check your email for the magic link.");
        onSuccess?.();
      }}
    >
      <label className="block">
        <span className={compact ? "sr-only" : "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"}>
          Work email
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </label>
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
      >
        {sending ? "Sending…" : "Send magic link"}
      </button>
      {message ? (
        <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
          {message}
        </p>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No password — we email you a one-time sign-in link.
        </p>
      )}
    </form>
  );
}
