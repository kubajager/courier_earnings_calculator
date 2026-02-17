"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { calculateAll, formatCZK } from "@/lib/calc";
import { generateRecommendations } from "@/lib/recommendations";

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

        {/* Back link */}
        <div className="pt-4 border-t border-[#2A2F36]">
          <Link
            href="/kalkulacka"
            className="inline-block px-6 py-3 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
          >
            Zpět
          </Link>
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
