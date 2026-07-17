import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication error | PhyCalcPro",
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const message = params.message?.trim() || "Something went wrong with that sign-in link.";

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
        Sign-in link issue
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <p className="mt-4 text-sm text-slate-500">
        Links expire for security. Request a new magic link or password reset and try again.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/account"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Back to account
        </Link>
        <Link
          href="/auth/forgot-password"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Forgot password
        </Link>
      </div>
    </main>
  );
}
