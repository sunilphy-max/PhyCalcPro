import HomePageClient from "@/components/home/HomePageClient";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildPageMetadata,
  defaultDescription,
  defaultTitle,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: { absolute: defaultTitle },
  description: defaultDescription,
  path: "/",
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: defaultDescription,
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "EngineeringApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: defaultDescription,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd, softwareJsonLd]} />
      <HomePageClient />
    </>
  );
}
