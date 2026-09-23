import type { Metadata } from "next";
import { urlMetadata } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta LucroMEI.",
  ...urlMetadata("/login"),
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
