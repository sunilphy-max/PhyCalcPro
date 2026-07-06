import { readClientUnlockAll } from "./clientUnlock";
import { isDevServer, publicEnv } from "./publicEnv";

export function isValidationMode(): boolean {
  return publicEnv.validationMode;
}

export function isFreeLaunch(): boolean {
  return publicEnv.freeLaunch;
}

/** When false, hide Pricing/Account/Pro upsell UI (Stripe routes may remain for later). */
export function isMonetizationEnabled(): boolean {
  return !publicEnv.freeLaunch;
}

/** Show Account nav and auth UX when Supabase sign-in is ready. */
export function isAuthUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_ENABLED === "true" &&
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    );
}

function envUnlocksAll(): boolean {
  if (publicEnv.freeLaunch) return true;
  if (publicEnv.validationMode) return true;
  if (publicEnv.devEntitlement === "pro" || publicEnv.devEntitlement === "supporter") {
    return true;
  }
  if (isDevServer()) return true;
  return false;
}

/** All design standards and PDF export available for engineering validation. */
export function allFeaturesUnlocked(): boolean {
  if (envUnlocksAll()) return true;
  return readClientUnlockAll();
}
