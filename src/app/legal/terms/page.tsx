import Link from "next/link";
import LegalDocument from "@/components/legal/LegalDocument";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing use of PhyCalcPro engineering calculators, accounts, cloud features, and paid plans.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="July 16, 2026"
      summary="PhyCalcPro is a design-assist engineering workspace. You are responsible for validating results. The Service does not create a professional engineering relationship or certify code compliance. Paid plans, when offered, are billed through Stripe and renew until canceled."
      relatedLinks={[
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/cookies", label: "Cookie & Storage Notice" },
        { href: "/trust", label: "Trust & responsibility" },
      ]}
      sections={[
        {
          id: "agreement",
          title: "Agreement to these Terms",
          content: (
            <>
              <p>
                These Terms of Service (“Terms”) are a contract between you and{" "}
                <strong>PhyCalcPro</strong> (“we,” “us,” or “our”) governing access to and use of
                phycalcpro.com and related tools (the “Service”). By accessing or using the Service,
                you agree to these Terms and our{" "}
                <Link href="/legal/privacy">Privacy Policy</Link>. If you do not agree, do not use
                the Service.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "Eligibility and accounts",
          content: (
            <>
              <p>
                You must be able to form a binding contract under applicable law to use the Service.
                If you create an account or sign in with a magic link, you must provide accurate
                contact information and keep your email inbox secure. You are responsible for
                activity under your account. Notify us promptly of unauthorized use at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
              <p>
                Guest use is permitted without an account. Guest data may be limited to the current
                browser session and is not a substitute for cloud backup.
              </p>
            </>
          ),
        },
        {
          id: "engineering-disclaimer",
          title: "Engineering design-assist disclaimer",
          content: (
            <>
              <p>
                PhyCalcPro provides informational and design-assist calculation tools for engineers
                and technical users. <strong>Results do not constitute professional engineering
                services</strong>, stamped deliverables, code compliance certification, or project
                approval.
              </p>
              <ul>
                <li>
                  You must independently validate inputs, units, assumptions, load combinations,
                  material data, and outputs against applicable standards and project requirements.
                </li>
                <li>
                  Do not rely on the Service as the sole basis for safety-critical decisions,
                  construction, manufacturing release, or regulatory filings.
                </li>
                <li>
                  Module maturity labels (for example β / beta, verified, or certified catalog
                  status) describe our internal release process — not a warranty of fitness for your
                  project. See our <Link href="/trust">Trust &amp; responsibility</Link> page and{" "}
                  <Link href="/status">Quality dashboard</Link>.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable use",
          content: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>Misuse the Service, attempt unauthorized access, or disrupt operations</li>
                <li>Probe, scrape, or overload the Service beyond ordinary interactive use</li>
                <li>Upload unlawful, infringing, or harmful content</li>
                <li>Reverse engineer non-public aspects of the Service except as allowed by law</li>
                <li>Misrepresent calculation outputs as certified or professionally sealed work</li>
                <li>Use the Service in violation of export, sanctions, or other applicable laws</li>
              </ul>
            </>
          ),
        },
        {
          id: "user-content",
          title: "Your content and cloud storage",
          content: (
            <>
              <p>
                You retain ownership of calculation inputs, project data, and other content you
                submit (“User Content”). You grant us a limited license to host, process, and
                display User Content solely to operate the Service (including cloud sync for
                signed-in users and support troubleshooting when you contact us).
              </p>
              <p>
                You represent that you have the rights needed to submit User Content and that it
                does not violate law or third-party rights. We may remove content that violates these
                Terms or creates risk to the Service or other users.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "Intellectual property",
          content: (
            <>
              <p>
                The Service — including software, UI, branding, documentation structure, and
                original content — is owned by PhyCalcPro or its licensors and is protected by
                intellectual property laws. These Terms do not transfer ownership to you. You may
                not copy, redistribute, or create competing products from our proprietary materials
                except as expressly permitted.
              </p>
              <p>
                Third-party standards, material catalogs, and reference data remain the property of
                their respective owners. Mentions of AISC, ASME, AGMA, EN, ISO, or similar names are
                for descriptive purposes and do not imply endorsement.
              </p>
            </>
          ),
        },
        {
          id: "feedback",
          title: "Feedback",
          content: (
            <>
              <p>
                If you send ideas, suggestions, or feedback, you grant PhyCalcPro a perpetual,
                royalty-free, worldwide license to use that feedback to improve the Service without
                obligation to you.
              </p>
            </>
          ),
        },
        {
          id: "plans-billing",
          title: "Plans, payments, and cancellations",
          content: (
            <>
              <p>
                During free or early-access periods, features may be unlocked without payment. When
                monetization is enabled:
              </p>
              <ul>
                <li>Paid plans and donations are processed by Stripe</li>
                <li>Prices, plan features, and taxes are described on the Pricing page at checkout</li>
                <li>
                  Subscriptions renew automatically until you cancel through the Stripe customer
                  portal or another method we provide
                </li>
                <li>
                  Refunds, if any, are determined by PhyCalcPro under applicable consumer law and
                  the offer terms presented at purchase — not by Stripe’s default policies alone
                </li>
              </ul>
              <p>
                Failure to pay may result in suspension of paid features. Early-access or promotional
                unlocks may end when the offer period ends.
              </p>
            </>
          ),
        },
        {
          id: "availability",
          title: "Service changes and availability",
          content: (
            <>
              <p>
                We may modify, suspend, or discontinue features, modules, or the Service with or
                without notice. We do not guarantee uninterrupted or error-free operation. We may
                perform maintenance, enforce rate limits, or restrict access to protect the Service.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Suspension and termination",
          content: (
            <>
              <p>
                You may stop using the Service at any time. We may suspend or terminate access if
                you violate these Terms, create risk of harm, fail to pay for paid features, or if
                we discontinue the Service. Upon termination, your right to use the Service ends.
                Provisions that by nature should survive (including disclaimers, liability limits,
                and indemnity) will survive.
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers",
          content: (
            <>
              <p>
                THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED
                BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
                THAT RESULTS WILL BE ACCURATE, COMPLETE, OR SUITABLE FOR YOUR PROJECT.
              </p>
            </>
          ),
        },
        {
          id: "limitation",
          title: "Limitation of liability",
          content: (
            <>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PHYCALCPRO AND ITS CONTRIBUTORS WILL NOT BE
                LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
                DAMAGES, OR FOR LOST PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION, ARISING FROM
                OR RELATED TO THE SERVICE OR THESE TERMS, WHETHER BASED IN CONTRACT, TORT, OR
                OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT
                OF OR RELATING TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE
                AMOUNTS YOU PAID TO PHYCALCPRO FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE
                CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US $100).
              </p>
              <p>
                Some jurisdictions do not allow certain limitations; in those cases, our liability
                is limited to the fullest extent permitted by law.
              </p>
            </>
          ),
        },
        {
          id: "indemnity",
          title: "Indemnity",
          content: (
            <>
              <p>
                You will defend and indemnify PhyCalcPro and its contributors against claims,
                damages, losses, and expenses (including reasonable attorneys’ fees) arising from
                your User Content, your use of the Service, your violation of these Terms, or your
                reliance on calculation outputs without independent professional review.
              </p>
            </>
          ),
        },
        {
          id: "governing-law",
          title: "Governing law and disputes",
          content: (
            <>
              <p>
                These Terms are governed by the laws of the State of Delaware, USA, without regard
                to conflict-of-law rules. Subject to mandatory consumer protections that cannot be
                waived, exclusive venue for disputes arising out of these Terms or the Service lies
                in the state or federal courts located in Delaware, and you consent to personal
                jurisdiction there.
              </p>
              <p>
                Nothing in these Terms limits non-waivable rights you may have under the laws of
                your place of residence.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to these Terms",
          content: (
            <>
              <p>
                We may update these Terms from time to time. The “Last updated” date will change
                when we do. Continued use after changes become effective constitutes acceptance of
                the updated Terms, except where applicable law requires additional consent.
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
                Legal and Terms questions:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
              <p>
                Support: <Link href="/support">/support</Link>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
