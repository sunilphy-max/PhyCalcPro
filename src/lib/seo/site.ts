import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://phycalcpro.com"
).replace(/\/+$/, "");

export const SITE_NAME = "PhyCalcPro";

export const defaultTitle =
  "PhyCalcPro – Professional Engineering Calculators & Design Software";

export const defaultDescription =
  "Professional engineering calculators for machine design, structural analysis, beam analysis, shaft design, bearings, gears, and power transmission. Document-ready mechanical and structural design software.";

export const titleTemplate = "%s — PhyCalcPro";

/** Stable OG/Twitter image routes (rendered by opengraph-image.tsx / twitter-image.tsx). */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: defaultTitle,
};
export const TWITTER_IMAGE = "/twitter-image";

type BuildPageMetadataOptions = {
  title?: string | Metadata["title"];
  description?: string;
  path: string;
  robots?: Metadata["robots"];
};

function resolveTitle(title: BuildPageMetadataOptions["title"]): string {
  if (!title) return defaultTitle;
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return defaultTitle;
}

export function buildPageMetadata({
  title,
  description = defaultDescription,
  path,
  robots = { index: true, follow: true },
}: BuildPageMetadataOptions): Metadata {
  const canonicalPath = path === "/" ? "/" : path.replace(/\/+$/, "");
  const pageTitle = resolveTitle(title);
  const url = canonicalPath === "/" ? SITE_URL : `${SITE_URL}${canonicalPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [TWITTER_IMAGE],
    },
    robots,
  };
}

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;
const bingSiteVerification =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined;

const siteVerification: NonNullable<Metadata["verification"]> = {
  ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
  ...(bingSiteVerification
    ? { other: { "msvalidate.01": bingSiteVerification } }
    : {}),
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: titleTemplate,
  },
  description: defaultDescription,
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/phycalcpro-logo.png",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [TWITTER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(Object.keys(siteVerification).length > 0
    ? { verification: siteVerification }
    : {}),
};
