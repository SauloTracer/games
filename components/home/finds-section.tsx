"use client";

import { useEffect, useState } from "react";
import { AdCard } from "@/components/ad-card";
import { useLanguage } from "@/components/language-provider";
import { ads, pickRandomAds } from "@/lib/ads";

const COUNT = 4;

export function FindsSection() {
  const { t } = useLanguage();
  // Primeiros anúncios no HTML do servidor; sorteio após montar, para não quebrar a hidratação.
  const [items, setItems] = useState(() => ads.slice(0, COUNT));

  useEffect(() => {
    setItems(pickRandomAds(COUNT));
  }, []);

  if (!items.length) return null;

  return (
    <section aria-labelledby="achados" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-12 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="achados" className="font-display text-2xl font-extrabold text-ink md:text-[28px]">
          {t("home.findsTitle")}
        </h2>
        <span className="text-[13px] text-subtle">{t("home.affiliateNote")}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}
