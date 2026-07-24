type TocItem = {
  id: string;
  title: string;
};

type Props = {
  items: TocItem[];
};

export default function DocumentationToc({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/50"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
      <ol className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-slate-600 hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
