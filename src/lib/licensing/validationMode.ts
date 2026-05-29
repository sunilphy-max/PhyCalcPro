/**
 * Site-wide validation unlock (local / staging only).
 * Set NEXT_PUBLIC_VALIDATION_MODE=true — never in public production.
 */
export function isValidationMode(): boolean {
  return process.env.NEXT_PUBLIC_VALIDATION_MODE === "true";
}

/** All design standards and PDF export available for engineering validation. */
export function allFeaturesUnlocked(): boolean {
  return isValidationMode();
}
