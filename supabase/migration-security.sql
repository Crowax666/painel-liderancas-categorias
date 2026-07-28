-- Migracao de seguranca para uma instalacao existente.
-- IMPORTANTE: leia supabase/SECURITY-DEPLOYMENT.md e tenha o UUID do primeiro administrador.

alter table public.campanhas add column if not exists vac integer not null default 200000;
alter table public.campanhas add column if not exists vvt integer not null default 0;
alter table public.campanhas add column if not exists nv integer not null default 1;
alter table public.campanhas add column if not exists updated_at timestamptz not null default now();

alter table public.regionais add column if not exists updated_at timestamptz not null default now();

alter table public.liderancas add column if not exists rua text;
alter table public.liderancas add column if not exists dobrada text;
alter table public.liderancas add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.liderancas add column if not exists updated_at timestamptz not null default now();

create table if not exists public.campanha_membros (
  campanha_id uuid not null references public.campanhas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'leitor' check (papel in ('admin', 'editor', 'leitor')),
  created_at timestamptz not null default now(),
  primary key (campanha_id, user_id)
);

-- Antes de ativar as politicas abaixo, cadastre o primeiro administrador:
-- insert into public.campanha_membros (campanha_id, user_id, papel)
-- values ('UUID-DA-CAMPANHA', 'UUID-DO-USUARIO-AUTH', 'admin')
-- on conflict (campanha_id, user_id) do update set papel = excluded.papel;

-- As definicoes canonicas de funcoes, gatilhos e politicas estao em schema.sql.
-- Depois do bootstrap acima, execute schema.sql para finalizar e validar toda a estrutura.
