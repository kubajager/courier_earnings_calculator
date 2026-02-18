import { Suspense } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { calculateAll } from "@/lib/calc";
import { getSubmissionBySid } from "@/lib/supabaseServer";
import { VysledekClient } from "./VysledekClient";

type SearchParams = Promise<{ sid?: string; h?: string; d?: string; e?: string; c?: string; p?: string }>;

export default async function VysledekPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sid = params.sid?.trim() || null;
  const hours = parseFloat(params.h ?? "0");
  const deliveries = parseFloat(params.d ?? "0");
  const earnings = parseFloat(params.e ?? "0");
  const city = params.c?.trim() || "Neznámé";
  const platform = params.p?.trim() || "Neznámá";

  let result: {
    city: string;
    platform: string;
    hours_week: number;
    deliveries_week: number;
    earnings_week_czk: number;
    hourly_rate: number;
    earnings_per_delivery: number;
  } | null = null;
  let linkSid: string | null = null;

  if (sid) {
    const row = await getSubmissionBySid(sid);
    if (row) {
      result = {
        city: row.city,
        platform: row.platform,
        hours_week: row.hours_week,
        deliveries_week: row.deliveries_week,
        earnings_week_czk: row.earnings_week_czk,
        hourly_rate: row.hourly_rate,
        earnings_per_delivery: row.earnings_per_delivery,
      };
      linkSid = row.share_id;
    }
  }

  if (!result && hours > 0 && deliveries > 0 && earnings > 0) {
    const computed = calculateAll({
      hoursPerWeek: hours,
      deliveriesPerWeek: deliveries,
      earningsPerWeek: earnings,
    });
    result = {
      city,
      platform,
      hours_week: hours,
      deliveries_week: deliveries,
      earnings_week_czk: earnings,
      hourly_rate: computed.hourlyRate,
      earnings_per_delivery: computed.earningsPerDelivery,
    };
  }

  if (!result) {
    return (
      <PageShell title="Chyba" subtitle="Neplatné parametry výpočtu">
        <div className="space-y-4">
          <p className="text-[#B0B5BA]">
            Omlouváme se, ale některé údaje chybí nebo jsou neplatné. Prosím, vraťte
            se na kalkulačku a zadejte správné hodnoty.
          </p>
          <Link
            href="/kalkulacka"
            className="inline-block px-6 py-3 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
          >
            Zpět na kalkulačku
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <Suspense
      fallback={
        <PageShell title="Načítání..." subtitle="Prosím počkejte">
          <div className="text-[#B0B5BA]">Načítání výsledků...</div>
        </PageShell>
      }
    >
      <VysledekClient result={result} sid={linkSid} />
    </Suspense>
  );
}
