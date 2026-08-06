import BearingSuiteLanding from "@/components/machine/bearings-shared/BearingSuiteLanding";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: { absolute: "Bearing Selection — PhyCalcPro" },
  description:
    "Select and evaluate rolling bearings: Auto-design, Validate, Compare, or Diagnose — ISO 281 / ISO 76 screening with the PhyCalc selection process.",
  path: "/products/bearings",
  keywords: [
    "bearing calculator",
    "bearing auto-design",
    "ISO 281",
    "L10 life",
    "bearing selection",
    "SKF bearing",
  ],
});

export default function Page() {
  return <BearingSuiteLanding />;
}
