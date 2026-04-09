import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact-page-content";

export const metadata: Metadata = {
  title: "Contato | Puzzled",
  description:
    "Entre em contato com o Puzzled para enviar dúvidas, relatar problemas, sugerir artigos ou tratar de assuntos relacionados ao site.",
  alternates: {
    canonical: "https://puzzled.com.br/contact",
  },
  openGraph: {
    title: "Contato | Puzzled",
    description: "Fale com o Puzzled pelo email saulo.tracer+puzzled@gmail.com.",
    url: "https://puzzled.com.br/contact",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
