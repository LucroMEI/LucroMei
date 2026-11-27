"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/cta-link";

/** Barra fixa no rodapé do celular, aparece depois que o botão do topo sai da tela. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 md:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <CtaLink
        local="barra_fixa"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-mustard px-5 py-3 text-base font-bold text-white shadow-md"
      >
        Testar grátis por 14 dias
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </CtaLink>
      <p className="mt-1.5 text-center text-[11px] font-medium text-slate-500">
        Sem cartão · só e-mail e senha
      </p>
    </div>
  );
}
