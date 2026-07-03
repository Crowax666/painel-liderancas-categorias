-- Modelo inicial para quando você quiser tirar do localStorage e salvar no Supabase.
create table if not exists campanhas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  candidato text not null,
  partido text,
  created_at timestamptz default now()
);

create table if not exists regionais (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid references campanhas(id) on delete cascade,
  nome text not null,
  mapa text not null check (mapa in ('curitiba', 'parana')),
  codigo text not null,
  lat numeric,
  lng numeric,
  cor text,
  created_at timestamptz default now()
);

create table if not exists liderancas (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid references campanhas(id) on delete cascade,
  regional_id uuid references regionais(id),
  nome text not null,
  local text,
  whatsapp text,
  responsavel text,
  observacao text,
  lat numeric,
  lng numeric,
  fel numeric default 1,
  votos_atuais integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table campanhas enable row level security;
alter table regionais enable row level security;
alter table liderancas enable row level security;
