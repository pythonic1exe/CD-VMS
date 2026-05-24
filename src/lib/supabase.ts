import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://example.supabase.co",
  supabasePublishableKey ?? "sb_publishable_placeholder",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  }
);

export function getAuthRedirectUrl(path: string) {
  const url = new URL(path, window.location.origin);
  return url.toString();
}
