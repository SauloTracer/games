import type { ReactNode } from "react";
import { RootShell } from "@/components/root-shell";
import { buildBaseMetadata } from "@/lib/page-meta";

// Layout raiz das páginas em português (sem prefixo na URL).
export const metadata = buildBaseMetadata("pt");

export default function PortugueseLayout({ children }: { children: ReactNode }) {
  return <RootShell language="pt">{children}</RootShell>;
}
