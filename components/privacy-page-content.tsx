"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function PrivacyPageContent() {
  const { t } = useLanguage();

  return (
    <article className="mx-auto max-w-4xl space-y-10 rounded-3xl border border-white/60 bg-white/90 px-6 py-12 shadow-panel md:px-10">
      <header className="space-y-5">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-700">Puzzled</p>
        <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-5xl">{t("privacy.title")}</h1>
        <p className="text-lg leading-8 text-stone-700">{t("privacy.description")}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("privacy.localTitle")}</h2>
        <p className="leading-8 text-stone-700">{t("privacy.localBody")}</p>
        <ul className="list-disc space-y-2 pl-6 leading-8 text-stone-700">
          <li>{t("privacy.localItemLanguage")}</li>
          <li>{t("privacy.localItemSudoku")}</li>
          <li>{t("privacy.localItemSnake")}</li>
          <li>{t("privacy.localItemSlide")}</li>
          <li>{t("privacy.localItemTetris")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("privacy.noAccountTitle")}</h2>
        <p className="leading-8 text-stone-700">{t("privacy.noAccountBody")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("privacy.controlTitle")}</h2>
        <p className="leading-8 text-stone-700">{t("privacy.controlBody")}</p>
      </section>

      <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-2xl font-black text-stone-950">{t("privacy.changesTitle")}</h2>
        <p className="leading-8 text-stone-700">{t("privacy.changesBody")}</p>
        <Link href="/contact" className="inline-flex rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white">
          {t("privacy.contactLink")}
        </Link>
      </section>
    </article>
  );
}
