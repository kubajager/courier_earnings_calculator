import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getServerSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type SubmissionRow = {
  id: number;
  share_id: string;
  city: string;
  platform: string;
  hours_week: number;
  deliveries_week: number;
  earnings_week_czk: number;
  hourly_rate: number;
  earnings_per_delivery: number;
};

export async function getSubmissionBySid(
  sid: string
): Promise<SubmissionRow | null> {
  if (!sid?.trim()) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc("get_submission", {
    p_sid: sid.trim(),
  });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  const row = data[0] as unknown;
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    id: Number(r.id),
    share_id: String(r.share_id ?? ""),
    city: String(r.city ?? ""),
    platform: String(r.platform ?? ""),
    hours_week: Number(r.hours_week),
    deliveries_week: Number(r.deliveries_week),
    earnings_week_czk: Number(r.earnings_week_czk),
    hourly_rate: Number(r.hourly_rate),
    earnings_per_delivery: Number(r.earnings_per_delivery),
  };
}
