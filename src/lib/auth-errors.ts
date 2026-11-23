/** Traduz erros do Supabase para PT-BR curto. */
export function authErrorMessage(err: unknown, fallback: string): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  const m = raw.toLowerCase();

  if (/already registered|already been registered|user already exists/.test(m)) {
    return "Este e-mail já tem conta. Entra com a senha ou toca em Esqueci a senha.";
  }
  if (/invalid login credentials/.test(m)) {
    return "E-mail ou senha não conferem.";
  }
  if (/email not confirmed/.test(m)) {
    return "Confirma o e-mail e tenta de novo.";
  }
  if (/password/.test(m) && /6|least|mínimo|minimo/.test(m)) {
    return "Senha deve ter pelo menos 6 caracteres.";
  }
  if (/rate limit|too many/.test(m)) {
    return "Muitas tentativas. Espera um minuto e tenta de novo.";
  }
  if (/invalid email|unable to validate/.test(m)) {
    return "Esse e-mail não parece válido. Confere e tenta de novo.";
  }
  if (/signup is disabled/.test(m)) {
    return "Cadastro temporariamente fechado. Tenta de novo em instantes.";
  }
  if (/network|failed to fetch/.test(m)) {
    return "Sem conexão. Confere a internet e tenta de novo.";
  }
  if (raw && /[áàãâéêíóôõúç]/i.test(raw)) {
    return raw;
  }
  return fallback;
}

/** Tipo curto do erro (para Analytics; nunca inclui dados do utilizador). */
export function authErrorType(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  const m = raw.toLowerCase();
  if (/already registered|already been registered|user already exists/.test(m)) {
    return "email_ja_cadastrado";
  }
  if (/password/.test(m) && /6|least|mínimo|minimo|weak/.test(m)) return "senha_fraca";
  if (/rate limit|too many/.test(m)) return "muitas_tentativas";
  if (/invalid email|unable to validate/.test(m)) return "email_invalido";
  if (/signup is disabled/.test(m)) return "cadastro_desativado";
  if (/network|failed to fetch|lento|timeout/.test(m)) return "rede";
  if (/email not confirmed/.test(m)) return "email_nao_confirmado";
  return "outro";
}
