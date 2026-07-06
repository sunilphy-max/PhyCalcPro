import Link from "next/link";
import { getSupabaseSetupStatus } from "@/lib/supabase/setupStatus";

const SETUP_STEPS = [
  "Create a free project at supabase.com",
  "Run scripts/workspace_schema.sql in the SQL Editor",
  "Enable Email auth (magic link) and add redirect URL: {APP_URL}/account",
  "Set NEXT_PUBLIC_SUPABASE_ENABLED=true plus URL, anon key, and service role key",
  "Redeploy (Vercel) or restart npm run dev",
] as const;

export default function SupabaseSetupPanel() {
  const status = getSupabaseSetupStatus();

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="text-lg font-semibold">Cloud sign-in (Supabase)</h2>
      {status === "off" ? (
        <p className="mt-2">
          Guest mode and session history work today. Cloud sign-in and cross-device history
          activate once you add Supabase environment variables.
        </p>
      ) : (
        <p className="mt-2">
          Supabase is enabled but public keys are missing. Add{" "}
          <code className="rounded bg-white/80 px-1 dark:bg-slate-900">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-white/80 px-1 dark:bg-slate-900">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          then redeploy.
        </p>
      )}
      <ol className="mt-4 list-decimal space-y-2 pl-5">
        {SETUP_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-4">
        Full checklist:{" "}
        <Link href="/documentation/supabase" className="font-semibold underline">
          Supabase setup guide
        </Link>
      </p>
    </div>
  );
}
