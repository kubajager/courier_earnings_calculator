"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function PrivacyPage() {
  return (
    <PageShell
      title="Zásady ochrany osobních údajů"
      subtitle="Kalkulačka výdělků kurýrů"
    >
      <div className="space-y-8 text-sm text-[#B0B5BA]">
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Úvod</h2>
          <p>
            Tato stránka popisuje, jak pracujeme s údaji, které zadáváte do
            aplikace <strong className="text-white">Kalkulačka výdělků kurýrů</strong>.
            Snažíme se sbírat jen minimum údajů potřebných k výpočtu a
            anonymnímu benchmarku.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">
            Shromažďovaná data
          </h2>
          <p>V rámci kalkulačky shromažďujeme tyto údaje:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>e‑mail (povinný pro odeslání formuláře),</li>
            <li>město,</li>
            <li>platformu, na které doručujete (např. Wolt, Bolt, atd.),</li>
            <li>odpracované hodiny za týden,</li>
            <li>počet doručení za týden,</li>
            <li>výdělek za týden v Kč.</li>
          </ul>
          <p>
            Z těchto údajů dále dopočítáváme metriky:
            hodinová sazba, výdělek na doručení a měsíční odhad výdělku.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Účel</h2>
          <p>Údaje používáme k těmto účelům:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>zobrazení vašeho osobního výpočtu (sazba, výdělek, odhad),</li>
            <li>
              vytváření anonymních průměrů pro benchmark (globální, podle
              města a platformy),
            </li>
            <li>zlepšování kalkulačky na základě agregovaných statistik.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Použití</h2>
          <p>
            Jednotlivé záznamy (váš konkrétní výpočet) nepoužíváme k
            individuálnímu profilování ani je nesdílíme s třetími stranami.
            Benchmarky, které vidíte na stránce s výsledky, jsou{" "}
            <strong className="text-white">agregované průměry</strong> (např.
            průměrná hodinová sazba v daném městě nebo na dané platformě).
          </p>
          <p>
            Tyto agregace jsou zobrazovány pouze v podobě souhrnných metrik
            a minimálních počtů (např. až od 20 příspěvků pro město/platformu).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Uchovávání</h2>
          <p>
            Data ukládáme do databáze{" "}
            <strong className="text-white">Supabase (Postgres)</strong>, která
            běží na infrastruktuře poskytovatele Supabase. Přístup k databázi
            je omezen na provozovatele této aplikace pomocí API klíčů.
          </p>
          <p>
            Údaje uchováváme po dobu nezbytnou pro provoz kalkulačky a
            tvorbu benchmarků. Pokud požádáte o výmaz, pokusíme se váš
            záznam podle dostupných identifikátorů (např. e‑mailu) vyhledat a
            smazat.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Vaše práva</h2>
          <p>V souvislosti se zpracováním údajů máte zejména právo na:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>informace o tom, jaká data o vás evidujeme,</li>
            <li>opravu nepřesných nebo neaktuálních údajů,</li>
            <li>výmaz údajů, pokud už nechcete, abychom je dále uchovávali.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">
            Kontaktní informace
          </h2>
          <p>
            <strong className="text-white">
              Kontakt pro soukromí / výmaz údajů:
            </strong>{" "}
            <span className="text-[#E5E7EB]">privacy@EXAMPLE.com</span>{" "}
            (napište nám, pokud chcete zjistit, jaká data o vás evidujeme,
            nebo požádat o jejich smazání).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white font-heading">Změny</h2>
          <p>
            Tyto zásady můžeme občas upravit, například při změně způsobu
            sběru dat nebo přidání nových funkcí kalkulačky. Aktuální verze
            zásad je vždy dostupná na této stránce.
          </p>
        </section>

        <div className="pt-4 border-t border-[#2A2F36]">
          <Link
            href="/kalkulacka"
            className="inline-block px-6 py-3 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
          >
            Zpět na kalkulačku
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

