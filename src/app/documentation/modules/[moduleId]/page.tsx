import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import ModuleCatalogPanel from "@/components/documentation/ModuleCatalogPanel";
import {
  getAllModuleIdsForDocs,
  getModuleCatalogExtras,
  getModuleDoc,
  getModuleRoute,
} from "@/lib/documentation/loadReference";
import { allModules } from "@/data/modules";

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
  const title = doc?.title ?? mod?.title ?? moduleId;
  return {
    title: `${title} — Module docs`,
    description: `Methods, formulas, assumptions, and limitations for ${title}.`,
  };
}

export default async function ModuleDocumentationPage({ params }: Props) {
  const { moduleId } = await params;
  const doc = getModuleDoc(moduleId);
  const { profile, maturity } = getModuleCatalogExtras(moduleId);
  const calculatorRoute = getModuleRoute(moduleId);
  const mod = allModules.find((m) => m.id === moduleId);

  if (!doc && !profile) {
    notFound();
  }

  const pageTitle =
    doc?.title.replace(/\s*\(`[^`]+`\)\s*/, "") ??
    profile?.title ??
    mod?.title ??
    moduleId;

  return (
    <div>
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
      {mod?.description ? (
        <p className="mt-2 text-slate-600 dark:text-slate-300">{mod.description}</p>
      ) : null}

      <div className="mt-8 space-y-8">
        <ModuleCatalogPanel
          profile={profile}
          maturity={maturity}
          calculatorRoute={calculatorRoute}
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

        {maturity?.notes ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Maintainer note:</strong>{" "}
            {maturity.notes}
          </div>
        ) : null}
      </div>
    </div>
  );
}
