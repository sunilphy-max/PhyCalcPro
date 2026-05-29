export const metadata = { title: "Terms of Service — PhyCalcPro" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: May 2026</p>
      <p>
        PhyCalcPro provides engineering calculation tools for informational and design-assist
        purposes. Results do not constitute professional engineering services or code compliance
        certification.
      </p>
      <h2>Use of software</h2>
      <p>
        You are responsible for validating all inputs, units, load combinations, and outputs against
        applicable standards and project requirements. Do not rely on PhyCalcPro as the sole basis
        for safety-critical decisions.
      </p>
      <h2>Subscriptions and donations</h2>
      <p>
        Paid plans are billed through Stripe. Subscriptions renew until canceled in the Stripe
        customer portal. Refund policies follow Stripe and local consumer law.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        The software is provided &quot;as is&quot; without warranty. To the maximum extent permitted by law,
        PhyCalcPro and its contributors are not liable for indirect or consequential damages arising
        from use of the tools.
      </p>
      <h2>Contact</h2>
      <p>
        <a href="mailto:support@phycalcpro.com">support@phycalcpro.com</a>
      </p>
    </article>
  );
}
