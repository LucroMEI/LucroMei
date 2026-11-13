import type { Metadata } from "next";
import { FotoOkClient } from "./foto-ok-client";

export const metadata: Metadata = {
  title: "Comprovante salvo",
  robots: { index: false, follow: false },
};

export default function FotoOkPage() {
  return <FotoOkClient />;
}
