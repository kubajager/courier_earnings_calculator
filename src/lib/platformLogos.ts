/**
 * Logo path (in public/) per platform key. Replace files in public/logos/ with real brand logos.
 */
export const PLATFORM_LOGO: Record<string, string> = {
  Wolt: "/logos/wolt.svg",
  Bolt: "/logos/bolt.svg",
  Foodora: "/logos/foodora.svg",
  Rohlík: "/logos/rohlik.svg",
  Košík: "/logos/kosik.svg",
  DPD: "/logos/dpd.svg",
  Zásilkovna: "/logos/zasilkovna.svg",
};

export function getPlatformLogoPath(platform: string): string | undefined {
  return PLATFORM_LOGO[platform];
}
