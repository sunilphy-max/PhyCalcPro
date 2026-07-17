/** Fallback if env does not expose package version — keep aligned with package.json. */
const PACKAGE_VERSION = "0.1.0";

export type BuildInfo = {
  version: string;
  commitShort: string | null;
  buildLabel: string;
};

/** Server-safe version / deploy identifiers for the public footer. */
export function getBuildInfo(): BuildInfo {
  const version =
    process.env.npm_package_version?.trim() ||
    process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    PACKAGE_VERSION;

  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.GIT_COMMIT_SHA?.trim() ||
    "";
  const commitShort = commit ? commit.slice(0, 7) : null;
  const buildLabel = commitShort ? `v${version} (${commitShort})` : `v${version}`;

  return { version, commitShort, buildLabel };
}
