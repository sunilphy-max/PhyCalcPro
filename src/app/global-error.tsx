"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="mx-auto max-w-lg px-4 py-16 font-sans text-slate-900">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">
          An unexpected error occurred. You can try again, or return home.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
            Home
          </a>
        </div>
      </body>
    </html>
  );
}
