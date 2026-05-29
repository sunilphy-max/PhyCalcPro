import { createClient } from "@supabase/supabase-js";

export function isSupabaseServerConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "true") {
    return false;
  }
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
