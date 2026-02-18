"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import {
  calculateAll,
  efficiencyScore,
  formatCZK,
} from "@/lib/calc";
import { getOnboardingStatus, PLATFORM_LIST } from "@/lib/onboardingStatus";
import { getPlatformLogoPath } from "@/lib/platformLogos";
import { generateRecommendations } from "@/lib/recommendations";
import { supabase } from "@/lib/supabaseClient";

export type ResultPayload = {
  city: string;
  platform: string;
  hours_week: number;
  deliveries_week: number;
  earnings_week_czk: number;
  hourly_rate: number;
  earnings_per_delivery: number;
};

type BenchRpc = {
  n: number;
  avg_hourly_rate: number | null;
  avg_earnings_per_delivery: number | null;
  avg_earnings_week_czk: number | null;
};

type PlatformRangeRow = {
  platform: string;
  n: number;
  p25_hourly: number | null;
  p50_hourly: number | null;
  p75_hourly: number | null;
};

const THRESHOLD_PERCENT = 5;
const SCORE_ABOVE = 60;
const SCORE_BELOW = 40;

function diffPercent(user: number, benchmark: number): number | null {
  if (!benchmark || !Number.isFinite(benchmark)) return null;
  return ((user - benchmark) / benchmark) * 100;
}

function indicatorVsUser(userHourly: number, platformHourly: number | null, n: number): "green" | "red" | "neutral" | "gray" {
  if (platformHourly == null || !Number.isFinite(platformHourly) || n < 20) return "gray";
  const pct = ((userHourly - platformHourly) / platformHourly) * 100;
  if (pct >= THRESHOLD_PERCENT) return "green";
  if (pct <= -THRESHOLD_PERCENT) return "red";
  return "neutral";
}

/** Score color: above average green, below red, else neutral */
function scoreColor(score: number): "green" | "red" | "neutral" {
  if (score >= SCORE_ABOVE) return "green";
  if (score < SCORE_BELOW) return "red";
  return "neutral";
}

export function VysledekClient({
  result,
  sid,
}: {
  result: ResultPayload;
  sid: string | null;
}) {
  const results = useMemo(
    () =>
      calculateAll({
        hoursPerWeek: result.hours_week,
        deliveriesPerWeek: result.deliveries_week,
        earningsPerWeek: result.earnings_week_czk,
      }),
    [result]
  );
  const recommendations = useMemo(
    () =>
      generateRecommendations({
        deliveriesPerHour: results.deliveriesPerHour,
        hourlyRate: results.hourlyRate,
        earningsPerDelivery: results.earningsPerDelivery,
      }),
    [results]
  );
  const score = efficiencyScore({
    hourlyRate: results.hourlyRate,
    deliveriesPerHour: results.deliveriesPerHour,
    earningsPerDelivery: results.earningsPerDelivery,
  });
  const scoreColorKey = scoreColor(score);

  const [bench, setBench] = useState<BenchRpc | null>(null);
  const [benchSource, setBenchSource] = useState<"city_platform" | "platform" | "global" | null>(null);
  const [platformRanges, setPlatformRanges] = useState<PlatformRangeRow[]>([]);
  const [shareState, setShareState] = useState<
    { status: "idle" } | { status: "copied" } | { status: "fallback"; url: string }
  >({ status: "idle" });

  // Stable across server/client: no window check (fixes hydration)
  const canQuery = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!canQuery) return;
    (async () => {
      const city = result.city || null;
      const platform = result.platform || null;
      let data: BenchRpc | null = null;
      let source: "city_platform" | "platform" | "global" = "global";

      const tryBench = async (p_city: string | null, p_platform: string | null) => {
        const { data: r } = await supabase.rpc("get_benchmarks", {
          p_city,
          p_platform,
        });
        if (!r || !Array.isArray(r) || r.length === 0) return null;
        const row = r[0] as unknown as { n?: number; avg_hourly_rate?: number; avg_earnings_per_delivery?: number; avg_earnings_week_czk?: number };
        const n = Number(row?.n ?? 0);
        return { n, row: { ...row, n } } as { n: number; row: BenchRpc };
      };

      const cp = await tryBench(city, platform);
      if (cp && cp.n >= 20) {
        data = cp.row as BenchRpc;
        source = "city_platform";
      } else {
        const po = await tryBench(null, platform);
        if (po && po.n >= 20) {
          data = po.row as BenchRpc;
          source = "platform";
        } else {
          const gl = await tryBench(null, null);
          if (gl) {
            data = gl.row as BenchRpc;
            source = "global";
          }
        }
      }
      setBench(data);
      setBenchSource(data ? source : null);
    })();
  }, [canQuery, result.city, result.platform]);

  useEffect(() => {
    if (!canQuery) return;
    (async () => {
      const { data: r } = await supabase.rpc("get_platform_ranges", {
        p_city: result.city || null,
      });
      if (!r || !Array.isArray(r)) return;
      setPlatformRanges(
        (r as unknown as PlatformRangeRow[]).map((row) => ({
          platform: String(row.platform ?? ""),
          n: Number(row.n ?? 0),
          p25_hourly: row.p25_hourly != null ? Number(row.p25_hourly) : null,
          p50_hourly: row.p50_hourly != null ? Number(row.p50_hourly) : null,
          p75_hourly: row.p75_hourly != null ? Number(row.p75_hourly) : null,
        }))
      );
    })();
  }, [canQuery, result.city]);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? sid
          ? `${window.location.origin}/vysledek?sid=${encodeURIComponent(sid)}`
          : window.location.href
        : "";
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareState({ status: "copied" });
      setTimeout(() => setShareState({ status: "idle" }), 2000);
    } catch {
      setShareState({ status: "fallback", url });
    }
  };

  return (
    <PageShell
      title="Výsledky výpočtu"
      subtitle={
        <>
          {result.city} • {result.platform}
          <span className="w-1 h-1 bg-[#4A5568] rounded-full shrink-0" aria-hidden />
          Posledních 7 dní
        </>
      }
    >
      <div className="space-y-8">
        {/* Block 1: Efficiency score (first thing you see) */}
        <section>
          <h2 className="text-xl font-medium text-white font-heading mb-4">
            Skóre efektivity
          </h2>
          <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
            <div className="flex items-center gap-4">
              <span
                className={`text-3xl font-semibold tabular-nums ${
                  scoreColorKey === "green"
                    ? "text-emerald-400"
                    : scoreColorKey === "red"
                      ? "text-red-400"
                      : "text-white"
                }`}
              >
                {score}
              </span>
              <span className="text-[#B0B5BA] text-sm">/ 100</span>
            </div>
            <p className="text-[#8A8F94] text-xs mt-2">
              Váhy: hodinová sazba 50 %, doručení/hod 30 %, výdělek/doručení 20 %.
            </p>
          </div>
        </section>

        {/* Block 2: Summary KPIs */}
        <section>
          <h2 className="text-xl font-medium text-white font-heading mb-4">
            Přehled
          </h2>
          <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#B0B5BA] text-sm">Kč/hod</span>
              <span className="text-white font-medium text-lg">
                {formatCZK(results.hourlyRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B0B5BA] text-sm">Kč/doručení</span>
              <span className="text-white font-medium text-lg">
                {formatCZK(results.earningsPerDelivery)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B0B5BA] text-sm">Doručení/hod</span>
              <span className="text-white font-medium text-lg">
                {results.deliveriesPerHour.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#2A2F36]">
              <span className="text-[#B0B5BA] text-sm font-medium">Týdenní výdělek</span>
              <span className="text-white font-semibold text-xl">
                {formatCZK(results.weeklyEarnings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A8F94] text-xs">Měsíční odhad</span>
              <span className="text-[#B0B5BA] text-sm">
                {formatCZK(results.monthlyEstimate)}
              </span>
            </div>
          </div>
        </section>

        {/* Block 3: Benchmark comparison */}
        <section>
          <h2 className="text-xl font-medium text-white font-heading mb-4">
            Srovnání s trhem
          </h2>
          {bench && benchSource ? (
            <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5 space-y-3">
              <p className="text-[#8A8F94] text-xs">
                {benchSource === "city_platform"
                  ? `Město + platforma (n=${bench.n})`
                  : benchSource === "platform"
                    ? `Platforma (n=${bench.n})`
                    : `Celkem (n=${bench.n})`}
              </p>
              {bench.avg_hourly_rate != null && (
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="text-[#B0B5BA] text-sm">Hodinová sazba vs. průměr</span>
                  <span
                    className={`font-medium ${
                      (() => {
                        const pct = diffPercent(results.hourlyRate, bench.avg_hourly_rate);
                        if (pct == null) return "text-white";
                        if (pct > 0) return "text-emerald-400";
                        if (pct < 0) return "text-red-400";
                        return "text-[#B0B5BA]";
                      })()
                    }`}
                  >
                    {(() => {
                      const pct = diffPercent(results.hourlyRate, bench.avg_hourly_rate);
                      if (pct == null) return "—";
                      if (pct > 0) return `+${pct.toFixed(0)} % nad průměrem`;
                      if (pct < 0) return `${pct.toFixed(0)} % pod průměrem`;
                      return "Na úrovni průměru";
                    })()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5">
              <p className="text-[#B0B5BA] text-sm">Benchmark není k dispozici.</p>
            </div>
          )}
        </section>

        {/* Block 4: Exactly 3 recommendations with target deltas */}
        <section>
          <h2 className="text-xl font-medium text-white font-heading mb-4">
            Doporučení
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={index}
                className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-5"
              >
                <h3 className="text-white font-medium mb-1">{rec.title}</h3>
                <p className="text-[#B0B5BA] text-sm mb-2 leading-relaxed">{rec.description}</p>
                <p className="text-[#8A8F94] text-[11px] italic uppercase tracking-wider mb-1">
                  {rec.reason}
                </p>
                <p className="text-[#8A8F94] text-xs">Cíl: {rec.targetDelta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 5: Platform scenario cards with logos */}
        <section>
          <h2 className="text-xl font-medium text-white font-heading mb-4">
            Odhady po platformách
          </h2>
          <p className="text-[#8A8F94] text-xs mb-3">
            Dostupnost náboru je orientační.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {PLATFORM_LIST.map((plat) => {
              const range = platformRanges.find((r) => r.platform === plat);
              const n = range?.n ?? 0;
              const p25 = range?.p25_hourly ?? null;
              const p50 = range?.p50_hourly ?? null;
              const p75 = range?.p75_hourly ?? null;
              const avg = p50 ?? (p25 != null && p75 != null ? (p25 + p75) / 2 : null);
              const ind = indicatorVsUser(results.hourlyRate, p50 ?? avg, n);
              const status = getOnboardingStatus(result.city, plat);
              const logoPath = getPlatformLogoPath(plat);
              return (
                <div
                  key={plat}
                  className="bg-[#12171D] border border-[#2A2F36] rounded-lg p-4 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {logoPath ? (
                      <span className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-[#2A2F36]">
                        <Image
                          src={logoPath}
                          alt=""
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </span>
                    ) : null}
                    <span className="text-white font-medium">{plat}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                        status === "Nabírá"
                          ? "bg-emerald-900/40 text-emerald-300"
                          : status === "Omezeně"
                            ? "bg-amber-900/40 text-amber-300"
                            : status === "Pozastaveno"
                              ? "bg-red-900/40 text-red-300"
                              : status === "Waitlist"
                                ? "bg-blue-900/40 text-blue-300"
                                : "bg-[#2A2F36] text-[#8A8F94]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {n >= 50 && p25 != null && p75 != null ? (
                      <span className="text-[#B0B5BA] text-sm">
                        {formatCZK(p25)} – {formatCZK(p75)}/hod
                      </span>
                    ) : avg != null ? (
                      <span className="text-[#B0B5BA] text-sm">
                        {formatCZK(avg)}/hod {n < 20 && <span className="text-[#8A8F94]">(nízká jistota)</span>}
                      </span>
                    ) : (
                      <span className="text-[#8A8F94] text-sm">—</span>
                    )}
                    {ind === "green" && (
                      <span className="text-emerald-400 font-medium text-sm" aria-label="Nad průměrem">↑</span>
                    )}
                    {ind === "red" && (
                      <span className="text-red-400 font-medium text-sm" aria-label="Pod průměrem">↓</span>
                    )}
                    {ind === "neutral" && (
                      <span className="text-[#8A8F94] text-sm" aria-label="Na úrovni">−</span>
                    )}
                    {ind === "gray" && (
                      <span className="text-[#4A5568] text-sm" aria-hidden>−</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer: Zpět + Sdílet */}
        <div className="mt-8 pt-6 border-t border-[#2A2F36] flex flex-col sm:flex-row gap-3">
          <Link
            href="/kalkulacka"
            className="h-[48px] flex-1 flex items-center justify-center gap-2 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Zpět
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="h-[48px] flex-1 min-w-[140px] flex items-center justify-center gap-2 border border-[#2A2F36] bg-[#12171D] text-white font-medium rounded-lg hover:bg-[#1A1F26] transition-all active:scale-[0.99]"
          >
            {shareState.status === "copied" ? "Zkopírováno" : "Sdílet výsledek"}
          </button>
        </div>
        {shareState.status === "fallback" && (
          <div className="mt-2">
            <label className="block text-xs text-[#B0B5BA] mb-1">Zkopíruj odkaz</label>
            <input
              readOnly
              value={shareState.url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full px-3 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white text-sm"
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
