import type { Metadata } from "next";
import { LegalShell, H2, P, Ul } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Política de Privacidade (LGPD)",
  description:
    "Como o LucroMEI coleta, usa e protege dados pessoais de MEIs e freelancers.",
};

export default function PrivacidadePage() {
  return (
    <LegalShell
      title="Política de Privacidade"
      subtitle="Última atualização: 15 de julho de 2026 · Em conformidade com a LGPD (Lei nº 13.709/2018)"
    >
      <section>
        <H2>1. Controlador</H2>
        <P>
          O controlador dos dados pessoais tratados no LucroMEI é{" "}
          <strong>Sandra Tavares</strong>, responsável pelo produto. Contato: página{" "}
          <a href="/contato" className="text-emerald-700 underline">
            Contato
          </a>{" "}
          ou Instagram{" "}
          <a
            href="https://www.instagram.com/lucromei.oficial"
            className="text-emerald-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            @lucromei.oficial
          </a>
          .
        </P>
      </section>

      <section>
        <H2>2. Quais dados coletamos</H2>
        <Ul
          items={[
            "Cadastro: nome, e-mail e, se informado, cidade/UF, CNPJ e preferências de MEI",
            "Dados financeiros que você envia: valores, datas, categorias, descrições, comprovantes (foto/PDF)",
            "Dados de uso: páginas acessadas, dispositivo/navegador, logs técnicos de erro",
            "Pagamento: processados pela Stripe (não armazenamos o número completo do cartão)",
            "Comunicações: mensagens que você nos envia por e-mail, formulário ou redes sociais",
          ]}
        />
      </section>

      <section>
        <H2>3. Bases legais e finalidades (LGPD)</H2>
        <P>Tratamos dados para:</P>
        <Ul
          items={[
            "Executar o contrato de prestação do serviço (organizar finanças, dashboard, alertas)",
            "Processar assinaturas e faturamento (legítimo interesse / execução contratual)",
            "Melhorar o produto e a IA de categorização (legítimo interesse, com minimização)",
            "Cumprir obrigações legais e responder a autoridades, quando exigido",
            "Comunicar sobre a conta, segurança e mudanças relevantes do serviço",
          ]}
        />
      </section>

      <section>
        <H2>4. Compartilhamento com terceiros</H2>
        <P>Não vendemos seus dados. Podemos compartilhar com:</P>
        <Ul
          items={[
            "Stripe — pagamentos e gestão de assinatura",
            "Supabase (quando ativado) — autenticação, banco de dados e armazenamento de arquivos",
            "Provedor de IA (ex.: xAI) — análise de comprovantes que você envia para categorização",
            "Hospedagem (ex.: Vercel) — operação do site e logs técnicos",
          ]}
        />
        <P>
          Esses fornecedores tratam dados conforme suas próprias políticas e contratos
          de processamento, no mínimo necessário para a finalidade.
        </P>
      </section>

      <section>
        <H2>5. Transferência internacional</H2>
        <P>
          Alguns provedores podem processar dados fora do Brasil. Nesses casos, buscamos
          salvaguardas adequadas previstas na LGPD e nas políticas dos fornecedores.
        </P>
      </section>

      <section>
        <H2>6. Seus direitos</H2>
        <P>Nos termos da LGPD, você pode solicitar:</P>
        <Ul
          items={[
            "Confirmação de tratamento e acesso aos dados",
            "Correção de dados incompletos ou desatualizados",
            "Anonimização, bloqueio ou eliminação de dados desnecessários",
            "Portabilidade, quando aplicável",
            "Informação sobre compartilhamentos",
            "Revogação de consentimento, quando essa for a base legal",
            "Oposição a tratamentos indevidos",
          ]}
        />
        <P>
          Para exercer direitos, use a página Contato. Responderemos em prazo razoável,
          conforme a lei.
        </P>
      </section>

      <section>
        <H2>7. Retenção</H2>
        <P>
          Mantemos dados enquanto a conta estiver ativa e pelo tempo necessário após o
          encerramento para: prestação de contas, obrigações legais, defesa em
          processos e resolução de disputas. Comprovantes e lançamentos podem ser
          excluídos mediante solicitação, salvo retenção legal obrigatória.
        </P>
      </section>

      <section>
        <H2>8. Segurança</H2>
        <P>
          Adotamos medidas técnicas e organizacionais razoáveis: HTTPS, controle de
          acesso, e boas práticas de desenvolvimento. Nenhum sistema é 100% isento de
          risco; pedimos que você também proteja suas senhas e dispositivos.
        </P>
      </section>

      <section>
        <H2>9. Cookies e tecnologias similares</H2>
        <P>
          Podemos usar cookies essenciais (sessão, autenticação) e, futuramente,
          cookies de analytics. Você pode controlar cookies no navegador; a
          desativação de cookies essenciais pode impedir o login.
        </P>
      </section>

      <section>
        <H2>10. Menores</H2>
        <P>
          O serviço não se destina a menores de 18 anos. Se tomarmos conhecimento de
          cadastro indevido, poderemos excluir a conta.
        </P>
      </section>

      <section>
        <H2>11. Alterações</H2>
        <P>
          Esta política pode ser atualizada. A data no topo da página será revisada.
          Alterações relevantes poderão ser comunicadas no app ou por e-mail, quando
          houver.
        </P>
      </section>

      <section>
        <H2>12. Confidencialidade</H2>
        <P>
          Detalhes adicionais sobre sigilo de informações financeiras e comprovantes
          estão na{" "}
          <a href="/confidencialidade" className="text-emerald-700 underline">
            Política de Confidencialidade
          </a>
          .
        </P>
      </section>
    </LegalShell>
  );
}
