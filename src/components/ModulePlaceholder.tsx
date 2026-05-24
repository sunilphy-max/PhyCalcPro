type Props = {
  title: string;
  description: string;
  details: string;
  highlights: string[];
};

export default function ModulePlaceholder({ title, description, details, highlights }: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.32em] text-slate-500">Coming soon</div>
        <h1 className="text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="text-slate-600 text-base leading-8">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Module overview</h2>
          <p className="mt-4 text-slate-600 leading-7">{details}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Key capabilities</h2>
          <ul className="mt-4 space-y-3 text-slate-600">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
