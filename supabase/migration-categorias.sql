-- Rode este SQL no Supabase antes de publicar esta versão.
-- Ele adiciona categoria/cor do pin e meta manual por liderança.

alter table public.liderancas
add column if not exists categoria text not null default 'vermelho-politicos';

alter table public.liderancas
add column if not exists meta_votos integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'liderancas_categoria_check'
  ) then
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
    );
  end if;
end $$;
