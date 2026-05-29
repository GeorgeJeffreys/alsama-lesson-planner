import { createClient } from "@supabase/supabase-js";

// Server-side client — uses service role key, never expose to the browser.
// Supabase's Database generic doesn't thread correctly with JSONB array columns
// in the Row/Insert types; query results are typed explicitly at call sites.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}
