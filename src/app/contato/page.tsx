import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { ContactForm } from "@/components/contact-form";
import { urlMetadata } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o LucroMEI — suporte, assinatura, privacidade e feedback.",
  ...urlMetadata("/contato"),
};

export default function ContatoPage() {
  return (
    <LegalShell
      title="Contato"
      subtitle="Dúvidas, suporte, assinatura, privacidade ou feedback."
    >
      <ContactForm />
      <p className="text-xs text-slate-500">
        Tempo de resposta típico: até alguns dias úteis. Pedidos de exclusão de
        dados (LGPD) têm prioridade.
      </p>
    </LegalShell>
  );
}
