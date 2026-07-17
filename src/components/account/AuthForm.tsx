"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type AuthFormProps = {
  compact?: boolean;
  onSuccess?: () => void;
  className?: string;
  /** Prefer password tab when opening from signup CTA */
  defaultMode?: "password" | "magic" | "signup";
};

type Mode = "password" | "magic" | "signup";

export default function AuthForm({
  compact = false,
  onSuccess,
  className = "",
  defaultMode = "password",
}: AuthFormProps) {
  const {
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const labelClass = compact
    ? "sr-only"
    : "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className={className}>
      <div className={`mb-3 flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800 ${compact ? "text-xs" : "text-sm"}`}>
        {(
          [
            ["password", "Password"],
            ["magic", "Magic link"],
            ["signup", "Sign up"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setMessage(null);
            }}
            className={`flex-1 rounded-full px-2 py-1.5 font-semibold transition ${
              mode === id
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setSending(true);
          setMessage(null);

          let result: { error?: string; needsEmailConfirmation?: boolean };
          if (mode === "magic") {
            result = await signInWithEmail(email);
            if (!result.error) {
              setMessage("Check your email for the magic link.");
              onSuccess?.();
            }
          } else if (mode === "signup") {
            result = await signUpWithPassword(email, password, displayName || undefined);
            if (!result.error) {
              if (result.needsEmailConfirmation) {
                setMessage("Account created. Check your email to verify, then sign in.");
              } else {
                setMessage("Account created. You are signed in.");
                onSuccess?.();
              }
            }
          } else {
            result = await signInWithPassword(email, password);
            if (!result.error) {
              onSuccess?.();
            }
          }

          if (result.error) setMessage(result.error);
          setSending(false);
        }}
      >
        {mode === "signup" && !compact ? (
          <label className="block">
            <span className={labelClass}>Display name</span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
        ) : null}

        <label className="block">
          <span className={labelClass}>Work email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </label>

        {mode !== "magic" ? (
          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </label>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          {sending
            ? "Please wait…"
            : mode === "magic"
              ? "Send magic link"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
        </button>

        {mode === "password" ? (
          <p className="text-center text-xs text-slate-500">
            <Link href="/auth/forgot-password" className="underline hover:text-slate-700 dark:hover:text-slate-200">
              Forgot password?
            </Link>
          </p>
        ) : null}

        {message ? (
          <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
            {message}
          </p>
        ) : mode === "magic" ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We email you a one-time sign-in link. No password needed.
          </p>
        ) : null}
      </form>
    </div>
  );
}
