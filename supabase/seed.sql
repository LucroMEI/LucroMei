-- ============================================================
-- LucroMEI — Categorias padrão do Brasil (sistema)
-- ============================================================

insert into public.categories (user_id, name, type, icon, is_system, is_deductible_default) values
  (null, 'Vendas / Serviços', 'receita', 'briefcase', true, false),
  (null, 'Recebimentos PIX', 'receita', 'smartphone', true, false),
  (null, 'Outras receitas', 'receita', 'plus-circle', true, false),
  (null, 'Material / Insumos', 'despesa', 'package', true, true),
  (null, 'Combustível / Transporte', 'despesa', 'car', true, true),
  (null, 'Alimentação (trabalho)', 'despesa', 'utensils', true, true),
  (null, 'Internet / Telefone', 'despesa', 'wifi', true, true),
  (null, 'Aluguel / Coworking', 'despesa', 'building', true, true),
  (null, 'Software / Assinaturas', 'despesa', 'monitor', true, true),
  (null, 'Marketing / Anúncios', 'despesa', 'megaphone', true, true),
  (null, 'Equipamentos', 'despesa', 'cpu', true, true),
  (null, 'Impostos / DAS', 'despesa', 'landmark', true, false),
  (null, 'Contador / Serviços', 'despesa', 'user-check', true, true),
  (null, 'Saúde', 'despesa', 'heart', true, false),
  (null, 'Pessoal (não dedutível)', 'despesa', 'user', true, false),
  (null, 'Outras despesas', 'despesa', 'more-horizontal', true, false)
on conflict do nothing;
