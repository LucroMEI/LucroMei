"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  TrendingUp,
  Wallet,
  Landmark,
  Bell,
  CalendarPlus,
} from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL, formatDateBR, monthLabel } from "@/lib/format";
import { daysUntil, nextDasDueDate } from "@/lib/taxes";
import {
  buildDasIcs,
  downloadIcs,
  googleCalendarUrl,
} from "@/lib/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";

export default function DashboardPage() {
  const { ready, monthTx, summary, settings, year, month } = useFinance();
  const [calMsg, setCalMsg] = useState("");

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        Carregando…
      </div>
    );
  }

  const isMei = (settings?.regime_tributario ?? "MEI") === "MEI";
  const dasDate = nextDasDueDate(settings?.das_dia_vencimento ?? 20);
  const dasDays = daysUntil(dasDate);
  const meta = settings?.meta_mensal_lucro ?? 4000;
  const metaPct = Math.min(100, Math.max(0, (summary.lucro / meta) * 100));

  const calEvent = {
    dueDate: dasDate,
    amountBrl: summary.dasEstimado,
  };

  function addToPhoneCalendar() {
    const ics = buildDasIcs({ ...calEvent, reminderMinutes: 24 * 60 });
    const name = `lucromei-das-${dasDate.toISOString().slice(0, 10)}.ics`;
    downloadIcs(name, ics);
    setCalMsg(
      "Arquivo de agenda baixado. Abra-o para adicionar no celular (Apple/Google/Outlook). Lembrete: 1 dia antes."
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Olá, {settings?.full_name || "MEI"}</p>
          <h1 className="text-2xl font-bold capitalize text-slate-900">
            {monthLabel(`${year}-${String(month).padStart(2, "0")}`)}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Regime: {settings?.regime_tributario ?? "MEI"}
            {isMei ? ` · ${settings?.atividade_mei ?? "servicos"}` : ""}
          </p>
        </div>
        <Link href="/upload">
          <Button>
            <Camera className="h-4 w-4" />
            Novo comprovante
          </Button>
        </Link>
      </div>

      {/* Alerta limite MEI */}
      {summary.alerta && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            summary.acimaLimiteMei
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
        >
          {summary.alerta}
        </div>
      )}

      {/* DAS alert — só MEI */}
      {isMei && (
        <div
          className={`rounded-2xl border px-4 py-3 ${
            dasDays <= 5
              ? "border-amber-300 bg-amber-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell
              className={`mt-0.5 h-5 w-5 shrink-0 ${dasDays <= 5 ? "text-amber-600" : "text-slate-400"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Próximo DAS:{" "}
                {dasDays === 0
                  ? "vence hoje"
                  : dasDays === 1
                    ? "vence amanhã"
                    : `vence em ${dasDays} dias`}
              </p>
              <p className="text-xs text-slate-600">
                {formatDateBR(dasDate.toISOString().slice(0, 10))} · valor aprox.{" "}
                {formatBRL(summary.dasEstimado)} · pague no PGMEI
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                O alerta no app é automático. Para a{" "}
                <strong>agenda do telemóvel</strong>, escolha abaixo (só se quiser):
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 bg-white"
                  onClick={addToPhoneCalendar}
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Apple / Outlook (.ics)
                </Button>
                <a
                  href={googleCalendarUrl(calEvent)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button type="button" size="sm" variant="outline" className="h-9 bg-white">
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Google Agenda
                  </Button>
                </a>
              </div>
              {calMsg && (
                <p className="mt-2 text-[11px] leading-snug text-emerald-800">{calMsg}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Receitas"
          value={formatBRL(summary.receitas)}
          icon={ArrowUpRight}
          tone="green"
        />
        <StatCard
          label="Despesas"
          value={formatBRL(summary.despesas)}
          icon={ArrowDownRight}
          tone="rose"
        />
        <StatCard
          label="Lucro estimado"
          value={formatBRL(summary.lucro)}
          icon={TrendingUp}
          tone="slate"
        />
        <StatCard
          label="Impostos aprox."
          value={formatBRL(summary.impostoEstimado)}
          icon={Landmark}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Últimas transações</CardTitle>
            <Link href="/transacoes" className="text-sm font-medium text-emerald-700">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {monthTx.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-y divide-slate-100">
                {monthTx.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {t.description || t.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateBR(t.date)} · {t.category}
                        {t.ai_confidence != null && (
                          <span className="ml-1 text-emerald-600">· IA</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        t.type === "receita" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {t.type === "receita" ? "+" : "−"}
                      {formatBRL(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-600" />
                Meta de lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBRL(summary.lucro)}</p>
              <p className="text-xs text-slate-500">de {formatBRL(meta)}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${metaPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{metaPct.toFixed(0)}% da meta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impostos do mês (aprox.)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {summary.lines.map((line) => (
                <div key={line.key}>
                  <Row label={line.label} value={formatBRL(line.value)} />
                  {line.note && (
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{line.note}</p>
                  )}
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2">
                <Row
                  label="Total aproximado"
                  value={formatBRL(summary.impostoEstimado)}
                  bold
                />
              </div>
              <Row
                label="Lucro após imposto (aprox.)"
                value={formatBRL(summary.lucroAposImposto)}
              />
              {isMei && (
                <div className="mt-2 rounded-lg bg-slate-50 px-2 py-2 text-[11px] text-slate-500">
                  Faturamento {year}: {formatBRL(summary.receitasAno)} de{" "}
                  {formatBRL(summary.limiteMei)} ({summary.pctLimiteMei.toFixed(0)}% do
                  limite MEI)
                </div>
              )}
              <p className="pt-1 text-[11px] leading-snug text-slate-400">{summary.metodo}</p>
              <Disclaimer compact className="!text-left pt-1" />
              <Link
                href="/configuracoes"
                className="block text-xs font-medium text-emerald-700 hover:underline"
              >
                Ajustar regime / atividade →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {settings?.subscription_status === "trialing" && settings.trial_ends_at && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Teste grátis ativo até{" "}
          <strong>{formatDateBR(settings.trial_ends_at.slice(0, 10))}</strong>.{" "}
          <Link href="/assinatura" className="font-semibold underline">
            Ver planos
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "rose" | "slate" | "amber";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-900 text-white",
    amber: "bg-amber-50 text-amber-800",
  };
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <div className="mb-2 flex items-center justify-between opacity-80">
        <span className="text-xs font-medium">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold tracking-tight md:text-xl">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-slate-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-600">Nenhuma transação este mês.</p>
      <Link href="/upload" className="mt-3 inline-block">
        <Button size="sm">Enviar primeiro comprovante</Button>
      </Link>
    </div>
  );
}
