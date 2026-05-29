export const metadata = { title: "Privacy Policy — PhyCalcPro" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: May 2026</p>
      <p>
        PhyCalcPro minimizes data collection. Most calculation data stays in your browser unless you
        use optional cloud workspace features.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Stripe processes payment and customer records when you donate or subscribe.</li>
        <li>License tokens are stored locally in your browser after successful checkout.</li>
        <li>Anonymous usage may be logged by hosting providers (e.g. Vercel).</li>
      </ul>
      <h2>Cookies and local storage</h2>
      <p>
        We use local storage for theme preference, design code selection, and entitlement tokens.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions: <a href="mailto:support@phycalcpro.com">support@phycalcpro.com</a>
      </p>
    </article>
  );
}
