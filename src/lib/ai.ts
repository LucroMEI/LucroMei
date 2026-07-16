import OpenAI from "openai";
import { CATEGORY_NAMES, isDeductibleDefault } from "./categories";
import type { AiReceiptResult, TransactionType } from "./types";

const SYSTEM_PROMPT = `Você é o assistente financeiro do LucroMEI, app para MEIs e freelancers brasileiros.
Analise o comprovante (foto ou PDF) e extraia dados estruturados em JSON.

Regras:
- Valores em BRL (reais). amount é número positivo (ex: 89.90).
- date no formato YYYY-MM-DD. Se não houver data, use null.
- type: "despesa" se for compra/pagamento; "receita" se for recebimento/transferência recebida/venda.
- category: escolha EXATAMENTE uma desta lista: ${CATEGORY_NAMES.join(", ")}
- is_deductible: true se for despesa tipicamente dedutível da atividade (material, transporte, internet, aluguel, software, marketing, equipamentos). false para pessoal, saúde, impostos.
- description: curta, em português do Brasil (ex: "Posto Shell - gasolina").
- confidence: 0 a 1.
- merchant: nome do estabelecimento se visível.
- Responda SOMENTE com JSON válido, sem markdown.`;

function getClient() {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.x.ai/v1",
  });
}

function parseJsonLoose(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function normalizeResult(raw: Record<string, unknown>): AiReceiptResult {
  const amount = typeof raw.amount === "number" ? raw.amount : Number(raw.amount) || null;
  const type: TransactionType = raw.type === "receita" ? "receita" : "despesa";
  let category = typeof raw.category === "string" ? raw.category : "Outras despesas";
  if (!CATEGORY_NAMES.includes(category)) {
    category = type === "receita" ? "Outras receitas" : "Outras despesas";
  }
  const is_deductible =
    typeof raw.is_deductible === "boolean" ? raw.is_deductible : isDeductibleDefault(category);
  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.7;

  return {
    amount: amount && amount > 0 ? Math.round(amount * 100) / 100 : null,
    date: typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw.date) ? raw.date.slice(0, 10) : null,
    type,
    category,
    description: typeof raw.description === "string" ? raw.description.slice(0, 200) : "Comprovante",
    is_deductible: type === "despesa" ? is_deductible : false,
    confidence,
    merchant: typeof raw.merchant === "string" ? raw.merchant : undefined,
    raw_text: typeof raw.raw_text === "string" ? raw.raw_text : undefined,
    source: "ai",
  };
}

const MOCK_MSG =
  "Arquivo recebido, mas a leitura por IA ainda não está ativa (falta XAI_API_KEY). Preencha valor e categoria manualmente — o ficheiro fica anexado à descrição.";

/** Fallback heurístico quando não há API key (demo). NÃO lê a imagem — só o nome do ficheiro. */
export function mockAnalyzeReceipt(fileName: string): AiReceiptResult {
  const lower = fileName.toLowerCase();
  const base = {
    source: "mock" as const,
    message: MOCK_MSG,
    date: new Date().toISOString().slice(0, 10),
  };

  if (lower.includes("uber") || lower.includes("99") || lower.includes("gasolina") || lower.includes("posto")) {
    return {
      ...base,
      amount: 67.5,
      type: "despesa",
      category: "Combustível / Transporte",
      description: "Transporte / combustível (simulado pelo nome do ficheiro)",
      is_deductible: true,
      confidence: 0.2,
      merchant: "Transporte",
    };
  }
  if (lower.includes("ifood") || lower.includes("restaurante") || lower.includes("padaria")) {
    return {
      ...base,
      amount: 42.9,
      type: "despesa",
      category: "Alimentação (trabalho)",
      description: "Alimentação (simulado pelo nome do ficheiro)",
      is_deductible: true,
      confidence: 0.2,
    };
  }
  if (lower.includes("pix") || lower.includes("receb")) {
    return {
      ...base,
      amount: 350,
      type: "receita",
      category: "Recebimentos PIX",
      description: "Recebimento PIX (simulado pelo nome do ficheiro)",
      is_deductible: false,
      confidence: 0.2,
    };
  }
  return {
    ...base,
    amount: null, // força o utilizador a preencher o valor real
    type: "despesa",
    category: "Outras despesas",
    description: `Anexo: ${fileName || "comprovante"} — preencha o valor manualmente`,
    is_deductible: false,
    confidence: 0,
  };
}

/**
 * Analisa comprovante com Grok Vision (xAI).
 * imageBase64 deve incluir data URL ou ser base64 puro + mimeType.
 */
export async function analyzeReceipt(params: {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
}): Promise<AiReceiptResult> {
  const client = getClient();
  if (!client) {
    return mockAnalyzeReceipt(params.fileName || "comprovante");
  }

  const dataUrl = params.imageBase64.startsWith("data:")
    ? params.imageBase64
    : `data:${params.mimeType};base64,${params.imageBase64}`;

  const isPdf = params.mimeType === "application/pdf" || params.fileName?.toLowerCase().endsWith(".pdf");

  try {
    // Imagens: vision. PDF: tenta enviar como file data URL; se o modelo falhar, mock.
    const userContent = isPdf
      ? ([
          {
            type: "text" as const,
            text: `Analise este comprovante em PDF (${params.fileName || "comprovante.pdf"}). Extraia valor, data, tipo, categoria em JSON. Se não conseguir ler o PDF, devolva confidence baixa e amount null.`,
          },
          // Alguns modelos aceitam image_url com data:application/pdf — se falhar, cai no catch
          {
            type: "image_url" as const,
            image_url: { url: dataUrl, detail: "high" as const },
          },
        ] as const)
      : ([
          {
            type: "text" as const,
            text: "Analise este comprovante (foto) e retorne o JSON pedido com valor, data, tipo e categoria reais lidos da imagem.",
          },
          {
            type: "image_url" as const,
            image_url: { url: dataUrl, detail: "high" as const },
          },
        ] as const);

    const response = await client.chat.completions.create({
      model: "grok-4.5",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [...userContent],
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = parseJsonLoose(text) as Record<string, unknown>;
    return normalizeResult(parsed);
  } catch (err) {
    console.error("[ai.analyzeReceipt]", err);
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    let message = `A chave xAI está configurada, mas a API falhou: ${msg.slice(0, 180)}`;
    if (lower.includes("credit") || lower.includes("license") || lower.includes("permission-denied")) {
      message =
        "Chave xAI OK, mas a equipa ainda não tem créditos. Compre créditos em https://console.x.ai (Billing / Credits) e tente de novo. Enquanto isso, preencha valor e categoria manualmente.";
    }
    const fallback = mockAnalyzeReceipt(params.fileName || "comprovante");
    return { ...fallback, message, source: "mock" };
  }
}
