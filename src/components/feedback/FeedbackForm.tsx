"use client";

import { useState } from "react";
import { Send } from "lucide-react";
const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-slate-700";

type Status = "idle" | "submitting" | "success" | "error";

export default function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          website: "",
        }),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Network error. Check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/40">
        <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">Thanks — we got your message</h2>
        <p className="mt-2 text-sm leading-7 text-green-800 dark:text-green-200">
          We will only use your email if we need to follow up. You can send another message anytime.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-green-900 underline dark:text-green-100"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Send feedback</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
        Share one email address and a short message. We read everything — bugs, benchmark data, feature ideas, or
        questions about a module.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <span>Your email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={fieldClass}
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <span>Message</span>
          <textarea
            name="message"
            required
            rows={6}
            minLength={10}
            maxLength={5000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Module name, what you expected, and what you saw…"
            className={fieldClass}
          />
        </label>

        {/* Honeypot — hidden from users */}
        <label className="hidden" aria-hidden="true">
          <span>Website</span>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto"
      >
        <Send className="h-4 w-4" aria-hidden />
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>

      <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
        Your email is used only to reply if needed. See our{" "}
        <a href="/legal/privacy" className="underline">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
