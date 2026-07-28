import BearingSuiteLanding from "@/components/machine/bearings-shared/BearingSuiteLanding";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: { absolute: "Bearing Engineering Suite — PhyCalcPro" },
  description:
    "Bearing life calculator, ISO 281 L10, catalog database, equivalent load, arrangement, lubrication, mounting, and failure analysis — one engineering suite.",
  path: "/products/bearings",
  keywords: [
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
