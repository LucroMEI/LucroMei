"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatBRL } from "@/lib/format";
import { LIMITE_MEI_ANUAL } from "@/lib/taxes";

function parseMoney(raw: string): number {
  const cleaned = raw
    .replace(/R\$\s?/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type Status = "ok" | "atencao" | "risco" | "acima";

function statusFromPct(pct: number): Status {
  if (pct > 100) return "acima";
  if (pct >= 100) return "acima";
  if (pct >= 90) return "risco";
  if (pct >= 80) return "atencao";
  return "ok";
}

const statusCopy: Record<
  Status,
  { title: string; tone: string; bar: string; badge: string }
> = {
  ok: {
    title: "Dentro do limite",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
  },
  atencao: {
    title: "Atenção: perto do limite",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-900",
  },
  risco: {
    title: "Risco alto de desenquadramento",
    tone: "border-orange-200 bg-orange-50 text-orange-950",
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-900",
  },
  acima: {
    title: "Acima do limite MEI",
    tone: "border-rose-200 bg-rose-50 text-rose-950",
    bar: "bg-rose-600",
    badge: "bg-rose-100 text-rose-900",
  },
};

export function LimiteMeiCalculator() {
  const [acumulado, setAcumulado] = useState("");
  const [mediaMensal, setMediaMensal] = useState("");
  const [mesesRestantes, setMesesRestantes] = useState("6");

  const result = useMemo(() => {
    const fatAcumulado = parseMoney(acumulado);
    const media = parseMoney(mediaMensal);
    const meses = Math.min(12, Math.max(0, Math.floor(Number(mesesRestantes) || 0)));

    const projetado = fatAcumulado + media * meses;
    const restante = Math.max(0, LIMITE_MEI_ANUAL - fatAcumulado);
    const pctUsado = Math.min(999, (fatAcumulado / LIMITE_MEI_ANUAL) * 100);
    const pctProjetado = Math.min(999, (projetado / LIMITE_MEI_ANUAL) * 100);
    const status = statusFromPct(pctProjetado > 0 ? pctProjetado : pctUsado);

    // Quanto pode faturar por mês nos meses restantes sem estourar (se ainda cabe)
    const tetoMensalRestante =
      meses > 0 ? Math.max(0, restante / meses) : restante;

    return {
      fatAcumulado,
      media,
      meses,
      projetado,
      restante,
      pctUsado,
      pctProjetado,
      status,
      tetoMensalRestante,
      hasInput: fatAcumulado > 0 || media > 0,
    };
  }, [acumulado, mediaMensal, mesesRestantes]);

  const ui = statusCopy[result.status];
  const barWidth = Math.min(100, result.hasInput ? result.pctProjetado : 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="acumulado">
              Quanto você já faturou neste ano? (bruto)
            </Label>
            <Input
              id="acumulado"
              inputMode="decimal"
              placeholder="Ex.: 42000 ou 42.000,00"
              value={acumulado}
              onChange={(e) => setAcumulado(e.target.value)}
              className="text-base tabular-nums"
            />
            <p className="mt-1 text-xs text-slate-500">
              Soma das receitas brutas do ano civil (1º jan–hoje), se souber.
            </p>
          </div>

          <div>
            <Label htmlFor="media">Média de faturamento por mês</Label>
            <Input
              id="media"
              inputMode="decimal"
              placeholder="Ex.: 6500"
              value={mediaMensal}
              onChange={(e) => setMediaMensal(e.target.value)}
              className="text-base tabular-nums"
            />
            <p className="mt-1 text-xs text-slate-500">
              Quanto costuma entrar por mês daqui pra frente.
            </p>
          </div>

          <div>
            <Label htmlFor="meses">Meses que faltam no ano</Label>
            <Input
              id="meses"
              type="number"
              min={0}
              max={12}
              step={1}
              value={mesesRestantes}
              onChange={(e) => setMesesRestantes(e.target.value)}
              className="text-base tabular-nums"
            />
            <p className="mt-1 text-xs text-slate-500">
              Ex.: em julho restam ~6 meses (ago–dez).
            </p>
          </div>
        </div>
      </div>

      {result.hasInput && (
        <div className="space-y-4">
          <div className={`rounded-2xl border-2 p-5 ${ui.tone}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ui.badge}`}
              >
                {ui.title}
              </span>
              <span className="text-sm font-semibold">
                Limite MEI {formatBRL(LIMITE_MEI_ANUAL)}/ano
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span>Projeção no ano</span>
                <span className="tabular-nums">
                  {result.pctProjetado.toFixed(0)}% do limite
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/70 ring-1 ring-black/5">
                <div
                  className={`h-full rounded-full transition-all ${ui.bar}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Já faturado
                </dt>
                <dd className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {formatBRL(result.fatAcumulado)}
                </dd>
              </div>
              <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Projeção até 31/12
                </dt>
                <dd className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {formatBRL(result.projetado)}
                </dd>
              </div>
              <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Ainda cabe no limite
                </dt>
                <dd className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {formatBRL(result.restante)}
                </dd>
              </div>
              <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
                <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Teto médio / mês restante
                </dt>
                <dd className="mt-0.5 text-xl font-extrabold tabular-nums">
                  {result.meses > 0
                    ? formatBRL(result.tetoMensalRestante)
                    : "—"}
                </dd>
              </div>
            </dl>

            {result.status === "acima" && (
              <p className="mt-4 flex items-start gap-2 text-sm font-medium">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                A projeção passa de {formatBRL(LIMITE_MEI_ANUAL)}. Fale com um
                contador sobre desenquadramento e o que fazer.
              </p>
            )}
            {result.status === "risco" && (
              <p className="mt-4 flex items-start gap-2 text-sm font-medium">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Você está a um passo do teto. Acompanhe o faturamento mês a mês
                para não ser pega de surpresa.
              </p>
            )}
            {result.status === "atencao" && (
              <p className="mt-4 flex items-start gap-2 text-sm font-medium">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Já usou 80%+ do limite na projeção. Vale ir somando as receitas
                com mais frequência.
              </p>
            )}
            {result.status === "ok" && (
              <p className="mt-4 flex items-start gap-2 text-sm font-medium">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Na projeção atual, ainda há folga. Continue registrando as
                entradas para não perder o controle no fim do ano.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-900">
              Quer ver o faturamento real mês a mês?
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-800">
              No LucroMEI você tira foto do comprovante e o app soma receitas,
              despesas, lucro e mostra quanto do limite MEI já usou.
            </p>
            <Link href="/cadastro" className="mt-4 inline-block">
              <Button className="bg-emerald-600 font-bold hover:bg-emerald-700">
                Criar conta · 14 dias grátis
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!result.hasInput && (
        <p className="text-center text-sm font-medium text-slate-500">
          Preencha o faturamento acumulado e/ou a média mensal para ver o
          resultado.
        </p>
      )}
    </div>
  );
}
