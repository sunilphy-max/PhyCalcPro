# SEO / Search Console indexing

## Production env

Set on Vercel Production (and locally in `.env.local` when testing verification tags):

```bash
NEXT_PUBLIC_APP_URL=https://phycalcpro.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=   # content value from Google Search Console HTML meta tag
NEXT_PUBLIC_BING_SITE_VERIFICATION=     # content value from Bing Webmaster HTML meta tag (msvalidate.01)
```

`NEXT_PUBLIC_APP_URL` drives absolute URLs in `/sitemap.xml`, `/robots.txt`, canonicals, and Open Graph. Leave verification vars blank until you have tokens; meta tags are omitted when unset.

## Register and submit sitemap

1. Deploy with the production URL and any verification tokens set.
2. Confirm tags in page source (`google-site-verification`, `msvalidate.01`) before clicking Verify.
3. [Google Search Console](https://search.google.com/search-console) — verify the property, then submit `https://phycalcpro.com/sitemap.xml`.
4. [Bing Webmaster Tools](https://www.bing.com/webmaster) — verify the site, then submit the same sitemap URL.

Public crawl surface: [`src/app/sitemap.ts`](../src/app/sitemap.ts), [`src/app/robots.ts`](../src/app/robots.ts). Private areas (`/account`, `/billing`, `/projects`, `/copilot`, `/api/`) are disallowed or `noindex`.
