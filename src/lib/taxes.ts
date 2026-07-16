import type { AtividadeMei, MonthSummary, RegimeTributario, Transaction } from "./types";

/**
 * Estimativas de impostos para MEI / freelancers (referência 2026).
 * NÃO substitui contador, PGMEI, DAS oficial nem declaração.
 *
 * Modelo por regime:
 * - MEI: DAS fixo mensal (INSS+ISS/ICMS embutidos). IR mensal = 0 na estimativa
 *   (distribuição de lucros do MEI em regra é isenta até o limite de faturamento;
 *   IRPF real depende de saques/pró-labore — simplificado de propósito).
 * - Autônomo: sem DAS MEI; IR mensal estilo carnê-leão sobre base (receitas − dedutíveis).
 * - Simples: alíquota efetiva simplificada sobre faturamento do mês (Anexo III ~6%
 *   como proxy didático; o Simples real usa faixas RBT12 e anexos I–V).
 * - Outro: mesma lógica do Autônomo (conservadora).
 */

/** DAS MEI aproximado 2026 — confira no Portal do Empreendedor / PGMEI. */
export const DAS_MEI_2026: Record<AtividadeMei, number> = {
  comercio: 76.9,
  servicos: 80.9,
  comercio_servicos: 81.9,
};

/** Limite anual de faturamento MEI (referência legal atual no app). */
export const LIMITE_MEI_ANUAL = 81_000;

/** Alíquota efetiva didática do Simples (Anexo III, faixa inicial ~6%). */
export const SIMPLES_ALIQUOTA_EFETIVA_APROX = 0.06;

export function estimateDasMensal(
  atividade: AtividadeMei = "servicos",
  regime: RegimeTributario = "MEI"
): number {
  if (regime !== "MEI") return 0;
  return DAS_MEI_2026[atividade] ?? DAS_MEI_2026.servicos;
}

/**
 * IR mensal aproximado (carnê-leão / tabela progressiva simplificada).
 * Para MEI devolvemos 0 na estimativa mensal do app.
 */
export function estimateIrMensal(
  baseCalculo: number,
  regime: RegimeTributario = "MEI"
): number {
  if (regime === "MEI") return 0;
  if (baseCalculo <= 0) return 0;

  const base = baseCalculo;
  // Faixas IRPF mensais (aproximação didática — atualize se a tabela mudar)
  let ir = 0;
  if (base <= 2259.2) ir = 0;
  else if (base <= 2826.65) ir = base * 0.075 - 169.44;
  else if (base <= 3751.05) ir = base * 0.15 - 381.44;
  else if (base <= 4664.68) ir = base * 0.225 - 662.77;
  else ir = base * 0.275 - 896.0;

  return Math.max(0, Math.round(ir * 100) / 100);
}

/** Simples Nacional: proxy % sobre faturamento (receitas) do mês. */
export function estimateSimplesMensal(receitasMes: number): number {
  if (receitasMes <= 0) return 0;
  return Math.round(receitasMes * SIMPLES_ALIQUOTA_EFETIVA_APROX * 100) / 100;
}

export function sumReceitas(transactions: Transaction[]): number {
  return transactions.reduce(
    (s, t) => s + (t.type === "receita" ? Number(t.amount) || 0 : 0),
    0
  );
}

export function filterByYear(transactions: Transaction[], year: number): Transaction[] {
  const prefix = `${year}-`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}

export function filterByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}

export type TaxBreakdownLine = {
  key: string;
  label: string;
  value: number;
  note?: string;
};

export function summarizeMonth(
  transactions: Transaction[],
  opts: {
    regime?: RegimeTributario;
    atividade?: AtividadeMei;
    /** Todas as receitas do ano (YTD) para alerta de limite MEI */
    receitasAno?: number;
  } = {}
): MonthSummary {
  const regime = opts.regime ?? "MEI";
  const atividade = opts.atividade ?? "servicos";

  let receitas = 0;
  let despesas = 0;
  let despesasDedutiveis = 0;

  for (const t of transactions) {
    const amount = Number(t.amount) || 0;
    if (t.type === "receita") {
      receitas += amount;
    } else {
      despesas += amount;
      if (t.is_deductible) despesasDedutiveis += amount;
    }
  }

  const lucro = receitas - despesas;
  /** Base IR: faturamento − despesas marcadas como dedutíveis da atividade */
  const baseIr = Math.max(0, receitas - despesasDedutiveis);

  let dasEstimado = 0;
  let irEstimado = 0;
  let simplesEstimado = 0;
  const lines: TaxBreakdownLine[] = [];
  let metodo = "";

  if (regime === "MEI") {
    dasEstimado = estimateDasMensal(atividade, "MEI");
    irEstimado = 0;
    metodo = "MEI: DAS fixo mensal (referência). IR mensal não projetado no app.";
    lines.push({
      key: "das",
      label: `DAS MEI (${labelAtividade(atividade)})`,
      value: dasEstimado,
      note: "Valor fixo de referência — confira no PGMEI",
    });
    lines.push({
      key: "ir",
      label: "IR mensal (estimativa)",
      value: 0,
      note: "No MEI, em regra o foco mensal é o DAS; consulte contador sobre pró-labore/saques",
    });
  } else if (regime === "Simples") {
    simplesEstimado = estimateSimplesMensal(receitas);
    metodo =
      "Simples Nacional: ~6% sobre faturamento do mês (proxy Anexo III). O DAS real usa RBT12 e anexo da atividade.";
    lines.push({
      key: "simples",
      label: "Simples (aprox. 6% s/ receita)",
      value: simplesEstimado,
      note: "Alíquota efetiva real varia por anexo e faixa de faturamento",
    });
  } else {
    // Autonomo ou Outro
    irEstimado = estimateIrMensal(baseIr, regime);
    metodo =
      regime === "Autonomo"
        ? "Autônomo: IR aproximado (carnê-leão) sobre receitas − despesas dedutíveis. Sem DAS MEI."
        : "Outro regime: mesma lógica do autônomo (estimativa conservadora).";
    lines.push({
      key: "ir",
      label: "IR / carnê-leão (aprox.)",
      value: irEstimado,
      note: `Base de cálculo: ${baseIr.toFixed(2)} (receitas − dedutíveis)`,
    });
  }

  const impostoEstimado =
    Math.round((dasEstimado + irEstimado + simplesEstimado) * 100) / 100;

  const receitasAno = opts.receitasAno ?? receitas;
  const limiteMei = LIMITE_MEI_ANUAL;
  const pctLimiteMei = Math.min(100, (receitasAno / limiteMei) * 100);
  const pertoLimiteMei = regime === "MEI" && pctLimiteMei >= 80;
  const acimaLimiteMei = regime === "MEI" && receitasAno > limiteMei;

  let alerta: string | null = null;
  if (acimaLimiteMei) {
    alerta = `Faturamento no ano (R$ ${receitasAno.toFixed(2)}) acima do limite MEI (R$ ${limiteMei.toLocaleString("pt-BR")}). Pode desenquadrar — fale com contador.`;
  } else if (pertoLimiteMei) {
    alerta = `Atenção: ${pctLimiteMei.toFixed(0)}% do limite anual MEI (R$ ${limiteMei.toLocaleString("pt-BR")}) já utilizado este ano.`;
  }

  const lucroAposImposto = lucro - impostoEstimado;

  return {
    receitas,
    despesas,
    despesasDedutiveis,
    lucro,
    impostoEstimado,
    dasEstimado,
    irEstimado,
    simplesEstimado,
    baseIr,
    count: transactions.length,
    regime,
    atividade,
    metodo,
    lines,
    receitasAno,
    limiteMei,
    pctLimiteMei,
    pertoLimiteMei,
    acimaLimiteMei,
    alerta,
    lucroAposImposto,
  };
}

function labelAtividade(a: AtividadeMei): string {
  if (a === "comercio") return "comércio";
  if (a === "comercio_servicos") return "comércio+serviços";
  return "serviços";
}

/** Próximo vencimento do DAS (dia configurável, padrão 20). Só relevante para MEI. */
export function nextDasDueDate(dia = 20, from = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  let due = new Date(year, month, Math.min(dia, 28));
  const today = new Date(year, month, from.getDate());
  if (due < today) {
    due = new Date(year, month + 1, Math.min(dia, 28));
  }
  return due;
}

export function daysUntil(date: Date, from = new Date()): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
