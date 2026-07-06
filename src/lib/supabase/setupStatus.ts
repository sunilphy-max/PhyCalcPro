import { isFreeLaunch, isMonetizationEnabled } from "@/lib/licensing/validationMode";
import { isSupabaseBrowserConfigured } from "@/lib/supabaseBrowser";

export type SupabaseSetupStatus = "off" | "pending" | "ready";

/** Whether the operator turned on Supabase (keys may still be missing). */
export function isSupabaseEnabledFlag(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_ENABLED === "true";
}

/** Browser can open a Supabase client (enabled + URL + anon key). */
export function isSupabaseSignInReady(): boolean {
  return isSupabaseBrowserConfigured();
}

/** Operator enabled Supabase but public keys are not set yet. */
export function isSupabasePendingKeys(): boolean {
  return isSupabaseEnabledFlag() && !isSupabaseBrowserConfigured();
}

export function getSupabaseSetupStatus(): SupabaseSetupStatus {
  if (!isSupabaseEnabledFlag()) return "off";
  if (!isSupabaseBrowserConfigured()) return "pending";
  return "ready";
}

/** Account link during free launch (Phase 3) or when billing / auth is active. */
export function showAccountNav(): boolean {
  return isFreeLaunch() || isMonetizationEnabled() || isSupabaseEnabledFlag();
}

/** Guest banner and cross-session history prompts (before or after Supabase is live). */
export function showGuestHistoryUx(): boolean {
  return isFreeLaunch() || isSupabaseSignInReady();
}
