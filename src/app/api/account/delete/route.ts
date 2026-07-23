import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Exclui a conta do utilizador autenticado (Auth + user_settings).
 * Requer SUPABASE_SERVICE_ROLE_KEY no servidor.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { confirm?: string };
    if (body.confirm !== "EXCLUIR") {
      return NextResponse.json(
        { error: "Confirmação inválida. Envie confirm: EXCLUIR" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Faça login para excluir a conta." }, { status: 401 });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Exclusão de conta indisponível no servidor (falta SUPABASE_SERVICE_ROLE_KEY).",
        },
        { status: 503 }
      );
    }

    const admin = createAdminClient();

    // Dados da app (se a tabela existir e RLS/service role permitir)
    const { error: settingsErr } = await admin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id);
    if (settingsErr) {
      console.error("[account.delete] user_settings", settingsErr.message);
      // continua — o importante é apagar o auth user
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error("[account.delete] auth", delErr.message);
      return NextResponse.json(
        { error: delErr.message || "Não foi possível excluir a conta." },
        { status: 500 }
      );
    }

    // Encerra sessão local
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account.delete]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao excluir conta" },
      { status: 500 }
    );
  }
}
