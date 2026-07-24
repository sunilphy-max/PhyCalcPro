import Link from "next/link";
import LegalDocument from "@/components/legal/LegalDocument";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How PhyCalcPro collects, uses, stores, and shares personal data for accounts, support, billing, and hosting.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="July 16, 2026"
      summary="PhyCalcPro minimizes data collection. Guest calculations stay in your browser session. If you sign in, submit support feedback, or purchase a plan, we process the account, message, and billing data needed to provide those features. We do not sell personal information or use it for targeted advertising."
      relatedLinks={[
        { href: "/legal/terms", label: "Terms of Service" },
        { href: "/legal/cookies", label: "Cookie & Storage Notice" },
        { href: "/support", label: "Support" },
      ]}
      sections={[
        {
          id: "who-we-are",
          title: "Who we are",
          content: (
            <>
              <p>
                This Privacy Policy describes how <strong>PhyCalcPro</strong> (“we,” “us,” or “our”)
                processes personal information when you use www.phycalcpro.com and related product pages
                (the “Service”). PhyCalcPro is operated as a product brand. For privacy requests,
                contact{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </>
          ),
        },
        {
          id: "scope",
          title: "Scope",
          content: (
            <>
              <p>This policy covers:</p>
              <ul>
                <li>Website browsing and calculator use as a guest</li>
                <li>Optional cloud sign-in and saved projects / calculation history</li>
                <li>Support and feedback submissions</li>
                <li>Paid plans, donations, and billing when monetization is enabled</li>
                <li>Hosting, security, and operational logs</li>
              </ul>
              <p>
                Engineering calculation inputs and results you enter may contain project data you
                consider confidential. Treat guest mode and cloud sync accordingly.
              </p>
            </>
          ),
        },
        {
          id: "information-we-collect",
          title: "Information we collect",
          content: (
            <>
              <p>
                <strong>Account and authentication (optional).</strong> If you sign in with a magic
                link, we process your email address, authentication tokens, and user identifier
                through Supabase Auth. Signed-in sessions may persist in your browser until you sign
                out.
              </p>
              <p>
                <strong>Cloud workspace data (signed-in users).</strong> We may store projects,
                models, equations, runs, calculation inputs/results, report metadata, and related
                timestamps associated with your account so history can sync across devices.
              </p>
              <p>
                <strong>Guest / browser storage.</strong> Without an account, calculation history,
                saved studies, theme preference, design-standard selection, workflow handoffs, and
                similar state may be stored in local or session storage on your device. Guest session
                history is typically cleared when you close the tab.
              </p>
              <p>
                <strong>Support and feedback.</strong> When you use the Support form, we collect your
                email, message, optional page URL, user agent, and use IP address for short-term rate
                limiting. Messages may be emailed to our support inbox and/or stored in our database
                when configured.
              </p>
              <p>
                <strong>Billing and entitlements (when monetization is enabled).</strong> Stripe
                processes payment and customer records. We may store license/entitlement tokens
                locally and, for signed-in users, associate entitlement information with your
                account. Tokens may include plan tier and Stripe customer identifiers needed for
                portal access.
              </p>
              <p>
                <strong>Hosting and security logs.</strong> Our hosting provider (for example,
                Vercel) and infrastructure partners may automatically collect IP address, request
                metadata, timestamps, and diagnostic logs to operate and secure the Service.
              </p>
            </>
          ),
        },
        {
          id: "how-we-use",
          title: "How we use information",
          content: (
            <>
              <ul>
                <li>Provide calculators, accounts, cloud sync, and support</li>
                <li>Authenticate users and protect accounts against abuse</li>
                <li>Process payments, manage subscriptions, and fulfill plan entitlements</li>
                <li>Respond to feedback, bug reports, and verification questions</li>
                <li>Maintain security, diagnose outages, and improve reliability</li>
                <li>Comply with law and enforce our Terms of Service</li>
              </ul>
              <p>
                We do <strong>not</strong> sell personal information. Based on the current product
                implementation, we do not use personal information for targeted advertising or
                cross-context behavioral advertising.
              </p>
            </>
          ),
        },
        {
          id: "service-providers",
          title: "Service providers",
          content: (
            <>
              <p>We use trusted processors to operate the Service, which may include:</p>
              <ul>
                <li>
                  <strong>Supabase</strong> — authentication and optional cloud database storage
                </li>
                <li>
                  <strong>Stripe</strong> — payments, customer billing profiles, and subscription
                  portal
                </li>
                <li>
                  <strong>Resend</strong> (when configured) — transactional delivery of support
                  messages
                </li>
                <li>
                  <strong>Vercel</strong> (or equivalent host) — application hosting, CDN, and logs
                </li>
              </ul>
              <p>
                Providers process data on our behalf under their terms and only as needed to deliver
                the Service.
              </p>
            </>
          ),
        },
        {
          id: "cookies-storage",
          title: "Cookies and similar technologies",
          content: (
            <>
              <p>
                PhyCalcPro primarily uses browser local storage and session storage for preferences,
                guest history, and signed-in session state. Hosting and security systems may set
                essential cookies. We do not currently run advertising or client-side analytics
                trackers. See the{" "}
                <Link href="/legal/cookies">Cookie &amp; Storage Notice</Link> for details.
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "Retention",
          content: (
            <>
              <ul>
                <li>
                  Guest browser data remains until you clear storage or close the tab (for
                  session-scoped items).
                </li>
                <li>
                  Signed-in cloud workspace data is retained while your account remains active and
                  the feature is enabled.
                </li>
                <li>
                  Support messages are retained as long as needed to respond and maintain an
                  operational record.
                </li>
                <li>
                  Billing records are retained as required for accounting, fraud prevention, and
                  legal obligations.
                </li>
                <li>Security and hosting logs are retained according to provider defaults.</li>
              </ul>
            </>
          ),
        },
        {
          id: "security",
          title: "Security",
          content: (
            <>
              <p>
                We use industry-standard safeguards appropriate to a web application, including
                HTTPS in transit and access-controlled cloud services. No method of transmission or
                storage is perfectly secure. You are responsible for protecting access to your email
                inbox used for magic-link sign-in.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "When we disclose information",
          content: (
            <>
              <p>We may disclose personal information:</p>
              <ul>
                <li>To service providers who help us operate the Service</li>
                <li>If required by law, legal process, or to protect rights, safety, or security</li>
                <li>In connection with a merger, acquisition, or asset transfer, with notice where required</li>
                <li>With your direction or consent</li>
              </ul>
            </>
          ),
        },
        {
          id: "international",
          title: "International processing",
          content: (
            <>
              <p>
                The Service may be hosted and processed in the United States and other countries
                where our providers operate. If you access the Service from outside the United
                States, you understand that your information may be transferred to and processed in
                those locations.
              </p>
            </>
          ),
        },
        {
          id: "your-choices",
          title: "Your choices and rights",
          content: (
            <>
              <p>Depending on where you live, you may have rights to:</p>
              <ul>
                <li>Access or receive a copy of personal information we hold about you</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of account or support data, subject to legal retention needs</li>
                <li>Opt out of sale/sharing — we do not sell personal information</li>
              </ul>
              <p>
                To exercise a request, email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the subject “Privacy
                request.” We may need to verify your identity (for example, confirming control of
                the account email). You can also sign out, clear browser storage, and stop using the
                Service at any time.
              </p>
              <p>
                U.S. state privacy laws (including California and similar statutes) may provide
                additional rights. We will respond to verifiable consumer requests as required by
                applicable law.
              </p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children",
          content: (
            <>
              <p>
                The Service is intended for adults and professional or educational engineering use.
                We do not knowingly collect personal information from children under 13 (or the
                age required by local law). If you believe a child provided personal information,
                contact us and we will take appropriate steps to delete it.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          content: (
            <>
              <p>
                We may update this Privacy Policy from time to time. The “Last updated” date at the
                top will change when we do. Material changes may also be highlighted on the website
                or communicated by email when appropriate.
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
                Privacy and data requests:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
              <p>
                General support: <Link href="/support">Support page</Link>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
