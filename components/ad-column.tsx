"use client";

import { useMemo } from "react";
import { AdCard } from "@/components/ad-card";
import { pickRandomAds } from "@/lib/ads";

export function AdColumn() {
  const ads = useMemo(() => pickRandomAds(3), []);

  return (
    <aside className="sticky top-24 hidden h-fit w-[280px] shrink-0 xl:block">
      <div className="flex flex-col gap-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </aside>
  );
}
