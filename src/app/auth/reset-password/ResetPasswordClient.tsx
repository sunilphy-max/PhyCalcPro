"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordClient() {
  const { user, loading, updatePassword, configured } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!configured) {
    return <p className="text-sm text-slate-600">Authentication is not configured.</p>;
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading session…</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Open the reset link from your email first, or request a new one.
        </p>
        <Link href="/auth/forgot-password" className="text-sm font-semibold underline">
          Request reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Set new password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Choose a new password for {user.email}.
        </p>
      </div>

      <form
        className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onSubmit={async (event) => {
          event.preventDefault();
          if (password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
          }
          if (password !== confirm) {
            setMessage("Passwords do not match.");
            return;
          }
          setSaving(true);
          setMessage(null);
          const { error } = await updatePassword(password);
          setSaving(false);
          if (error) {
            setMessage(error);
            return;
          }
          setMessage("Password updated.");
          router.push("/account");
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">New password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-slate-950 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {saving ? "Saving…" : "Update password"}
        </button>
        {message ? (
          <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
