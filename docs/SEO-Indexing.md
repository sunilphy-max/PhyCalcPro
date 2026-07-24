# SEO / Search Console indexing

## Production env

Set on Vercel Production (and locally in `.env.local` when testing verification tags):

```bash
NEXT_PUBLIC_APP_URL=https://www.phycalcpro.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=   # content value from Google Search Console HTML meta tag
NEXT_PUBLIC_BING_SITE_VERIFICATION=     # content value from Bing Webmaster HTML meta tag (msvalidate.01)
```

`NEXT_PUBLIC_APP_URL` drives absolute URLs in `/sitemap.xml`, `/robots.txt`, canonicals, and Open Graph. Leave verification vars blank until you have tokens; meta tags are omitted when unset.

**Preferred host is www** (`https://www.phycalcpro.com`). Do not set `NEXT_PUBLIC_APP_URL` to the apex origin or a Vercel preview URL in Production.

### Domain redirects (important)

Canonicalize the host **only in Vercel → Project → Settings → Domains** — not in `next.config.ts`.

| Correct setup | Wrong setup (causes ERR_TOO_MANY_REDIRECTS) |
|---------------|---------------------------------------------|
| Primary: `www.phycalcpro.com` · Redirect apex → www | App redirects www → apex **while** Vercel redirects apex → www |

1. Open [Vercel Domains](https://vercel.com/dashboard) for PhyCalcPro.
2. Set **`www.phycalcpro.com` as the primary domain**.
3. Ensure **`phycalcpro.com` redirects to `www.phycalcpro.com`** (not the reverse).
4. Confirm: `curl -sI https://phycalcpro.com/` → `307/308` to `https://www.phycalcpro.com/`, and www returns `200`.

Do not add an opposing host redirect in [`next.config.ts`](../next.config.ts); conflicting app + Vercel redirects previously caused `ERR_TOO_MANY_REDIRECTS`.

## Canonicals

Every indexable page emits an absolute `<link rel="canonical">` from [`buildPageMetadata`](../src/lib/seo/site.ts) (and a root fallback on `rootMetadata`). Example:

`https://www.phycalcpro.com/products/structural/beams`

After deploy, use Search Console **URL Inspection** and confirm “user-declared canonical” matches the www absolute URL. “Duplicate without user-selected canonical” typically clears after Google recrawls (days–weeks).

## Register and submit sitemap

1. Deploy with the production URL and any verification tokens set.
2. Confirm tags in page source (`google-site-verification`, `msvalidate.01`) before clicking Verify.
3. [Google Search Console](https://search.google.com/search-console) — verify the **www** property (or a Domain property covering both), then submit `https://www.phycalcpro.com/sitemap.xml`.
4. [Bing Webmaster Tools](https://www.bing.com/webmaster) — verify the site, then submit the same sitemap URL.

Public crawl surface: [`src/app/sitemap.ts`](../src/app/sitemap.ts), [`src/app/robots.ts`](../src/app/robots.ts). Private areas (`/account`, `/billing`, `/projects`, `/copilot`, `/api/`) are disallowed or `noindex`.
