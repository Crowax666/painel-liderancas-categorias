-- Rode este SQL no Supabase antes de publicar esta versão.
-- Ele adiciona a categoria/cor do pin na tabela de lideranças.

alter table public.liderancas
add column if not exists categoria text not null default 'vermelho-politicos';

alter table public.liderancas
add constraint liderancas_categoria_check
check (
  categoria in (
    'vermelho-politicos',
    'amarelo-publicos',
    'azul-entidades',
    'verde-produtores',
    'branco-empresarios',
    'preto-esportivas'
  )
) not valid;

alter table public.liderancas validate constraint liderancas_categoria_check;
