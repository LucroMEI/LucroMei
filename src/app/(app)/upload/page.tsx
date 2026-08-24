"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  FileUp,
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
import {
  dayFromIsoDate,
  monthFromIsoDate,
  yearMonthKey,
} from "@/lib/recurring";

type RecurringPromptMode = "once" | "monthly" | "installments" | "yearly";

export default function UploadPage() {
  const router = useRouter();
  const { addTransaction, addRecurring } = useFinance();
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [aiResult, setAiResult] = useState<AiReceiptResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  // No PC quase não existe câmera "environment" (traseira) — default user evita erro
  const [facingMode, setFacingMode] = useState<"environment" | "user">("user");
  const [recurringPromptOpen, setRecurringPromptOpen] = useState(false);
  const [recurringMode, setRecurringMode] =
    useState<RecurringPromptMode>("once");
  const [installments, setInstallments] = useState("12");

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
  // Padrão: gasto do negócio (MEI) marcado — utilizador desmarca se for pessoal
  const [isDeductible, setIsDeductible] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (opts?: { deviceId?: string | null; facing?: "environment" | "user" }) => {
      setCameraError("");
      stopCamera();
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Este navegador não permite câmera. Use o botão «PDF» ou abra no Chrome."
        );
        return;
      }

      const lowMem = isLowMemoryPhone();
      const facing = opts?.facing ?? facingMode;
      const preferId = opts?.deviceId !== undefined ? opts.deviceId : videoDeviceId;

      const attempts: MediaStreamConstraints[] = [];
      if (preferId) {
        attempts.push({
          audio: false,
          video: {
            deviceId: { exact: preferId },
            width: { ideal: lowMem ? 960 : 1280 },
            height: { ideal: lowMem ? 540 : 720 },
          },
        });
      }
      attempts.push(
        {
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: lowMem ? 960 : 1280 },
            height: { ideal: lowMem ? 540 : 720 },
          },
        },
        {
          audio: false,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        },
        { audio: false, video: true }
      );

      let lastErr: unknown;
      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          const track = stream.getVideoTracks()[0];
          const settingsId = track?.getSettings?.().deviceId;
          if (settingsId) setVideoDeviceId(settingsId);
          try {
            const all = await navigator.mediaDevices.enumerateDevices();
            setVideoDevices(all.filter((d) => d.kind === "videoinput"));
          } catch {
            /* ignore */
          }
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setCameraError("");
          return;
        } catch (err) {
          lastErr = err;
          stopCamera();
        }
      }

      const name = lastErr instanceof DOMException ? lastErr.name : "";
      const raw =
        lastErr instanceof Error
          ? lastErr.message
          : "Não foi possível abrir a câmera.";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError(
          "Permissão da câmera negada. No Chrome: ícone de cadeado na barra de endereço → Câmera → Permitir."
        );
      } else if (name === "NotFoundError") {
        setCameraError("Nenhuma câmera encontrada. Use o botão «PDF».");
      } else if (
        name === "NotReadableError" ||
        /could not start video source/i.test(raw)
      ) {
        setCameraError(
          "A câmera está em uso ou indisponível. Feche Teams, Zoom, Skype ou o app Câmera do Windows e tente de novo. Ou use «PDF»."
        );
      } else {
        setCameraError(
          "Não foi possível abrir a câmera neste computador. Use «PDF» para enviar o comprovante."
        );
      }
    },
    [facingMode, stopCamera, videoDeviceId]
  );

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      return;
    }
    void startCamera();
    return () => stopCamera();
    // Só reabre ao abrir o modal — troca de câmera chama startCamera direto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  const switchCamera = () => {
    setCameraError("");
    if (videoDevices.length >= 2) {
      const ids = videoDevices.map((d) => d.deviceId);
      const current = videoDeviceId || ids[0];
      const idx = Math.max(0, ids.indexOf(current));
      const nextId = ids[(idx + 1) % ids.length];
      setVideoDeviceId(nextId);
      void startCamera({ deviceId: nextId });
      return;
    }
    // Uma só câmera no PC: avisa. No celular tenta facingMode.
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isMobile) {
      setCameraError(
        "Só há uma câmera neste computador — não é possível virar."
      );
      return;
    }
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    setVideoDeviceId(null);
    void startCamera({ deviceId: null, facing: nextFacing });
  };

  const applyAi = (r: AiReceiptResult) => {
    setAiResult(r);
    setAmount(r.amount != null ? String(r.amount).replace(".", ",") : "");
    if (r.date) setDate(r.date);
    setType(r.type);
    setCategory(r.category);
    setDescription(r.description);
    // Despesa: marcado por padrão (negócio). Desmarca só se categoria for pessoal.
    if (r.type === "despesa") {
      setIsDeductible(!/pessoal|saúde|saude/i.test(r.category));
    } else {
      setIsDeductible(false);
    }
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
    const lowMem = isLowMemoryPhone();

    try {
      let prepared = file;

      // Em aparelhos com pouca RAM: não decodificar a imagem no browser
      // (o servidor reduz). Em PC/iPhone: comprimir antes de enviar.
      if (!lowMem && !isPdf) {
        prepared = await prepareUploadFile(file);
      }

      if (
        !lowMem &&
        (prepared.type.startsWith("image/") || prepared.type === "image/jpeg")
      ) {
        const url = URL.createObjectURL(prepared);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        setPreview(null);
      }

      const form = new FormData();
      form.append("file", prepared, prepared.name || file.name);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const rawText = await res.text();
      let data: AiReceiptResult | null = null;
      try {
        data = JSON.parse(rawText) as AiReceiptResult;
      } catch {
        throw new Error(
          "Não foi possível ler o comprovante. Confira os campos e salve."
        );
      }

      if (!data) {
        throw new Error(
          "Não foi possível ler o comprovante. Confira os campos e salve."
        );
      }

      applyAi(data);
      // Se não leu valor, avisa de forma clara (sem jargão técnico)
      if (data.amount == null || data.confidence === 0) {
        setError(
          data.message ||
            "Não foi possível ler o valor automaticamente. Confira e preencha os campos."
        );
      } else {
        setError("");
      }
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
          "Memória insuficiente neste aparelho. Feche outros apps e use «Tirar foto», ou envie o PDF pelo computador."
        );
      } else {
        setError(msg);
      }
      // Abre formulário vazio para preencher (não usa nome do arquivo como dados)
      applyAi({
        amount: null,
        date: new Date().toISOString().slice(0, 10),
        type: "despesa",
        category: "Outras despesas",
        description: "",
        is_deductible: true,
        confidence: 0,
        source: "mock",
      });
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
    // Captura já em tamanho leve (A15: 960 px)
    const maxSide = isLowMemoryPhone() ? 960 : 1280;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
      0.7
    );
  };

  const openNativeCamera = () => {
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    // Android com pouca RAM: câmera nativa (12 MP) estoura memória → câmera leve no app
    if (isLowMemoryPhone()) {
      setFacingMode("environment");
      setCameraOpen(true);
      return;
    }
    // Celular com RAM ok: câmera nativa
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }
    // PC: webcam frontal (user) — "environment" falha na maioria dos notebooks
    setFacingMode("user");
    setCameraOpen(true);
  };

  const onSave = () => {
    setError("");
    const amountNum = Number(amount.replace(/\./g, "").replace(",", ".")) || 0;
    if (amountNum <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    // Despesa: pergunta se é fixa / parcelada antes de gravar
    if (type === "despesa") {
      setRecurringMode("once");
      setInstallments("12");
      setRecurringPromptOpen(true);
      return;
    }
    void commitSave("once");
  };

  const commitSave = async (mode: RecurringPromptMode) => {
    setSaving(true);
    setError("");
    setRecurringPromptOpen(false);
    try {
      const amountNum =
        Number(amount.replace(/\./g, "").replace(",", ".")) || 0;
      if (amountNum <= 0) {
        setError("Informe um valor válido.");
        return;
      }

      const desc = description || fileName || "Comprovante";
      const ym = yearMonthKey(
        new Date(date.length === 10 ? date + "T12:00:00" : date)
      );
      const day = dayFromIsoDate(date);

      let recurringId: string | null = null;
      const cleanDesc = desc
        .replace(/\s*\(fixa\)\s*$/i, "")
        .replace(/\s*\(anual\)\s*$/i, "")
        .replace(/\s*\(\d+\/\d+\)\s*$/i, "")
        .trim();

      if (type === "despesa" && mode === "monthly") {
        const rule = addRecurring({
          description: cleanDesc,
          amount: amountNum,
          day_of_month: day,
          month_of_year: null,
          frequency: "monthly",
          category,
          is_deductible: isDeductible,
          active: true,
          installments_total: null,
          installments_generated: 1,
          last_generated_ym: ym,
        });
        recurringId = rule.id;
      }

      if (type === "despesa" && mode === "yearly") {
        const rule = addRecurring({
          description: cleanDesc,
          amount: amountNum,
          day_of_month: day,
          month_of_year: monthFromIsoDate(date),
          frequency: "yearly",
          category,
          is_deductible: isDeductible,
          active: true,
          installments_total: null,
          installments_generated: 1,
          last_generated_ym: ym,
        });
        recurringId = rule.id;
      }

      if (type === "despesa" && mode === "installments") {
        const n = Math.min(48, Math.max(2, Math.floor(Number(installments) || 2)));
        const rule = addRecurring({
          description: cleanDesc,
          amount: amountNum,
          day_of_month: day,
          month_of_year: null,
          frequency: "monthly",
          category,
          is_deductible: isDeductible,
          active: n > 1,
          installments_total: n,
          installments_generated: 1,
          last_generated_ym: ym,
        });
        recurringId = rule.id;
      }

      const parcelNote =
        mode === "installments"
          ? ` (1/${Math.min(48, Math.max(2, Math.floor(Number(installments) || 2)))})`
          : mode === "monthly"
            ? " (fixa)"
            : mode === "yearly"
              ? " (anual)"
              : "";

      addTransaction({
        date,
        amount: amountNum,
        type,
        category,
        description: `${desc}${parcelNote}`,
        receipt_url: preview,
        ai_confidence: aiResult?.confidence ?? null,
        is_deductible: type === "despesa" ? isDeductible : false,
        source: recurringId ? "recorrente" : "upload",
        recurring_id: recurringId,
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
          Tire uma foto ou envie um PDF. A leitura preenche valor, data e
          categoria — confira e salve.
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
      {/* Só PDF — sem câmera no seletor (Windows/Android mostram câmera se aceitar image/*) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="application/pdf,.pdf"
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
                  Otimizando a foto e lendo o comprovante…
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pode levar alguns segundos no celular
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
                  Foto pela câmera ou arquivo PDF do comprovante
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
                <FileUp className="h-4 w-4" />
                PDF
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
                onClick={switchCamera}
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

      {/* Pergunta: despesa fixa / parcelada */}
      {recurringPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              Esta despesa se repete?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Para o lucro do mês e o CSV do contador: o valor lançado é o que
              saiu (anual = valor cheio 1× no ano, não divide por 12).
            </p>
            <div className="mt-4 space-y-2">
              {(
                [
                  {
                    id: "once" as const,
                    title: "Não, só esta vez",
                    desc: "Lança só este comprovante",
                  },
                  {
                    id: "monthly" as const,
                    title: "Sim, todo mês",
                    desc: "Assinatura até você pausar",
                  },
                  {
                    id: "installments" as const,
                    title: "Sim, no cartão em parcelas",
                    desc: "Indique só o número de parcelas",
                  },
                  {
                    id: "yearly" as const,
                    title: "Sim, todo ano",
                    desc: "Valor anual cheio no mês do pagamento",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecurringMode(opt.id)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                    recurringMode === opt.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                  <p className="text-xs text-slate-600">{opt.desc}</p>
                </button>
              ))}
            </div>
            {recurringMode === "installments" && (
              <div className="mt-4">
                <Label htmlFor="parcels">Número de parcelas</Label>
                <Input
                  id="parcels"
                  type="number"
                  min={2}
                  max={48}
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Cada mês entra 1 parcela com o mesmo valor do comprovante.
                </p>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="w-full"
                disabled={saving}
                onClick={() => void commitSave(recurringMode)}
              >
                {saving ? "Salvando…" : "Confirmar e salvar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={saving}
                onClick={() => setRecurringPromptOpen(false)}
              >
                Voltar
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
            {aiResult && aiResult.amount != null && aiResult.confidence > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Dados lidos do comprovante. Confira antes de salvar.
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
                    setIsDeductible(t === "despesa");
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
                  onChange={(e) => {
                    const cat = e.target.value;
                    setCategory(cat);
                    if (type === "despesa") {
                      setIsDeductible(!/pessoal|saúde|saude/i.test(cat));
                    }
                  }}
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
                <span>
                  <span className="font-medium text-slate-800">
                    Gasto do negócio (MEI)
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    Desmarque se for despesa pessoal
                  </span>
                </span>
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
            setIsDeductible(true);
            setAiResult({
              amount: null,
              date: new Date().toISOString().slice(0, 10),
              type: "despesa",
              category: "Outras despesas",
              description: "",
              is_deductible: true,
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

/** Galaxy A15 e Androids com pouca RAM (~4 GB ou menos). */
function isLowMemoryPhone(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const android = /Android/i.test(ua);
  const samsungA = /SM-A1[0-9]|Galaxy A1[0-9]|A15/i.test(ua);
  // deviceMemory is Chrome-only (GiB)
  const mem =
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory ===
    "number"
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory!
      : null;
  if (samsungA) return true;
  if (android && mem !== null && mem <= 4) return true;
  if (android && mem === null) return true; // Android sem API: assume frágil
  return false;
}

/**
 * Reduz foto de celular ANTES da análise (PCs / iPhones com RAM ok).
 * No Android fraco NÃO usamos isto — o servidor (sharp) reduz.
 */
async function prepareUploadFile(file: File): Promise<File> {
  const looksImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name) ||
    !file.type; // alguns Android mandam type vazio na câmera
  if (!looksImage) return file;
  // Já bem leve
  if (file.size > 0 && file.size < 450_000 && file.type === "image/jpeg") {
    return file;
  }

  const attempts: { maxSide: number; quality: number }[] = [
    { maxSide: 1280, quality: 0.68 },
    { maxSide: 1024, quality: 0.58 },
    { maxSide: 800, quality: 0.5 },
    { maxSide: 640, quality: 0.45 },
  ];

  let lastError: unknown;
  for (const { maxSide, quality } of attempts) {
    try {
      const compressed = await compressImageFile(file, maxSide, quality);
      if (compressed) return compressed;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Não foi possível otimizar a foto neste celular. Feche outros apps e tire de novo só o trecho do valor."
      );
}

async function compressImageFile(
  file: File,
  maxSide: number,
  quality: number
): Promise<File | null> {
  let bitmap: ImageBitmap | null = null;
  try {
    // Preferir resize no decode (muito menos RAM)
    try {
      bitmap = await createImageBitmap(file, {
        resizeWidth: maxSide,
        resizeQuality: "low",
      } as ImageBitmapOptions);
    } catch {
      bitmap = await createImageBitmap(file);
    }

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    bitmap = null;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    // Libera canvas da GPU/RAM o quanto antes
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return null;

    return new File([blob], `comprovante-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  } finally {
    if (bitmap) bitmap.close();
  }
}
