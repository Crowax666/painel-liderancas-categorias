-- Canonical Supabase schema for the leadership panel.
create extension if not exists pgcrypto;

create table if not exists public.campanhas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  candidato text not null,
  partido text,
  vac integer not null default 200000 check (vac >= 0),
  vvt integer not null default 0 check (vvt >= 0),
  nv integer not null default 1 check (nv > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.regionais (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.campanhas(id) on delete cascade,
  nome text not null,
  mapa text not null check (mapa in ('curitiba', 'parana')),
  codigo text not null,
  lat numeric,
  lng numeric,
  cor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campanha_id, mapa, codigo)
);

create table if not exists public.liderancas (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.campanhas(id) on delete cascade,
  regional_id uuid references public.regionais(id) on delete set null,
  nome text not null,
  rua text,
  local text,
  whatsapp text,
  responsavel text,
  observacao text,
  dobrada text,
  lat numeric check (lat is null or lat between -90 and 90),
  lng numeric check (lng is null or lng between -180 and 180),
  mapa text not null default 'curitiba' check (mapa in ('curitiba', 'parana')),
  fel numeric not null default 1 check (fel > 0),
  meta_votos integer check (meta_votos is null or meta_votos >= 0),
  votos_atuais integer not null default 0 check (votos_atuais >= 0),
  categoria text not null default 'vermelho-politicos' check (categoria in (
    'vermelho-politicos','amarelo-publicos','azul-entidades',
    'verde-produtores','branco-empresarios','preto-esportivas'
  )),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campanha_membros (
  campanha_id uuid not null references public.campanhas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'leitor' check (papel in ('admin','editor','leitor')),
  created_at timestamptz not null default now(),
  primary key (campanha_id, user_id)
);

create index if not exists regionais_campanha_idx on public.regionais(campanha_id);
create index if not exists liderancas_campanha_idx on public.liderancas(campanha_id);
create index if not exists membros_usuario_idx on public.campanha_membros(user_id);

create or replace function public.atualizar_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists campanhas_updated_at on public.campanhas;
create trigger campanhas_updated_at before update on public.campanhas
for each row execute function public.atualizar_updated_at();
drop trigger if exists regionais_updated_at on public.regionais;
create trigger regionais_updated_at before update on public.regionais
for each row execute function public.atualizar_updated_at();
drop trigger if exists liderancas_updated_at on public.liderancas;
create trigger liderancas_updated_at before update on public.liderancas
for each row execute function public.atualizar_updated_at();

create or replace function public.papel_na_campanha(alvo uuid)
returns text language sql stable security definer set search_path = public as $$
  select papel from public.campanha_membros
  where campanha_id = alvo and user_id = auth.uid() limit 1;
$$;
revoke all on function public.papel_na_campanha(uuid) from public;
grant execute on function public.papel_na_campanha(uuid) to authenticated;

alter table public.campanhas enable row level security;
alter table public.regionais enable row level security;
alter table public.liderancas enable row level security;
alter table public.campanha_membros enable row level security;

drop policy if exists campanhas_select_membro on public.campanhas;
create policy campanhas_select_membro on public.campanhas for select to authenticated
using (public.papel_na_campanha(id) is not null);
drop policy if exists campanhas_update_admin on public.campanhas;
create policy campanhas_update_admin on public.campanhas for update to authenticated
using (public.papel_na_campanha(id) = 'admin')
with check (public.papel_na_campanha(id) = 'admin');

drop policy if exists regionais_select_membro on public.regionais;
create policy regionais_select_membro on public.regionais for select to authenticated
using (public.papel_na_campanha(campanha_id) is not null);
drop policy if exists regionais_insert_editor on public.regionais;
create policy regionais_insert_editor on public.regionais for insert to authenticated
with check (public.papel_na_campanha(campanha_id) in ('admin','editor'));
drop policy if exists regionais_update_editor on public.regionais;
create policy regionais_update_editor on public.regionais for update to authenticated
using (public.papel_na_campanha(campanha_id) in ('admin','editor'))
with check (public.papel_na_campanha(campanha_id) in ('admin','editor'));
drop policy if exists regionais_delete_admin on public.regionais;
create policy regionais_delete_admin on public.regionais for delete to authenticated
using (public.papel_na_campanha(campanha_id) = 'admin');

drop policy if exists liderancas_select_membro on public.liderancas;
create policy liderancas_select_membro on public.liderancas for select to authenticated
using (public.papel_na_campanha(campanha_id) is not null);
drop policy if exists liderancas_insert_editor on public.liderancas;
create policy liderancas_insert_editor on public.liderancas for insert to authenticated
with check (public.papel_na_campanha(campanha_id) in ('admin','editor') and created_by = auth.uid());
drop policy if exists liderancas_update_editor on public.liderancas;
create policy liderancas_update_editor on public.liderancas for update to authenticated
using (public.papel_na_campanha(campanha_id) in ('admin','editor'))
with check (public.papel_na_campanha(campanha_id) in ('admin','editor'));
drop policy if exists liderancas_delete_admin on public.liderancas;
create policy liderancas_delete_admin on public.liderancas for delete to authenticated
using (public.papel_na_campanha(campanha_id) = 'admin');

drop policy if exists membros_select_proprio_ou_admin on public.campanha_membros;
create policy membros_select_proprio_ou_admin on public.campanha_membros for select to authenticated
using (user_id = auth.uid() or public.papel_na_campanha(campanha_id) = 'admin');
drop policy if exists membros_admin_all on public.campanha_membros;
create policy membros_admin_all on public.campanha_membros for all to authenticated
using (public.papel_na_campanha(campanha_id) = 'admin')
with check (public.papel_na_campanha(campanha_id) = 'admin');
