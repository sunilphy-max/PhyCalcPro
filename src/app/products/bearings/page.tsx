import BearingSuiteLanding from "@/components/machine/bearings-shared/BearingSuiteLanding";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: { absolute: "Bearing Engineering Suite — PhyCalcPro" },
  description:
    "Bearing Application System Designer — ISO 281 L10, stations, catalog sizing, lubrication, fits, and service diagnosis in one workspace.",
  path: "/products/bearings",
  keywords: [
    "bearing system designer",
    "bearing life calculator",
    "ISO 281",
    "L10 life",
    "bearing selection",
    "equivalent dynamic load",
    "SKF bearing",
  ],
});

export default function Page() {
  return <BearingSuiteLanding />;
}
