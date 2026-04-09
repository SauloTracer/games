"use client";

import { useLanguage } from "@/components/language-provider";

const contactEmail = "saulo.tracer+puzzled@gmail.com";

export function ContactPageContent() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-white/60 bg-white/90 px-6 py-12 shadow-panel md:px-10">
      <div className="space-y-5">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-700">Puzzled</p>
        <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-5xl">{t("contact.title")}</h1>
        <p className="text-lg leading-8 text-stone-700">{t("contact.description")}</p>
      </div>

      <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-2xl font-black text-stone-950">{t("contact.emailTitle")}</h2>
        <p className="leading-8 text-stone-700">{t("contact.emailBody")}</p>
        <a href={`mailto:${contactEmail}`} className="break-all text-lg font-black text-amber-800 hover:text-amber-950">
          {contactEmail}
        </a>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-stone-950">{t("contact.topicsTitle")}</h2>
        <ul className="list-disc space-y-2 pl-6 leading-8 text-stone-700">
          <li>{t("contact.topicBug")}</li>
          <li>{t("contact.topicContent")}</li>
          <li>{t("contact.topicPrivacy")}</li>
          <li>{t("contact.topicBusiness")}</li>
        </ul>
      </section>
    </section>
  );
}
