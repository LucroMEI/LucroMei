"use client";

import Link from "next/link";
import type { ReactNode } from "react";

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag(...args);
}

/** Link para /cadastro que marca no GA4 qual botão foi clicado (cta_cadastro). */
export function CtaLink({
  local,
  className,
  children,
}: {
  local: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href="/cadastro"
      className={className}
      onClick={() => {
        try {
          gtag("event", "cta_cadastro", { local });
        } catch {
          /* ignore */
        }
      }}
    >
      {children}
    </Link>
  );
}
