"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Tela curta depois da primeira foto — o Google Ads conta o lead nesta URL. */
export function FotoOkClient() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 2500);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center space-y-5 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
        <Check className="h-8 w-8" strokeWidth={2.5} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Comprovante salvo</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Agora o LucroMei mostra quanto sobrou. Sem planilha.
        </p>
      </div>
      <Button size="lg" onClick={() => router.replace("/dashboard")}>
        Ver meu lucro
      </Button>
    </div>
  );
}
