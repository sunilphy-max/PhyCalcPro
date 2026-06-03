import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";

type Props = {
  markdown: string;
  className?: string;
};

export default function MarkdownContent({ markdown, className = "" }: Props) {
  return (
    <article
      className={`documentation-prose max-w-none text-slate-700 dark:text-slate-200 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeKatex,
            {
              strict: "ignore",
              throwOnError: false,
              trust: true,
              output: "html",
            },
          ],
        ]}
        components={{
          h2: ({ children, id }) => (
            <h2
              id={id}
              className="mt-12 scroll-mt-24 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-950 first:mt-0 dark:border-slate-700 dark:text-white"
            >
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3
              id={id}
              className="mt-8 scroll-mt-24 text-xl font-semibold text-slate-900 dark:text-white"
            >
              {children}
            </h3>
          ),
          h4: ({ children, id }) => (
            <h4 id={id} className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-600 dark:text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = codeClass?.includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-100">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-800/80">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="divide-x divide-slate-100 dark:divide-slate-800">{children}</tr>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
              {children}
            </tbody>
          ),
          hr: () => <hr className="my-10 border-slate-200 dark:border-slate-700" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-blue-700 underline hover:text-blue-800 dark:text-blue-400"
            >
              {children}
            </a>
          ),
          sup: ({ children }) => (
            <sup className="ml-0.5 text-[0.7em] font-medium text-blue-700 dark:text-blue-400">
              {children}
            </sup>
          ),
          section: ({ node, ...props }) => {
            const dataFootnotes = (node as { dataFootnotes?: boolean }).dataFootnotes;
            if (dataFootnotes) {
              return (
                <section
                  {...props}
                  className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-700"
                />
              );
            }
            return <section {...props} />;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
