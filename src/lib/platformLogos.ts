/**
 * Official brand logos (Clearbit Logo API – logos from company domains, own colors).
 * Fallback to local path if remote fails (e.g. adblock).
 */
const CLEARBIT = "https://logo.clearbit.com";

export const PLATFORM_LOGO: Record<string, string> = {
  Wolt: `${CLEARBIT}/wolt.com`,
  Bolt: `${CLEARBIT}/bolt.eu`,
  Foodora: `${CLEARBIT}/foodora.com`,
  Rohlík: `${CLEARBIT}/rohlik.cz`,
  Košík: `${CLEARBIT}/kosik.cz`,
  DPD: `${CLEARBIT}/dpd.com`,
  Zásilkovna: `${CLEARBIT}/zasilkovna.cz`,
};

export function getPlatformLogoPath(platform: string): string | undefined {
  return PLATFORM_LOGO[platform];
}
