import Link from "next/link";
import LegalDocument from "@/components/legal/LegalDocument";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Cookie & Storage Notice",
  description:
    "How PhyCalcPro uses cookies, local storage, and session storage for preferences, guest history, and sign-in.",
  path: "/legal/cookies",
});

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie & Storage Notice"
      lastUpdated="July 16, 2026"
      summary="PhyCalcPro uses essential browser storage for preferences, guest calculation history, and optional sign-in. We do not currently run advertising or client-side analytics cookies. If we add non-essential analytics later, we will introduce consent controls first."
      relatedLinks={[
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/terms", label: "Terms of Service" },
        { href: "/support", label: "Support" },
      ]}
      sections={[
        {
          id: "overview",
          title: "Overview",
          content: (
            <>
              <p>
                This Cookie &amp; Storage Notice explains how <strong>PhyCalcPro</strong> uses
                cookies and similar technologies, including HTML local storage and session storage.
                It supplements our <Link href="/legal/privacy">Privacy Policy</Link>.
              </p>
            </>
          ),
        },
        {
          id: "what-we-use",
          title: "What we use today",
          content: (
            <>
              <p>
                Based on the current product implementation, PhyCalcPro primarily relies on{" "}
                <strong>local storage</strong> and <strong>session storage</strong> in your browser,
                plus essential hosting/security mechanisms. We have not integrated advertising SDKs
                or client-side analytics packages (such as Google Analytics, Meta Pixel, or similar
                trackers).
              </p>
              <table className="mt-4 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 pr-3 font-semibold">Technology</th>
                    <th className="py-2 pr-3 font-semibold">Purpose</th>
                    <th className="py-2 font-semibold">Category</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Theme preference (`theme`)</td>
                    <td className="py-2 pr-3">Remember light/dark mode</td>
                    <td className="py-2">Essential / functional</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Design standard selection</td>
                    <td className="py-2 pr-3">Remember US/EU/ISO (or similar) defaults</td>
                    <td className="py-2">Essential / functional</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Guest projects &amp; history</td>
                    <td className="py-2 pr-3">Keep session studies until the tab closes</td>
                    <td className="py-2">Essential / functional</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Workflow handoffs / assemblies</td>
                    <td className="py-2 pr-3">Carry inputs between related calculators</td>
                    <td className="py-2">Essential / functional</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Entitlement / unlock tokens</td>
                    <td className="py-2 pr-3">Remember plan access when monetization is on</td>
                    <td className="py-2">Essential / functional</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-3">Supabase auth session</td>
                    <td className="py-2 pr-3">Keep you signed in after magic-link login</td>
                    <td className="py-2">Essential / authentication</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Hosting / CDN security</td>
                    <td className="py-2 pr-3">Operate TLS, routing, and abuse protection</td>
                    <td className="py-2">Essential / security</td>
                  </tr>
                </tbody>
              </table>
            </>
          ),
        },
        {
          id: "analytics",
          title: "Analytics and advertising",
          content: (
            <>
              <p>
                <strong>No advertising or client-side analytics cookies are enabled</strong> in the
                current build we ship. Because optional tracking is not active, we do not show a
                consent banner for non-essential cookies at this time.
              </p>
              <p>
                If we later enable non-essential analytics or marketing tags, we will update this
                notice and introduce appropriate consent or preference controls before those tools
                load for users who require them.
              </p>
            </>
          ),
        },
        {
          id: "managing",
          title: "How to manage storage",
          content: (
            <>
              <ul>
                <li>Use your browser settings to clear cookies, local storage, and session storage</li>
                <li>Sign out from the top-bar account menu to end a PhyCalcPro session</li>
                <li>Close the browser tab to clear typical guest session history</li>
              </ul>
              <p>
                Blocking essential storage may break theme persistence, guest history, or sign-in.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes",
          content: (
            <>
              <p>
                We may update this notice when our technologies change. The “Last updated” date
                reflects the latest revision.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <>
              <p>
                Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
