"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import type { AdItem } from "@/lib/types";

type Props = {
  ad: AdItem;
};

/** Cartão horizontal compacto de recomendação (link de afiliado). */
export function AdCard({ ad }: Props) {
  const { t } = useLanguage();

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="sponsored noreferrer noopener"
      className="group flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 transition hover:border-line-strong hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-chip">
        <Image src={ad.image} alt="" fill sizes="72px" className="object-cover" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-subtle">{t("ads.affiliate")}</span>
        <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink group-hover:text-ink-soft">
          {ad.title}
        </span>
      </span>
    </a>
  );
}
