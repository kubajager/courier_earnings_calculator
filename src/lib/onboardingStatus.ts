/**
 * MVP: orientační stav náboru podle města a platformy.
 * "Dostupnost náboru je orientační."
 */

export type OnboardingStatus =
  | "Nabírá"
  | "Omezeně"
  | "Pozastaveno"
  | "Waitlist"
  | "Neznámé";

const PLATFORMS = [
  "Wolt",
  "Bolt",
  "Foodora",
  "Rohlík",
  "Košík",
  "DPD",
  "Zásilkovna",
] as const;

/** Placeholder mapping: Praha sample for all platforms. */
const PRAHA_MAP: Record<string, OnboardingStatus> = {
  Wolt: "Nabírá",
  Bolt: "Omezeně",
  Foodora: "Nabírá",
  Rohlík: "Nabírá",
  Košík: "Waitlist",
  DPD: "Nabírá",
  Zásilkovna: "Omezeně",
};

/** City -> platform -> status. Other cities default to Neznámé. */
const STATUS_MAP: Record<string, Record<string, OnboardingStatus>> = {
  Praha: PRAHA_MAP,
};

export function getOnboardingStatus(
  city: string | null | undefined,
  platform: string | null | undefined
): OnboardingStatus {
  if (!platform || !city) return "Neznámé";
  const normalizedCity = city.trim();
  const normalizedPlatform = platform.trim();
  const byCity = STATUS_MAP[normalizedCity];
  if (!byCity) return "Neznámé";
  return byCity[normalizedPlatform] ?? "Neznámé";
}

export const PLATFORM_LIST = PLATFORMS as readonly string[];
