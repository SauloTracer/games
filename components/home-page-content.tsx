"use client";

import type { Article } from "@/lib/articles";
import { ArticlesSection } from "@/components/home/articles-section";
import { ContinueStrip } from "@/components/home/continue-strip";
import { FindsSection } from "@/components/home/finds-section";
import { GamesSection } from "@/components/home/games-section";
import { HomeHero } from "@/components/home/hero";

export function HomePageContent({ articles }: { articles: Article[] }) {
  return (
    <div className="flex w-full flex-col font-sans text-ink">
      <HomeHero />
      <ContinueStrip />
      <GamesSection />
      <ArticlesSection articles={articles} />
      <FindsSection />
    </div>
  );
}
