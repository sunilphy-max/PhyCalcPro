import { redirect } from "next/navigation";

/** Legacy Selection URL — canonical workspace is System Designer. */
export default async function SelectionRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  if (!params.has("intent")) params.set("intent", "design");
  const qs = params.toString();
  redirect(qs ? `/products/bearings/designer?${qs}` : "/products/bearings/designer?intent=design");
}
