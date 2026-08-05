import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import BearingAssistantForm from "@/components/machine/bearings/BearingAssistantForm";
import {
  BEARING_APPLICATION_ASSISTANTS,
  getBearingAssistant,
  parseAssistantId,
} from "@/lib/machine/bearings/bearingApplicationAssistants";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return BEARING_APPLICATION_ASSISTANTS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const assistant = getBearingAssistant(parseAssistantId(id) ?? id);
  if (!assistant) {
    return buildPageMetadata({
      title: "Bearing assistant",
      description: "Machine-guided bearing selection assistant.",
      path: `/products/bearings/assistant/${id}`,
      robots: { index: false, follow: true },
    });
  }
  return buildPageMetadata({
    title: { absolute: `${assistant.label} Bearing Assistant — PhyCalcPro` },
    description: assistant.blurb,
    path: `/products/bearings/assistant/${assistant.id}`,
  });
}

export default async function BearingAssistantPage({ params }: Props) {
  const { id } = await params;
  const assistantId = parseAssistantId(id);
  const assistant = assistantId ? getBearingAssistant(assistantId) : null;

  if (!assistant) {
    return (
      <BearingSuiteChrome subtitle="Selection assistant">
        <div className="px-4 py-12 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Unknown assistant
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Choose a machine assistant from the bearing start page.
          </p>
          <Link
            href="/products/bearings"
            className="mt-4 inline-block text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            Back to start →
          </Link>
        </div>
      </BearingSuiteChrome>
    );
  }

  return (
    <BearingSuiteChrome subtitle={`${assistant.label} — guided selection`}>
      <BearingAssistantForm assistant={assistant} />
    </BearingSuiteChrome>
  );
}
