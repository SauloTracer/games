import adsData from "@/src/assets/ads.json";
import type { AdItem } from "@/lib/types";

export const ads = adsData as AdItem[];

export function pickRandomAds(count: number, excludeId?: number) {
  const pool = ads.filter((ad) => ad.id !== excludeId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
