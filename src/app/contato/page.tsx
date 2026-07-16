import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o LucroMEI — suporte, assinatura, privacidade, feedback e primeiros 20 testes.",
};

export default function ContatoPage() {
  return (
    <LegalShell
      title="Contato"
      subtitle="Dúvidas, suporte, assinatura, privacidade ou feedback dos primeiros 20 testes."
    >
      <ContactForm />
      <p className="text-xs text-slate-500">
        Tempo de resposta típico na fase de validação: até alguns dias úteis. Pedidos
        de exclusão de dados (LGPD) têm prioridade.
      </p>
    </LegalShell>
  );
}
