"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { calculateAll, formatCZK } from "@/lib/calc";
import { generateRecommendations } from "@/lib/recommendations";
import { supabase } from "@/lib/supabaseClient";

type BenchRow = {
  avg_hourly_rate: number | null;
  avg_earnings_per_delivery: number | null;
  avg_earnings_week_czk: number | null;
};

type BenchmarkBlock =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ok";
      n: number;
      avgHourlyRate: number | null;
      avgEarningsPerDelivery: number | null;
      avgEarningsWeek: number | null;
      trimmedUsed: boolean;
    };

function VysledekContent() {
  const searchParams = useSearchParams();

  // Parse query params with validation
  const hoursPerWeek = parseFloat(searchParams.get("h") || "0");
  const deliveriesPerWeek = parseFloat(searchParams.get("d") || "0");
  const earningsPerWeek = parseFloat(searchParams.get("e") || "0");
  const city = searchParams.get("c") || "Neznámé";
  const platform = searchParams.get("p") || "Neznámá";

  // Validate inputs
  const isValid =
    hoursPerWeek > 0 &&
    deliveriesPerWeek > 0 &&
    earningsPerWeek > 0;

  if (!isValid) {
    return (
      <PageShell
        title="Chyba"
        subtitle="Neplatné parametry výpočtu"
      >
        <div className="space-y-4">
          <p className="text-[#B0B5BA]">
            Omlouváme se, ale některé údaje chybí nebo jsou neplatné. Prosím,
            vraťte se na kalkulačku a zadejte správné hodnoty.
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

  // Calculate results
  const results = calculateAll({
    hoursPerWeek,
    deliveriesPerWeek,
    earningsPerWeek,
  });

  // Calculate deliveries per hour for recommendations
  const deliveriesPerHour = deliveriesPerWeek / hoursPerWeek;

  // Generate recommendations
  const recommendations = generateRecommendations({
    deliveriesPerHour,
    hourlyRate: results.hourlyRate,
    earningsPerDelivery: results.earningsPerDelivery,
  });

  const [benchGlobal, setBenchGlobal] = useState<BenchmarkBlock>({ status: "loading" });
  const [benchCity, setBenchCity] = useState<BenchmarkBlock>({ status: "loading" });
  const [benchPlatform, setBenchPlatform] = useState<BenchmarkBlock>({ status: "loading" });
  const [shareState, setShareState] = useState<
    { status: "idle" } | { status: "copied" } | { status: "fallback"; url: string }
  >({ status: "idle" });

  const canQuerySupabase = useMemo(() => {
    // If env is missing in production, supabase client is created with empty values.
    // Avoid noisy runtime failures by skipping queries.
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    if (!canQuerySupabase) {
      setBenchGlobal({ status: "error" });
      setBenchCity({ status: "error" });
      setBenchPlatform({ status: "error" });
      return;
    }

    const fetchTrimmedMean = async (
      filter: { city?: string; platform?: string } | undefined,
      column: "hourly_rate" | "earnings_per_delivery",
      n: number
    ) => {
      const cut = Math.floor(n * 0.05);
      if (n < 50 || cut === 0) {
        let q = supabase.from("submissions").select(`avg:${column}.avg()`);
        if (filter?.city) q = q.eq("city", filter.city);
        if (filter?.platform) q = q.eq("platform", filter.platform);
        const { data, error } = await q;
        if (error || !data || data.length === 0) return { avg: null, trimmedUsed: false };
        const v = (data[0] as any)?.avg ?? null;
        return { avg: typeof v === "number" ? v : null, trimmedUsed: false };
      }

      const start = cut;
      const end = n - cut - 1;
      const pageSize = 1000;
      let sum = 0;
      let count = 0;

      for (let from = start; from <= end; from += pageSize) {
        const to = Math.min(end, from + pageSize - 1);
        let q = supabase.from("submissions").select(column);
        if (filter?.city) q = q.eq("city", filter.city);
        if (filter?.platform) q = q.eq("platform", filter.platform);
        const { data, error } = await q.order(column, { ascending: true }).range(from, to);
        if (error || !data) return { avg: null, trimmedUsed: true };
        for (const row of data as any[]) {
          const v = row?.[column];
          if (typeof v === "number" && Number.isFinite(v)) {
            sum += v;
            count += 1;
          }
        }
      }

      return { avg: count > 0 ? sum / count : null, trimmedUsed: true };
    };

    const fetchBlock = async (filter?: { city?: string; platform?: string }) => {
      // Count first (needed for trimming window)
      let countQ = supabase.from("submissions").select("id", {
        count: "exact",
        head: true,
      });
      if (filter?.city) countQ = countQ.eq("city", filter.city);
      if (filter?.platform) countQ = countQ.eq("platform", filter.platform);
      const { count, error: countError } = await countQ;
      if (countError || count == null) return { status: "error" } as BenchmarkBlock;

      if (count === 0) {
        return {
          status: "ok",
          n: 0,
          avgHourlyRate: null,
          avgEarningsPerDelivery: null,
          avgEarningsWeek: null,
          trimmedUsed: false,
        } as BenchmarkBlock;
      }

      // Weekly avg can stay simple
      let weeklyQ = supabase
        .from("submissions")
        .select("avg_earnings_week_czk:earnings_week_czk.avg()");
      if (filter?.city) weeklyQ = weeklyQ.eq("city", filter.city);
      if (filter?.platform) weeklyQ = weeklyQ.eq("platform", filter.platform);
      const { data: weeklyData, error: weeklyError } = await weeklyQ;
      const weeklyRow = weeklyData?.[0] as unknown as
        | { avg_earnings_week_czk?: number | null }
        | undefined;
      const avgEarningsWeek =
        weeklyError || !weeklyRow ? null : (weeklyRow.avg_earnings_week_czk ?? null);

      const hourly = await fetchTrimmedMean(filter, "hourly_rate", count);
      const epd = await fetchTrimmedMean(filter, "earnings_per_delivery", count);

      return {
        status: "ok",
        n: count,
        avgHourlyRate: hourly.avg,
        avgEarningsPerDelivery: epd.avg,
        avgEarningsWeek,
        trimmedUsed: hourly.trimmedUsed || epd.trimmedUsed,
      } as BenchmarkBlock;
    };

    setBenchGlobal({ status: "loading" });
    setBenchCity({ status: "loading" });
    setBenchPlatform({ status: "loading" });

    void (async () => {
      setBenchGlobal(await fetchBlock());
      setBenchCity(city && city !== "Neznámé" ? await fetchBlock({ city }) : { status: "error" });
      setBenchPlatform(
        platform && platform !== "Neznámá" ? await fetchBlock({ platform }) : { status: "error" }
      );
    })();
  }, [canQuerySupabase, city, platform]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareState({ status: "copied" });
      window.setTimeout(() => setShareState({ status: "idle" }), 2000);
    } catch {
      setShareState({ status: "fallback", url });
    }
  };

  const Bench = ({
    title,
    block,
    threshold,
  }: {
    title: string;
    block: BenchmarkBlock;
    threshold?: number;
  }) => {
    if (block.status === "loading") {
      return (
        <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
          <h3 className="text-white font-medium mb-2">{title}</h3>
          <p className="text-[#B0B5BA] text-sm">Načítání benchmarku…</p>
        </div>
      );
    }

    if (block.status !== "ok") {
      return (
        <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
          <h3 className="text-white font-medium mb-2">{title}</h3>
          <p className="text-[#B0B5BA] text-sm">Benchmark není k dispozici.</p>
        </div>
      );
    }

    if (threshold && block.n < threshold) {
      return (
        <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
          <h3 className="text-white font-medium mb-2">{title}</h3>
          <p className="text-[#B0B5BA] text-sm">Málo dat (n={block.n}).</p>
        </div>
      );
    }

    return (
      <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
        <h3 className="text-white font-medium mb-2">{title}</h3>
        <p className="text-[#8A8F94] text-xs mb-3">n={block.n}</p>
        {block.trimmedUsed && (
          <p className="text-[#B0B5BA] text-xs mb-3">Průměr je očištěn o extrémy</p>
        )}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#B0B5BA]">Hodinová sazba</span>
            <span className="text-white font-medium">
              {block.avgHourlyRate == null ? "—" : formatCZK(block.avgHourlyRate)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B0B5BA]">Výdělek na doručení</span>
            <span className="text-white font-medium">
              {block.avgEarningsPerDelivery == null ? "—" : formatCZK(block.avgEarningsPerDelivery)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B0B5BA]">Týdenní výdělek</span>
            <span className="text-white font-medium">
              {block.avgEarningsWeek == null ? "—" : formatCZK(block.avgEarningsWeek)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageShell
      title="Výsledky výpočtu"
      subtitle={
        <>
          {city} • {platform}
          <span className="w-1 h-1 bg-[#4A5568] rounded-full shrink-0" aria-hidden />
          Posledních 7 dní
        </>
      }
    >
      <div className="space-y-8">
        {/* Results */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-medium text-white font-heading mb-4">
              Vaše statistiky
            </h2>
            <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#B0B5BA] text-sm">Hodinová sazba</span>
                <span className="text-white font-medium text-lg">
                  {formatCZK(results.hourlyRate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#B0B5BA] text-sm">Výdělek na doručení</span>
                <span className="text-white font-medium text-lg">
                  {formatCZK(results.earningsPerDelivery)}
                </span>
              </div>
              <div className="pt-4 border-t border-[#2A2F36] flex justify-between items-center">
                <span className="text-[#B0B5BA] text-sm font-medium">Měsíční odhad</span>
                <span className="text-white font-semibold text-2xl tracking-tight">
                  {formatCZK(results.monthlyEstimate)}
                </span>
              </div>
            </div>
            <p className="text-[12px] italic text-[#8A8F94] mt-4 leading-relaxed">
              * Výpočty jsou orientační a nezahrnují náklady na palivo, amortizaci vozidla ani daně. Částky jsou založeny na vámi zadaných údajích.
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-white font-heading">
            Doporučení
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5 hover:border-[#4A5568] transition-colors"
              >
                <h3 className="text-white font-medium mb-1">{rec.title}</h3>
                <p className="text-[#B0B5BA] text-sm mb-2 leading-relaxed">{rec.description}</p>
                <p className="text-[#8A8F94] text-[11px] italic uppercase tracking-wider">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-white font-heading">Benchmark</h2>
          <div className="space-y-3">
            <Bench title="Celkem (všichni)" block={benchGlobal} />
            <Bench title={`Město: ${city}`} block={benchCity} threshold={20} />
            <Bench title={`Platforma: ${platform}`} block={benchPlatform} threshold={20} />
          </div>
          <p className="text-sm text-[#B0B5BA]">
            Průměry jsou počítané z anonymních příspěvků. Pro město/platformu zobrazujeme průměr až
            od n≥20.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#2A2F36] flex flex-col sm:flex-row gap-4">
          <Link
            href="/kalkulacka"
            className="flex-1 h-[48px] flex items-center justify-center gap-2 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Zpět
          </Link>

          <div className="flex flex-col items-stretch gap-2 sm:flex-1 sm:items-end">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial h-[48px] min-w-[140px] flex items-center justify-center gap-2 border border-[#2A2F36] bg-[#12171D] text-white font-medium rounded-lg hover:bg-[#1A1F26] transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              {shareState.status === "copied" ? "Zkopírováno" : "Sdílet výsledek"}
            </button>

              {shareState.status === "fallback" && (
                <div className="w-full sm:w-[420px]">
                  <label className="block text-xs text-[#B0B5BA] mb-2">
                    Zkopíruj odkaz
                  </label>
                  <input
                    readOnly
                    value={shareState.url}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full px-3 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white text-sm"
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function VysledekPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="Načítání..." subtitle="Prosím počkejte">
          <div className="text-[#B0B5BA]">Načítání výsledků...</div>
        </PageShell>
      }
    >
      <VysledekContent />
    </Suspense>
  );
}
