import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV === "development") {
  throw new Error(
    "Chybí Supabase env proměnné. Nastavte NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY v .env.local."
  );
}

// If env vars are missing in production, fall back to local defaults so the app doesn't crash
// (we still guard usage in the UI and queries will simply fail/no-op).
export const supabase = createClient(
  supabaseUrl ?? "http://localhost:54321",
  supabaseAnonKey ?? "anon"
);

