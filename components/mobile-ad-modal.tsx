"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdCard } from "@/components/ad-card";
import { useLanguage } from "@/components/language-provider";
import { ads, pickRandomAds } from "@/lib/ads";

export function MobileAdModal() {
  const [open, setOpen] = useState(false);
  const [ad, setAd] = useState(() => ads[0] ?? null);
  const { t } = useLanguage();

  useEffect(() => {
    setAd(pickRandomAds(1)[0] ?? null);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setOpen(true), 2000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !ad) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 md:hidden">
      <div className="relative w-full max-w-sm rounded-[1.75rem] bg-white p-3 shadow-panel">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-stone-700"
          aria-label={t("ads.close")}
        >
          <X size={18} />
        </button>
        <AdCard ad={ad} />
      </div>
    </div>
  );
}
