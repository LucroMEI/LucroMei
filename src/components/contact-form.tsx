"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AtSign, Mail, MessageCircle } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("duvida");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const assunto =
      subject === "suporte"
        ? "Suporte LucroMEI"
        : subject === "assinatura"
          ? "Assinatura / cancelamento"
          : subject === "lgpd"
            ? "Privacidade / LGPD"
            : subject === "parceria"
              ? "Parceria"
              : subject === "teste20"
                ? "Quero ser um dos 20 testes"
                : "Dúvida LucroMEI";

    const body = [
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Assunto: ${assunto}`,
      "",
      message,
    ].join("\n");

    const mailto = `mailto:contato.lucromei@gmail.com?subject=${encodeURIComponent(
      `[LucroMEI] ${assunto}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-start gap-3">
            <AtSign className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Instagram</p>
              <a
                href="https://www.instagram.com/lucromei.oficial"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-emerald-700 hover:underline"
              >
                @lucromei.oficial
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Melhor canal para os primeiros testes e DMs.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">E-mail</p>
              <a
                href="mailto:contato.lucromei@gmail.com"
                className="text-sm text-emerald-700 hover:underline"
              >
                contato.lucromei@gmail.com
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Você pode trocar por e-mail com domínio próprio depois.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Documentos</p>
              <div className="mt-1 flex flex-col gap-1 text-sm">
                <Link href="/faq" className="text-emerald-700 hover:underline">
                  FAQ — dúvidas frequentes
                </Link>
                <Link href="/termos" className="text-emerald-700 hover:underline">
                  Termos e vendas
                </Link>
                <Link href="/privacidade" className="text-emerald-700 hover:underline">
                  Privacidade (LGPD)
                </Link>
                <Link
                  href="/confidencialidade"
                  className="text-emerald-700 hover:underline"
                >
                  Confidencialidade
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="pt-5">
          <h2 className="text-lg font-semibold text-slate-900">Envie uma mensagem</h2>
          <p className="mt-2 text-[15px] text-slate-700">
            O formulário abre o app de e-mail do seu aparelho com a mensagem pronta.
            Se preferir, mande DM no Instagram.
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              Se o e-mail não abriu, escreva para{" "}
              <strong>contato.lucromei@gmail.com</strong> ou fale no Instagram{" "}
              <strong>@lucromei.oficial</strong>. Obrigada!
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="duvida">Dúvida geral</option>
                  <option value="suporte">Suporte / problema no app</option>
                  <option value="assinatura">Assinatura / cancelamento</option>
                  <option value="lgpd">Privacidade / LGPD / dados</option>
                  <option value="parceria">Parceria / imprensa</option>
                  <option value="teste20">Quero ser um dos 20 testes</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Enviar mensagem
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
