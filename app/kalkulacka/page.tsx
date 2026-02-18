"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import PageShell from "@/components/PageShell";
import { calculateAll } from "@/lib/calc";
import { supabase } from "@/lib/supabaseClient";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, "E-mail je povinný")
      .email("Zadejte platnou e-mailovou adresu"),
    city: z.string().min(1, "Město je povinné"),
    cityOther: z.string().optional(),
    platform: z.string().min(1, "Platforma je povinná"),
    platformOther: z.string().optional(),
    hoursPerWeek: z
      .number({ message: "Hodiny musí být číslo" })
      .min(1, "Odpracované hodiny musí být alespoň 1")
      .max(100, "Odpracované hodiny mohou být max. 100"),
    deliveriesPerWeek: z
      .number({ message: "Počet doručení musí být číslo" })
      .int("Počet doručení musí být celé číslo")
      .min(1, "Počet doručení musí být alespoň 1")
      .max(2000, "Počet doručení může být max. 2000"),
    earningsPerWeek: z
      .number({ message: "Výdělek musí být číslo" })
      .min(1, "Výdělek musí být alespoň 1 Kč")
      .max(200000, "Výdělek může být max. 200 000 Kč"),
    consentToPrivacy: z.boolean(),
  })
  .refine((data) => data.consentToPrivacy === true, {
    message: "Pro odeslání musíte souhlasit se zpracováním osobních údajů.",
    path: ["consentToPrivacy"],
  })
  .refine(
    (data) => {
      if (data.city === "Jiné") {
        return data.cityOther && data.cityOther.trim().length > 0;
      }
      return true;
    },
    {
      message: "Zadejte název města",
      path: ["cityOther"],
    }
  )
  .refine(
    (data) => {
      if (data.platform === "Jiné") {
        return data.platformOther && data.platformOther.trim().length > 0;
      }
      return true;
    },
    {
      message: "Zadejte název platformy",
      path: ["platformOther"],
    }
  );

type FormData = z.infer<typeof formSchema>;

const CITIES = ["Praha", "Brno", "Ostrava", "Plzeň", "Olomouc", "Jiné"] as const;
const PLATFORMS = [
  "Wolt",
  "Bolt",
  "Foodora",
  "Rohlík",
  "Košík",
  "DPD",
  "Zásilkovna",
  "Jiné",
] as const;

export default function KalkulackaPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (website.trim()) return;

    try {
      const validated = formSchema.parse({
        ...formData,
        email: formData.email ?? "",
        hoursPerWeek:
          formData.hoursPerWeek === undefined ? undefined : Number(formData.hoursPerWeek),
        deliveriesPerWeek:
          formData.deliveriesPerWeek === undefined
            ? undefined
            : Number(formData.deliveriesPerWeek),
        earningsPerWeek:
          formData.earningsPerWeek === undefined ? undefined : Number(formData.earningsPerWeek),
        consentToPrivacy: formData.consentToPrivacy === true,
      });

      const cityValue =
        validated.city === "Jiné" ? validated.cityOther?.trim() || "" : validated.city;
      const platformValue =
        validated.platform === "Jiné"
          ? validated.platformOther?.trim() || ""
          : validated.platform;

      const metrics = calculateAll({
        hoursPerWeek: validated.hoursPerWeek,
        deliveriesPerWeek: validated.deliveriesPerWeek,
        earningsPerWeek: validated.earningsPerWeek,
      });

      const fallbackParams = new URLSearchParams();
      fallbackParams.set("h", validated.hoursPerWeek.toString());
      fallbackParams.set("d", validated.deliveriesPerWeek.toString());
      fallbackParams.set("e", validated.earningsPerWeek.toString());
      if (cityValue) fallbackParams.set("c", cityValue);
      if (platformValue) fallbackParams.set("p", platformValue);

      let profileId: string | null = null;
      const { data: profileData } = await supabase.rpc("upsert_profile", {
        p_email: validated.email.trim().toLowerCase(),
        p_consent_at: new Date().toISOString(),
        p_city: cityValue || null,
        p_platform: platformValue || null,
      });
      const rawId = Array.isArray(profileData) ? profileData[0] : profileData;
      if (rawId != null) profileId = String(rawId);

      const insertPayload = {
        profile_id: profileId || undefined,
        city: cityValue,
        platform: platformValue,
        hours_week: validated.hoursPerWeek,
        deliveries_week: validated.deliveriesPerWeek,
        earnings_week_czk: validated.earningsPerWeek,
        hourly_rate: metrics.hourlyRate,
        earnings_per_delivery: metrics.earningsPerDelivery,
      };
      const { data: subData } = await supabase
        .from("submissions")
        .insert(insertPayload)
        .select("share_id")
        .single();

      const sid = subData?.share_id != null ? String(subData.share_id) : null;
      if (sid) {
        router.push(`/vysledek?sid=${encodeURIComponent(sid)}`);
      } else {
        router.push(`/vysledek?${fallbackParams.toString()}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        const maybeIssues = (error as unknown as { issues?: unknown; errors?: unknown }).issues;
        const maybeErrors = (error as unknown as { issues?: unknown; errors?: unknown }).errors;
        const issues = Array.isArray(maybeIssues)
          ? maybeIssues
          : Array.isArray(maybeErrors)
            ? maybeErrors
            : [];

        issues.forEach((err: { path?: string[]; message?: string }) => {
          const path =
            Array.isArray(err?.path) && err.path.length > 0 ? err.path.join(".") : "_form";
          const message = typeof err?.message === "string" ? err.message : "Neplatné hodnoty";
          fieldErrors[path] = message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ _form: "Nepodařilo se odeslat. Zkuste to znovu." });
      }
    }
  };

  const showCityOther = formData.city === "Jiné";
  const showPlatformOther = formData.platform === "Jiné";

  return (
    <PageShell
      title="Kalkulačka výdělků kurýrů"
      subtitle="Vypočítejte si svůj výdělek a porovnejte se s ostatními"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Honeypot: leave empty; bots that fill it are blocked silently */}
        <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Web</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* E-mail */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white mb-2"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.email}</p>
          )}
        </div>

        {/* Město */}
        <div className="relative">
          <label
            htmlFor="city"
            className="block text-sm font-medium text-white mb-2"
          >
            Město
          </label>
          <select
            id="city"
            value={formData.city || ""}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            className="w-full h-[42px] px-4 pr-10 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all cursor-pointer"
          >
            <option value="">Vyberte město</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <svg className="absolute right-4 bottom-3 w-4 h-4 text-[#8A8F94] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          {errors.city && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.city}</p>
          )}
        </div>

        {showCityOther && (
          <div>
            <label
              htmlFor="cityOther"
              className="block text-sm font-medium text-white mb-2"
            >
              Zadejte město
            </label>
            <input
              type="text"
              id="cityOther"
              value={formData.cityOther || ""}
              onChange={(e) =>
                setFormData({ ...formData, cityOther: e.target.value })
              }
              className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
            />
            {errors.cityOther && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.cityOther}</p>
            )}
          </div>
        )}

        {/* Platforma */}
        <div className="relative">
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-white mb-2"
          >
            Platforma
          </label>
          <select
            id="platform"
            value={formData.platform || ""}
            onChange={(e) =>
              setFormData({ ...formData, platform: e.target.value })
            }
            className="w-full h-[42px] px-4 pr-10 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all cursor-pointer"
          >
            <option value="">Vyberte platformu</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <svg className="absolute right-4 bottom-3 w-4 h-4 text-[#8A8F94] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          {errors.platform && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.platform}</p>
          )}
        </div>

        {showPlatformOther && (
          <div>
            <label
              htmlFor="platformOther"
              className="block text-sm font-medium text-white mb-2"
            >
              Zadejte platformu
            </label>
            <input
              type="text"
              id="platformOther"
              value={formData.platformOther || ""}
              onChange={(e) =>
                setFormData({ ...formData, platformOther: e.target.value })
              }
              className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
            />
            {errors.platformOther && (
              <p className="mt-1 text-sm text-[#F87171]">
                {errors.platformOther}
              </p>
            )}
          </div>
        )}

        {/* Odpracované hodiny */}
        <div>
          <label
            htmlFor="hoursPerWeek"
            className="block text-sm font-medium text-white mb-2"
          >
            Odpracované hodiny za týden
          </label>
          <input
            type="number"
            id="hoursPerWeek"
            step="any"
            min="0"
            value={formData.hoursPerWeek || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                hoursPerWeek: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
          />
          {errors.hoursPerWeek && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.hoursPerWeek}</p>
          )}
        </div>

        {/* Počet doručení */}
        <div>
          <label
            htmlFor="deliveriesPerWeek"
            className="block text-sm font-medium text-white mb-2"
          >
            Počet doručení za týden
          </label>
          <input
            type="number"
            id="deliveriesPerWeek"
            min="1"
            value={formData.deliveriesPerWeek || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                deliveriesPerWeek: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
          />
          {errors.deliveriesPerWeek && (
            <p className="mt-1 text-sm text-[#F87171]">
              {errors.deliveriesPerWeek}
            </p>
          )}
        </div>

        {/* Výdělek */}
        <div>
          <label
            htmlFor="earningsPerWeek"
            className="block text-sm font-medium text-white mb-2"
          >
            Výdělek za týden (CZK)
          </label>
          <input
            type="number"
            id="earningsPerWeek"
            min="1"
            value={formData.earningsPerWeek || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                earningsPerWeek: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            className="w-full h-[42px] px-4 bg-[#12171D] border border-[#2A2F36] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] transition-all"
          />
          {errors.earningsPerWeek && (
            <p className="mt-1 text-sm text-[#F87171]">
              {errors.earningsPerWeek}
            </p>
          )}
        </div>

        {/* Souhlas se zpracováním osobních údajů */}
        <div className="flex flex-col gap-1 pt-2">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentToPrivacy"
              checked={formData.consentToPrivacy ?? false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consentToPrivacy: e.target.checked,
                })
              }
              className="mt-1 w-[18px] h-[18px] rounded border-[#2A2F36] bg-[#12171D] accent-[#4A5568] focus:ring-2 focus:ring-[#4A5568] focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="consentToPrivacy"
              className="text-[13px] text-[#B0B5BA] leading-normal cursor-pointer"
            >
              Odesláním formuláře souhlasím se zpracováním osobních údajů dle{" "}
              <a
                href="/privacy"
                className="text-[#E5E7EB] underline underline-offset-4 decoration-[#2A2F36] hover:text-white hover:decoration-white transition-all"
              >
                Zásad ochrany osobních údajů
              </a>
              .
            </label>
          </div>
          <p className="text-[12px] text-[#8A8F94] mt-1">
            Účel: zobrazení výsledků, uložení historie a tvorba anonymních tržních průměrů.
          </p>
          {errors.consentToPrivacy && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.consentToPrivacy}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full h-[48px] bg-white text-[#12171D] font-medium text-base rounded-lg hover:bg-[#E5E7EB] transition-colors duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A1F26]"
        >
          Vypočítat
        </button>
      </form>
    </PageShell>
  );
}
