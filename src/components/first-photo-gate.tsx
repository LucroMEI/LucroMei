"use client";

import Link from "next/link";
import { Camera, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FirstPhotoGate({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
        <Camera className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Tira foto do último comprovante
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          PIX, notinha ou recibo. Aí o LucroMei lê e mostra quanto sobrou.
          Sem a foto, o painel fica vazio — é o primeiro passo do teste.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href="/upload?primeiro=1" className="w-full sm:w-auto">
          <Button size="lg" className="w-full">
            <Camera className="h-5 w-5" />
            Tirar foto agora
          </Button>
        </Link>
        <Link href="/upload?primeiro=1" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full bg-white">
            <FileUp className="h-5 w-5" />
            Enviar PDF
          </Button>
        </Link>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        Depois eu tiro a foto
      </button>
    </div>
  );
}
