import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import ModuleCatalogPanel from "@/components/documentation/ModuleCatalogPanel";
import DocumentationToc from "@/components/documentation/DocumentationToc";
import {
  getAllModuleIdsForDocs,
  getModuleCatalogExtras,
  getModuleDoc,
  getModuleDocForDisplay,
  getModuleRoute,
  getRelatedModules,
} from "@/lib/documentation/loadReference";
import { allModules, categories } from "@/data/modules";
import { buildPageMetadata } from "@/lib/seo/site";
import { documentationModuleJsonLd } from "@/lib/seo/documentationJsonLd";

type Props = {
  params: Promise<{ moduleId: string }>;
};

export async function generateStaticParams() {
  return getAllModuleIdsForDocs().map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({ params }: Props) {
  const { moduleId } = await params;
  const doc = getModuleDoc(moduleId);
  const mod = allModules.find((m) => m.id === moduleId);
  const seoTitle =
    doc?.frontmatter.seoTitle ??
    doc?.title.replace(/\s*\(`[^`]+`\)\s*/, "") ??
    mod?.title ??
    moduleId;
  const description =
    doc?.frontmatter.seoDescription ??
    mod?.description ??
    `Engineering guide for ${seoTitle}: workflow, formulas, worked example, and calculator.`;
  return buildPageMetadata({
    title: seoTitle,
    description,
    path: `/documentation/modules/${moduleId}`,
  });
}

export default async function ModuleDocumentationPage({ params }: Props) {
  const { moduleId } = await params;
  const rawDoc = getModuleDoc(moduleId);
  const doc = getModuleDocForDisplay(moduleId);
  const { profile, maturity } = getModuleCatalogExtras(moduleId);
  const calculatorRoute = getModuleRoute(moduleId);
  const mod = allModules.find((m) => m.id === moduleId);
  const related = getRelatedModules(moduleId);
  const category = categories.find((c) => c.id === mod?.category);

  if (!doc && !profile && !mod) {
    notFound();
  }

  const pageTitle =
    rawDoc?.frontmatter.guideHeadline ??
    rawDoc?.frontmatter.seoTitle ??
    rawDoc?.title.replace(/\s*\(`[^`]+`\)\s*/, "") ??
    profile?.title ??
    mod?.title ??
    moduleId;

  const description =
    rawDoc?.frontmatter.seoDescription ?? mod?.description ?? undefined;

  const jsonLd = documentationModuleJsonLd({
    moduleId,
    title: pageTitle,
    description:
      description ??
      `Engineering knowledge guide for ${pageTitle} with formulas, worked example, and calculator.`,
    calculatorRoute,
    categoryTitle: category?.title,
    faq: rawDoc?.faq ?? [],
    keywords: rawDoc?.frontmatter.keywords,
  });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="text-sm text-slate-500">
        <Link href="/documentation" className="hover:underline">
          Documentation
        </Link>
        <span className="mx-2">/</span>
        <Link href="/documentation/modules" className="hover:underline">
          Modules
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{pageTitle}</span>
      </p>

      <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{pageTitle}</h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-8">
          <ModuleCatalogPanel
            profile={profile}
            maturity={maturity}
            calculatorRoute={calculatorRoute}
            fallbackTitle={mod?.title ?? pageTitle}
          />

          {doc ? (
            <MarkdownContent markdown={doc.markdown} />
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              Detailed technical write-up for this module is not yet in the reference document.
              See the{" "}
              <Link href="/documentation/reference" className="font-medium underline">
                full reference
              </Link>{" "}
              or open the calculator for in-app guidance.
            </p>
          )}

          {related.length > 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Related guides
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/documentation/modules/${item.id}`}
                      className="text-sm text-blue-700 hover:underline dark:text-blue-400"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {maturity?.notes ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Maintainer note:</strong>{" "}
              {maturity.notes}
            </div>
          ) : null}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <DocumentationToc items={rawDoc?.toc ?? []} />
            {calculatorRoute ? (
              <a
                href={calculatorRoute}
                className="block rounded-2xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
              >
                Open calculator
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
