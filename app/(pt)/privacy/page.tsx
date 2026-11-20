import { PrivacyBody } from "@/components/pages/privacy";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("privacy", "pt");

export default function PrivacyPage() {
  return <PrivacyBody language="pt" />;
}
