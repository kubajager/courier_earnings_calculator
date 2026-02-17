"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import PageShell from "@/components/PageShell";

const formSchema = z
  .object({
    city: z.string().min(1, "Město je povinné"),
    cityOther: z.string().optional(),
    platform: z.string().min(1, "Platforma je povinná"),
    platformOther: z.string().optional(),
    hoursPerWeek: z
      .number({ message: "Hodiny musí být číslo" })
      .positive("Hodiny musí být větší než 0"),
    deliveriesPerWeek: z
      .number({ message: "Počet doručení musí být číslo" })
      .positive("Počet doručení musí být větší než 0"),
    earningsPerWeek: z
      .number({ message: "Výdělek musí být číslo" })
      .positive("Výdělek musí být větší než 0"),
    contributeToBenchmark: z.boolean(),
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
  const [formData, setFormData] = useState<Partial<FormData>>({
    contributeToBenchmark: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = formSchema.parse({
        ...formData,
        hoursPerWeek:
          formData.hoursPerWeek === undefined ? undefined : Number(formData.hoursPerWeek),
        deliveriesPerWeek:
          formData.deliveriesPerWeek === undefined
            ? undefined
            : Number(formData.deliveriesPerWeek),
        earningsPerWeek:
          formData.earningsPerWeek === undefined ? undefined : Number(formData.earningsPerWeek),
      });

      // Build query params (compact, only essential fields)
      const params = new URLSearchParams();
      params.set("h", validated.hoursPerWeek.toString());
      params.set("d", validated.deliveriesPerWeek.toString());
      params.set("e", validated.earningsPerWeek.toString());
      if (validated.city !== "Jiné") {
        params.set("c", validated.city);
      } else if (validated.cityOther) {
        params.set("c", validated.cityOther);
      }
      if (validated.platform !== "Jiné") {
        params.set("p", validated.platform);
      } else if (validated.platformOther) {
        params.set("p", validated.platformOther);
      }
      if (validated.contributeToBenchmark) {
        params.set("b", "1");
      }

      router.push(`/vysledek?${params.toString()}`);
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

        issues.forEach((err: any) => {
          const path =
            Array.isArray(err?.path) && err.path.length > 0 ? err.path.join(".") : "_form";
          const message = typeof err?.message === "string" ? err.message : "Neplatné hodnoty";
          fieldErrors[path] = message;
        });
        setErrors(fieldErrors);
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
        {/* Město */}
        <div>
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
            className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
          >
            <option value="">Vyberte město</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-400">{errors.city}</p>
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
              className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
            />
            {errors.cityOther && (
              <p className="mt-1 text-sm text-red-400">{errors.cityOther}</p>
            )}
          </div>
        )}

        {/* Platforma */}
        <div>
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
            className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
          >
            <option value="">Vyberte platformu</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-400">{errors.platform}</p>
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
              className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
            />
            {errors.platformOther && (
              <p className="mt-1 text-sm text-red-400">
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
            className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
          />
          {errors.hoursPerWeek && (
            <p className="mt-1 text-sm text-red-400">{errors.hoursPerWeek}</p>
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
            className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
          />
          {errors.deliveriesPerWeek && (
            <p className="mt-1 text-sm text-red-400">
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
            className="w-full px-4 py-2 bg-[#12171D] border border-[#2A2F36] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5568] focus:border-transparent"
          />
          {errors.earningsPerWeek && (
            <p className="mt-1 text-sm text-red-400">
              {errors.earningsPerWeek}
            </p>
          )}
        </div>

        {/* Toggle pro benchmark */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="contributeToBenchmark"
            checked={formData.contributeToBenchmark ?? true}
            onChange={(e) =>
              setFormData({
                ...formData,
                contributeToBenchmark: e.target.checked,
              })
            }
            className="w-5 h-5 rounded border-[#2A2F36] bg-[#12171D] text-[#4A5568] focus:ring-2 focus:ring-[#4A5568]"
          />
          <label
            htmlFor="contributeToBenchmark"
            className="text-sm text-[#B0B5BA] cursor-pointer"
          >
            Chci přispět do anonymního benchmarku
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-white text-[#12171D] font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1A1F26]"
        >
          Vypočítat
        </button>
      </form>
    </PageShell>
  );
}
