import Link from "next/link";
import { BookOpen, ShieldCheck, Wrench } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "About",
  description:
    "Learn about PhyCalcPro — a design-assist engineering workspace focused on transparent calculations, verification, and professional responsibility.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        About
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        Engineering calculations you can document
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        PhyCalcPro is a web-based design-assist workspace for mechanical, structural, and advanced
        systems engineering. We help practicing engineers size members, screen concepts, and produce
        assumption-backed reports — without pretending to replace licensed professional judgment.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Wrench,
            title: "Design-assist first",
            body: "Tools for iterative calculation and documentation, not black-box certification.",
          },
          {
            icon: ShieldCheck,
            title: "Transparent limits",
            body: "Modules disclose implemented checks, maturity labels, and what is not available yet.",
          },
          {
            icon: BookOpen,
            title: "Verification culture",
            body: "Benchmarks, quality status, and trust documentation are part of the product surface.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">What we build</h2>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          PhyCalcPro spans structural analysis, machine design, power transmission, materials,
          pressure systems, dynamics, manufacturing helpers, and advanced systems screening. Each
          module aims to expose units, design-standard context, and exportable summaries so you can
          explain the calculation later.
        </p>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          We are a product brand focused on engineering software — not a licensed professional
          engineering firm. Using PhyCalcPro does not create an engineer–client relationship.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">How we work</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>Prefer explicit assumptions over hidden defaults.</li>
          <li>Publish module maturity and automated verification status where available.</li>
          <li>Keep guest browsing useful while offering optional cloud sign-in for history sync.</li>
          <li>Invite engineer feedback, especially benchmark comparisons against worksheets.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Learn more</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <Link href="/trust" className="font-medium underline underline-offset-2">
              Trust &amp; responsibility
            </Link>{" "}
            — what we claim and do not claim
          </li>
          <li>
            <Link href="/status" className="font-medium underline underline-offset-2">
              Quality dashboard
            </Link>{" "}
            — release tiers and benchmarks
          </li>
          <li>
            <Link href="/documentation" className="font-medium underline underline-offset-2">
              Documentation
            </Link>{" "}
            — modules and methods
          </li>
          <li>
            <Link href="/support" className="font-medium underline underline-offset-2">
              Support
            </Link>{" "}
            — contact the team at {SUPPORT_EMAIL}
          </li>
        </ul>
      </section>
    </div>
  );
}
