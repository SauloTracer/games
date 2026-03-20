"use client";

import Image from "next/image";
import type { AdItem } from "@/lib/types";

type Props = {
  ad: AdItem;
};

export function AdCard({ ad }: Props) {
  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-amber-100 bg-white shadow-panel transition hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] w-full bg-stone-100">
        <Image
          src={ad.image}
          alt={ad.title}
          fill
          sizes="280px"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
          Recommendation
        </p>
        <h3 className="mt-2 text-sm font-semibold leading-6 text-stone-800">
          {ad.title}
        </h3>
      </div>
    </a>
  );
}
