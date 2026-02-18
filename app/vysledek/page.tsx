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

    const mean = (vals: number[]) => vals.reduce((a, b) => a + b, 0) / (vals.length || 1);

    const fetchTrimmedMean = async (
      base: ReturnType<typeof supabase.from>,
      column: "hourly_rate" | "earnings_per_delivery",
      n: number
    ) => {
      const cut = Math.floor(n * 0.05);
      if (n < 50 || cut === 0) {
        const { data, error } = await base.select(
          `avg:${column}.avg()`
        );
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
        const { data, error } = await base
          .select(column)
          .order(column, { ascending: true })
          .range(from, to);
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
      let base = supabase.from("submissions");
      if (filter?.city) base = base.eq("city", filter.city);
      if (filter?.platform) base = base.eq("platform", filter.platform);

      // Count first (needed for trimming window)
      const { count, error: countError } = await base.select("id", {
        count: "exact",
        head: true,
      });
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
      const { data: weeklyData, error: weeklyError } = await base.select(
        "avg_earnings_week_czk:earnings_week_czk.avg()"
      );
      const weeklyRow = weeklyData?.[0] as unknown as { avg_earnings_week_czk?: number | null } | undefined;
      const avgEarningsWeek =
        weeklyError || !weeklyRow ? null : (weeklyRow.avg_earnings_week_czk ?? null);

      const hourly = await fetchTrimmedMean(base, "hourly_rate", count);
      const epd = await fetchTrimmedMean(base, "earnings_per_delivery", count);

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
      subtitle={`${city} • ${platform}`}
    >
      <div className="space-y-8">
        {/* Results */}
        <div className="space-y-4">
          <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-6">
            <h2 className="text-xl font-medium text-white font-heading mb-4">
              Vaše statistiky
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#B0B5BA]">Hodinová sazba</span>
                <span className="text-white font-medium text-lg">
                  {formatCZK(results.hourlyRate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#B0B5BA]">Výdělek na doručení</span>
                <span className="text-white font-medium text-lg">
                  {formatCZK(results.earningsPerDelivery)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#2A2F36]">
                <span className="text-[#B0B5BA]">Měsíční odhad</span>
                <span className="text-white font-medium text-xl">
                  {formatCZK(results.monthlyEstimate)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#B0B5BA]">
            <strong className="text-white">Poznámka:</strong> Měsíční odhad je
            vypočítán jako týdenní výdělek × 4.33 a slouží pouze pro orientaci.
            Skutečný měsíční výdělek se může lišit v závislosti na počtu
            odpracovaných týdnů a sezónnosti.
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-white font-heading">
            Doporučení
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5"
              >
                <h3 className="text-white font-medium mb-2">{rec.title}</h3>
                <p className="text-[#B0B5BA] text-sm mb-2">{rec.description}</p>
                <p className="text-[#8A8F94] text-xs italic">{rec.reason}</p>
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

        {/* Back link */}
        <div className="pt-4 border-t border-[#2A2F36]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/kalkulacka"
              className="inline-block px-6 py-3 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors text-center"
            >
              Zpět
            </Link>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <button
                type="button"
                onClick={handleShare}
                className="px-6 py-3 border border-[#2A2F36] bg-[#12171D] text-white font-medium rounded-lg hover:bg-[#1A1F26] transition-colors"
              >
                {shareState.status === "copied" ? "Zkopírováno" : "Sdílet"}
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
