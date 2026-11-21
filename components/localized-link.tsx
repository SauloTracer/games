"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "@/components/language-provider";
import { localizePath } from "@/lib/i18n";

/**
 * Substituto do `next/link` para links internos: acrescenta o prefixo do idioma atual
 * ("/sudoku" vira "/en/sudoku" em inglês). Links externos e âncoras passam sem mudança.
 */
export function LocalizedLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { language } = useLanguage();
  const target = typeof href === "string" ? localizePath(href, language) : href;
  return <NextLink href={target} {...props} />;
}
