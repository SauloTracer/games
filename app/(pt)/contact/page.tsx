import { ContactBody } from "@/components/pages/contact";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("contact", "pt");

export default function ContactPage() {
  return <ContactBody language="pt" />;
}
