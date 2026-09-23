import type { Metadata } from "next";
import { urlMetadata } from "@/lib/site";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta LucroMEI — 14 dias grátis, sem cartão.",
  ...urlMetadata("/cadastro"),
  robots: { index: false, follow: false },
};

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
