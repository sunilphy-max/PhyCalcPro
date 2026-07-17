import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Supabase setup",
  description: "Enable cloud sign-in and calculation history with Supabase.",
  path: "/documentation/supabase",
});

const ENV_BLOCK = `NEXT_PUBLIC_SUPABASE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_FREE_LAUNCH=true`;

export default function SupabaseSetupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Documentation</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
        Supabase setup
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        PhyCalcPro uses Supabase for email/password and magic-link sign-in, plus cloud storage of
        saved projects and calculation history. The site runs in guest mode until you complete this
        checklist.
      </p>

      <section className="mt-10 space-y-4 text-slate-700 dark:text-slate-300">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Create a project</h2>
        <p>
          Sign in at{" "}
          <a
            href="https://supabase.com/dashboard"
            className="font-semibold text-slate-900 underline dark:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            supabase.com/dashboard
          </a>{" "}
          and create a new project (free tier). Save the database password.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Apply the schema</h2>
        <p>
          Prefer the versioned migrations under{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
            supabase/migrations
          </code>
          , or open <strong>SQL Editor</strong> and run{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
            scripts/workspace_schema.sql
          </code>{" "}
          (includes RLS). Optional entitlement/feedback tables:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
            docs/supabase-schema.sql
          </code>
          .
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Configure auth</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Authentication → Providers → Email</strong> — enable Email (password + magic
            link). Require email confirmation for new sign-ups.
          </li>
          <li>
            <strong>Authentication → URL configuration</strong> — set Site URL to your app URL and
            allow redirects to <code>/auth/callback</code>, <code>/account</code>, and{" "}
            <code>/auth/reset-password</code> on localhost and production.
          </li>
          <li>
            Full production steps (SMTP, backups, CAPTCHA, Sentry): see{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
              docs/Auth-Security-Operator-Checklist.md
            </code>
            .
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Environment variables</h2>
        <p>
          Copy keys from <strong>Project Settings → API</strong> into{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
            .env.local
          </code>{" "}
          (local) and Vercel <strong>Environment Variables</strong> (production):
        </p>
        <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100 dark:border-slate-700">
          {ENV_BLOCK}
        </pre>
        <p>
          <code>NEXT_PUBLIC_SUPABASE_ENABLED</code> must be exactly{" "}
          <code>true</code>. Keep <code>NEXT_PUBLIC_FREE_LAUNCH=true</code> to unlock all calculator
          features while billing stays hidden.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Deploy</h2>
        <p>
          Restart <code>npm run dev</code> locally or redeploy on Vercel after saving env vars. Open{" "}
          <Link href="/account" className="font-semibold underline">
            Account
          </Link>{" "}
          and send a magic link to verify sign-in.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Behavior</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Guest</strong> — calculations and history stay in this browser tab until it closes.
          </li>
          <li>
            <strong>Signed in</strong> — saved projects and calculation history sync to Supabase and
            reload on any device.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Avoid project pause</h2>
        <p>
          Free Supabase projects may pause after long inactivity. Log into the dashboard periodically
          or upgrade to Pro for always-on production use.
        </p>
      </section>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/account" className="underline">
          Back to Account
        </Link>{" "}
        ·{" "}
        <Link href="/documentation" className="underline">
          Documentation home
        </Link>
      </p>
    </div>
  );
}
