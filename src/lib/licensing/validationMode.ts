import { readClientUnlockAll } from "./clientUnlock";
import { isDevServer, publicEnv } from "./publicEnv";

export function isValidationMode(): boolean {
  return publicEnv.validationMode;
}

function envUnlocksAll(): boolean {
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
