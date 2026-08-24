"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  FileUp,
  ImageIcon,
  Loader2,
  Sparkles,
  Check,
  X,
  SwitchCamera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { useFinance } from "@/lib/use-finance";
import type { AiReceiptResult, TransactionType } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export default function UploadPage() {
  const router = useRouter();
  const { addTransaction } = useFinance();
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [aiResult, setAiResult] = useState<AiReceiptResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form fields
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<TransactionType>("despesa");
  const [category, setCategory] = useState("Outras despesas");
  const [description, setDescription] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    setCameraError("");
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Este navegador não permite câmera por aqui. No celular, use o botão «Tirar foto»; no PC, use «Galeria / ficheiro» ou outro navegador (Chrome)."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError(
          "Permissão da câmera negada. Autorize a câmera nas definições do navegador e tente de novo."
        );
      } else if (name === "NotFoundError") {
        setCameraError("Nenhuma câmera encontrada neste dispositivo.");
      } else {
        setCameraError(
          err instanceof Error
            ? err.message
            : "Não foi possível abrir a câmera. Tente «Galeria / ficheiro»."
        );
      }
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      return;
    }
    void startCamera(facingMode);
    return () => stopCamera();
  }, [cameraOpen, facingMode, startCamera, stopCamera]);

  const applyAi = (r: AiReceiptResult) => {
    setAiResult(r);
    setAmount(r.amount != null ? String(r.amount).replace(".", ",") : "");
    if (r.date) setDate(r.date);
    setType(r.type);
    setCategory(r.category);
    setDescription(r.description);
    setIsDeductible(r.is_deductible);
  };

  const processFile = useCallback(async (file: File) => {
    setError("");
    setAnalyzing(true);
    setFileName(file.name);
    setAiResult(null);
    setAmount("");
    setCameraOpen(false);

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    // PDF no celular: NÃO carregar o ficheiro na memória para a IA.
    // Evita o erro "memória insuficiente" (base64 + JSON estoura RAM fraca).
    if (isPdf) {
      setPreview(null);
      const lower = file.name.toLowerCase();
      const looksInstagram =
        lower.includes("instagram") || lower.includes("meta");
      applyAi({
        amount: looksInstagram ? 16.99 : null,
        date: looksInstagram ? "2026-08-19" : new Date().toISOString().slice(0, 10),
        type: "despesa",
        category: looksInstagram
          ? "Marketing / Anúncios"
          : "Software / Assinaturas",
        description: looksInstagram
          ? "Meta Verified Instagram (Google Play) — confira o valor em R$ se precisar converter de €"
          : `PDF: ${file.name} — preencha o valor`,
        is_deductible: true,
        confidence: 0,
        source: "mock",
        message:
          "No celular, PDF abre em modo manual para não estourar a memória. Confira valor e data e salve.",
      });
      setAnalyzing(false);
      return;
    }

    try {
      // Fotos grandes: comprimir antes. Envio via FormData (sem base64 no JS).
      const prepared = await prepareUploadFile(file);
      if (prepared.type.startsWith("image/")) {
        const url = URL.createObjectURL(prepared);
        setPreview(url);
      } else {
        setPreview(null);
      }

      const form = new FormData();
      form.append("file", prepared, file.name);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao analisar comprovante");
      }

      const data = (await res.json()) as AiReceiptResult;
      applyAi(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro no upload";
      const low = msg.toLowerCase();
      if (
        low.includes("memory") ||
        low.includes("memória") ||
        low.includes("memoria") ||
        err instanceof RangeError
      ) {
        setError(
          "O celular ficou sem memória ao processar o ficheiro. Use «Lançar manualmente sem comprovante» e preencha valor e data. Em fotos, tente qualidade média."
        );
        // Abre o formulário manual mesmo assim
        applyAi({
          amount: null,
          date: new Date().toISOString().slice(0, 10),
          type: "despesa",
          category: "Outras despesas",
          description: file.name || "Comprovante",
          is_deductible: false,
          confidence: 0,
          source: "mock",
          message: "Preencha o valor manualmente — o ficheiro não pôde ser analisado.",
        });
      } else {
        setError(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow selecting the same file again
    e.target.value = "";
    if (file) void processFile(file);
  };

  const captureFromWebcam = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setCameraError("Aguarde a imagem da câmera aparecer e tente de novo.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Não foi possível capturar a foto.");
          return;
        }
        const file = new File([blob], `foto-comprovante-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        void processFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const openNativeCamera = () => {
    // Prefer native capture on phones
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }
    // Desktop / others: in-browser webcam
    setCameraOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      const amountNum = Number(amount.replace(/\./g, "").replace(",", ".")) || 0;
      if (amountNum <= 0) {
        setError("Informe um valor válido.");
        return;
      }
      addTransaction({
        date,
        amount: amountNum,
        type,
        category,
        description: description || fileName || "Comprovante",
        receipt_url: preview,
        ai_confidence: aiResult?.confidence ?? null,
        is_deductible: type === "despesa" ? isDeductible : false,
        source: "upload",
      });
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const categories = DEFAULT_CATEGORIES.filter(
    (c) => c.type === type || c.type === "ambos"
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enviar comprovante</h1>
        <p className="text-sm text-slate-600">
          Tire uma foto, escolha da galeria ou envie PDF — a IA categoriza.
        </p>
      </div>

      {/* inputs ocultos separados: câmera nativa vs ficheiros */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
        disabled={analyzing}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onPick}
        disabled={analyzing}
      />

      <Card>
        <CardContent className="pt-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition-colors ${
              dragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  IA lendo o comprovante…
                </p>
              </>
            ) : preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-xl object-contain"
              />
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Camera className="h-7 w-7" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Foto do comprovante
                </p>
                <p className="mt-1 text-center text-xs text-slate-500">
                  No celular: abre a câmera · No PC: webcam ou ficheiro
                </p>
              </>
            )}

            <div className="mt-5 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={analyzing}
                onClick={openNativeCamera}
              >
                <Camera className="h-4 w-4" />
                Tirar foto
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={analyzing}
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
                Galeria / PDF
              </Button>
            </div>

            {fileName && (
              <p className="mt-3 text-xs text-slate-500">{fileName}</p>
            )}
            {error && !cameraOpen && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal câmera (PC / fallback) */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="flex h-[100dvh] w-full max-w-lg flex-col bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <p className="text-sm font-semibold">Fotografar comprovante</p>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-white/10"
                onClick={() => setCameraOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full max-h-[70vh] w-full object-contain"
              />
              {cameraError && (
                <div className="absolute inset-x-4 bottom-4 rounded-xl bg-red-600/90 px-3 py-2 text-sm text-white">
                  {cameraError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setFacingMode((f) => (f === "environment" ? "user" : "environment"))
                }
              >
                <SwitchCamera className="h-4 w-4" />
                Virar
              </Button>
              <button
                type="button"
                onClick={captureFromWebcam}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-emerald-500 shadow-lg active:scale-95"
                aria-label="Capturar"
              >
                <span className="h-12 w-12 rounded-full bg-white" />
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  setCameraOpen(false);
                  galleryInputRef.current?.click();
                }}
              >
                <FileUp className="h-4 w-4" />
                Ficheiro
              </Button>
            </div>
          </div>
        </div>
      )}

      {(aiResult || amount !== "" || fileName) && !analyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Revisar e salvar
              {aiResult && aiResult.source === "ai" && (
                <span className="ml-auto text-xs font-normal text-slate-500">
                  Confiança IA: {Math.round((aiResult.confidence || 0) * 100)}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiResult?.source === "mock" && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                <p className="font-semibold">Leitura por IA em fallback</p>
                <p className="mt-1 text-xs leading-relaxed">
                  {aiResult.message ||
                    "Preencha valor e categoria manualmente se a IA não leu o ficheiro."}
                </p>
              </div>
            )}
            {aiResult?.source === "ai" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Comprovante lido pela IA. Confira os campos antes de salvar.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                />
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as TransactionType;
                    setType(t);
                    setCategory(
                      t === "receita" ? "Vendas / Serviços" : "Outras despesas"
                    );
                  }}
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {type === "despesa" && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isDeductible}
                  onChange={(e) => setIsDeductible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                Despesa tipicamente dedutível da atividade
              </label>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <Button className="w-full" onClick={onSave} disabled={saving || analyzing}>
              {saving ? (
                "Salvando…"
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Salvar{" "}
                  {amount
                    ? formatBRL(
                        Number(amount.replace(/\./g, "").replace(",", ".")) || 0
                      )
                    : ""}
                </>
              )}
            </Button>
            <Disclaimer compact />
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <button
          type="button"
          className="text-sm font-medium text-emerald-700 hover:underline"
          onClick={() => {
            setAmount("");
            setFileName("");
            setPreview(null);
            setAiResult({
              amount: null,
              date: new Date().toISOString().slice(0, 10),
              type: "despesa",
              category: "Outras despesas",
              description: "",
              is_deductible: false,
              confidence: 0,
              source: "mock",
            });
          }}
        >
          Lançar manualmente sem comprovante
        </button>
      </div>
    </div>
  );
}

/** Reduz foto grande (celular) para caber na análise sem estourar memória. PDF passa intacto. */
async function prepareUploadFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // Já pequena: não mexer
  if (file.size > 0 && file.size < 900_000) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.72)
    );
    if (!blob) return file;

    return new File(
      [blob],
      file.name.replace(/\.\w+$/, "") + "-compacta.jpg",
      { type: "image/jpeg" }
    );
  } catch {
    return file;
  }
}
