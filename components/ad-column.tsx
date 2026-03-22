"use client";

import { useEffect, useState } from "react";
import { AdCard } from "@/components/ad-card";
import { ads, pickRandomAds } from "@/lib/ads";

export function AdColumn() {
  const [items, setItems] = useState(() => ads.slice(0, 3));

  useEffect(() => {
    setItems(pickRandomAds(3));
    const interval = window.setInterval(() => {
      setItems(pickRandomAds(3));
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside className="sticky top-24 hidden h-fit w-[280px] shrink-0 xl:block">
      <div className="flex flex-col gap-4">
        {items.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </aside>
  );
}
