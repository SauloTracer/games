"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

type AboutList = keyof typeof listKeys;

const listKeys = {
  games: "about.games.items",
  purpose: "about.purpose.items",
  audience: "about.audience.items",
} as const;

function translatedList(messages: ReturnType<typeof useLanguage>["messages"], list: AboutList) {
  const [section, group, field] = listKeys[list].split(".");
  const value = messages[section as "about"]?.[group as keyof typeof messages.about];

  if (value && typeof value === "object" && field in value) {
    const items = (value as { items?: unknown }).items;
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : [];
  }

  return [];
}

export function AboutPageContent() {
  const { messages, t } = useLanguage();

  return (
    <section className="mx-auto max-w-4xl space-y-12 rounded-3xl border border-white/60 bg-white/90 px-6 py-12 shadow-panel md:px-10">
      <div className="space-y-5">
        <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-5xl">{t("about.title")}</h1>
        <p className="text-lg leading-8 text-stone-700">{t("about.intro")}</p>
        <p className="leading-8 text-stone-700">{t("about.introDetail")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("about.games.title")}</h2>
        <p className="leading-8 text-stone-700">{t("about.games.body")}</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {translatedList(messages, "games").map((item) => (
            <li key={item} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-stone-800">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("about.purpose.title")}</h2>
        <p className="leading-8 text-stone-700">{t("about.purpose.body")}</p>
        <ul className="list-disc space-y-2 pl-6 leading-8 text-stone-700">
          {translatedList(messages, "purpose").map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("about.audience.title")}</h2>
        <ul className="list-disc space-y-2 pl-6 leading-8 text-stone-700">
          {translatedList(messages, "audience").map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("about.vision.title")}</h2>
        <p className="leading-8 text-stone-700">{t("about.vision.body")}</p>
      </section>
    </section>
  );
}
