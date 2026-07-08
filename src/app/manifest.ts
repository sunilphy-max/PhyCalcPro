import type { MetadataRoute } from "next";
import { defaultDescription, SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – Professional Engineering Calculators & Design Software`,
    short_name: SITE_NAME,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/phycalcpro-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
