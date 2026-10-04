import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseUrl, requireEnv } from "@/lib/env";

export function createAdminClient() {
  const serviceRoleKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
