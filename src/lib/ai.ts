import OpenAI from "openai";
import { CATEGORY_NAMES, isDeductibleDefault } from "./categories";
import type { AiReceiptResult, TransactionType } from "./types";

/** Modelos com visão — tenta em ordem se um falhar */
const VISION_MODELS = ["grok-4", "grok-4.6", "grok-4.5", "grok-4-fast-non-reasoning"] as const;
const TEXT_MODELS = ["grok-4", "grok-4.6", "grok-4.5"] as const;

const SYSTEM_PROMPT = `Você é o assistente financeiro do LucroMEI, app para MEIs e freelancers brasileiros.
Analise o comprovante e extraia dados estruturados em JSON.

Regras:
- amount: número positivo. Se o comprovante estiver em EUR (€), converta para BRL com taxa aproximada 6,0 e mencione na description (ex: "Meta Verified — 16,99 € ≈ R$ 101,94").
- date: YYYY-MM-DD. Se não houver data, null.
- type: "despesa" para compra/pagamento/assinatura; "receita" para recebimento/PIX recebido/venda.
- category: EXATAMENTE uma desta lista: ${CATEGORY_NAMES.join(", ")}
- is_deductible: true para gasto do negócio (software, marketing, hosting, material, transporte trabalho). false para pessoal/saúde.
- description: curta em português do Brasil, com nome do serviço/estabelecimento (NÃO use o nome do arquivo).
- confidence: 0 a 1.
- merchant: nome visível no comprovante.
- Responda SOMENTE JSON válido, sem markdown.`;

function getClient() {
  const key = process.env.XAI_API_KEY?.trim();
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
  // tenta extrair objeto se vier texto extra
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json =
    start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(json);
}

function normalizeResult(raw: Record<string, unknown>): AiReceiptResult {
  const amount =
    typeof raw.amount === "number" ? raw.amount : Number(raw.amount) || null;
  const type: TransactionType = raw.type === "receita" ? "receita" : "despesa";
  let category =
    typeof raw.category === "string" ? raw.category : "Outras despesas";
  if (!CATEGORY_NAMES.includes(category)) {
    category = type === "receita" ? "Outras receitas" : "Outras despesas";
  }
  const is_deductible =
    typeof raw.is_deductible === "boolean"
      ? raw.is_deductible
      : isDeductibleDefault(category);
  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0.7;

  let description =
    typeof raw.description === "string" ? raw.description.slice(0, 200) : "";
  if (!description.trim()) {
    description =
      typeof raw.merchant === "string" && raw.merchant
        ? raw.merchant
        : "Comprovante";
  }

  return {
    amount: amount && amount > 0 ? Math.round(amount * 100) / 100 : null,
    date:
      typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw.date)
        ? raw.date.slice(0, 10)
        : null,
    type,
    category,
    description,
    is_deductible: type === "despesa" ? is_deductible : false,
    confidence,
    merchant: typeof raw.merchant === "string" ? raw.merchant : undefined,
    raw_text: typeof raw.raw_text === "string" ? raw.raw_text : undefined,
    source: "ai",
  };
}

/** Quando a IA não está disponível ou falhou — formulário vazio para preencher. */
export function emptyAnalyzeResult(fileName?: string): AiReceiptResult {
  return {
    amount: null,
    date: new Date().toISOString().slice(0, 10),
    type: "despesa",
    category: "Outras despesas",
    description: "",
    is_deductible: true,
    confidence: 0,
    source: "mock",
    message:
      "Não foi possível ler o comprovante automaticamente. Preencha valor, data e descrição.",
  };
}

/** @deprecated use emptyAnalyzeResult — mantido para imports existentes */
export function mockAnalyzeReceipt(fileName: string): AiReceiptResult {
  return emptyAnalyzeResult(fileName);
}

async function chatJson(
  client: OpenAI,
  models: readonly string[],
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
): Promise<Record<string, unknown>> {
  let lastErr: unknown;
  for (const model of models) {
    try {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.1,
        messages,
      });
      const text = response.choices[0]?.message?.content || "{}";
      return parseJsonLoose(text) as Record<string, unknown>;
    } catch (err) {
      lastErr = err;
      console.error(`[ai.chatJson] model=${model}`, err);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Falha em todos os modelos de IA");
}

/**
 * Analisa comprovante com Grok Vision (xAI) ou texto extraído de PDF.
 */
export async function analyzeReceipt(params: {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
  pdfText?: string;
}): Promise<AiReceiptResult> {
  const client = getClient();
  if (!client) {
    console.error("[ai.analyzeReceipt] XAI_API_KEY ausente no servidor");
    return {
      ...emptyAnalyzeResult(params.fileName),
      message:
        "Leitura automática desativada no servidor (configure XAI_API_KEY na Vercel). Preencha os campos manualmente.",
    };
  }

  const isPdf =
    Boolean(params.pdfText) ||
    params.mimeType === "application/pdf" ||
    Boolean(params.fileName?.toLowerCase().endsWith(".pdf"));

  try {
    if (isPdf && params.pdfText && params.pdfText.length >= 20) {
      const parsed = await chatJson(client, TEXT_MODELS, [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analise este comprovante/fatura (texto de PDF "${params.fileName || "comprovante.pdf"}").
NÃO use o nome do arquivo como description — use o que está no texto (ex.: Meta Verified, Hostinger, Stripe).

--- TEXTO ---
${params.pdfText.slice(0, 12000)}
--- FIM ---`,
        },
      ]);
      return normalizeResult(parsed);
    }

    if (isPdf && !params.pdfText) {
      return {
        ...emptyAnalyzeResult(params.fileName),
        message:
          "Não consegui extrair texto deste PDF. Tente foto do comprovante ou preencha manualmente.",
      };
    }

    if (!params.imageBase64) {
      return emptyAnalyzeResult(params.fileName);
    }

    const dataUrl = params.imageBase64.startsWith("data:")
      ? params.imageBase64
      : `data:${params.mimeType};base64,${params.imageBase64}`;

    // Garantir jpeg/png na data URL
    const safeUrl =
      dataUrl.startsWith("data:image/")
        ? dataUrl
        : `data:image/jpeg;base64,${params.imageBase64.replace(/^data:[^;]+;base64,/, "")}`;

    const parsed = await chatJson(client, VISION_MODELS, [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise este comprovante (foto). Extraia valor, data, tipo e categoria REAIS da imagem.
NÃO invente com base no nome do arquivo (${params.fileName || "sem nome"}).
Valores em BRL (converta € se preciso).`,
          },
          {
            type: "image_url",
            image_url: { url: safeUrl, detail: "high" },
          },
        ],
      },
    ]);
    return normalizeResult(parsed);
  } catch (err) {
    console.error("[ai.analyzeReceipt]", err);
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    let hint =
      "Não foi possível ler o comprovante automaticamente. Preencha valor, data e descrição.";
    if (
      lower.includes("credit") ||
      lower.includes("402") ||
      lower.includes("quota") ||
      lower.includes("billing")
    ) {
      hint =
        "Créditos da IA esgotados. Preencha os campos manualmente por agora.";
    }
    return { ...emptyAnalyzeResult(params.fileName), message: hint };
  }
}
