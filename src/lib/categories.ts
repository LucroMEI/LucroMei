import type { Category } from "./types";

/** Categorias padrão usadas no MVP (offline / seed em memória). */
export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { user_id: null, name: "Vendas / Serviços", type: "receita", icon: "briefcase", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Recebimentos PIX", type: "receita", icon: "smartphone", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Outras receitas", type: "receita", icon: "plus-circle", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Material / Insumos", type: "despesa", icon: "package", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Combustível / Transporte", type: "despesa", icon: "car", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Alimentação (trabalho)", type: "despesa", icon: "utensils", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Internet / Telefone", type: "despesa", icon: "wifi", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Aluguel / Coworking", type: "despesa", icon: "building", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Software / Assinaturas", type: "despesa", icon: "monitor", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Marketing / Anúncios", type: "despesa", icon: "megaphone", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Equipamentos", type: "despesa", icon: "cpu", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Impostos / DAS", type: "despesa", icon: "landmark", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Contador / Serviços", type: "despesa", icon: "user-check", is_system: true, is_deductible_default: true },
  { user_id: null, name: "Saúde", type: "despesa", icon: "heart", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Pessoal (não dedutível)", type: "despesa", icon: "user", is_system: true, is_deductible_default: false },
  { user_id: null, name: "Outras despesas", type: "despesa", icon: "more-horizontal", is_system: true, is_deductible_default: false },
];

export const CATEGORY_NAMES = DEFAULT_CATEGORIES.map((c) => c.name);

export function isDeductibleDefault(category: string): boolean {
  const found = DEFAULT_CATEGORIES.find((c) => c.name === category);
  return found?.is_deductible_default ?? false;
}
