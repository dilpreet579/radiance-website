import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client. Server-only: never import from a client component.
let client: SupabaseClient | null = null;

export const hasDb = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function db(): SupabaseClient {
  if (!hasDb()) throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  return (client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  }));
}
