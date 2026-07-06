-- Rode este SQL no Supabase antes de publicar esta versão (se o banco já existir).
-- O componente PainelLiderancas.jsx grava e lê o campo "mapa" em cada liderança
-- (curitiba/parana), mas essa coluna não existia no schema original.

alter table public.liderancas
add column if not exists mapa text not null default 'curitiba';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'liderancas_mapa_check'
  ) then
    alter table public.liderancas
    add constraint liderancas_mapa_check
    check (mapa in ('curitiba', 'parana'));
  end if;
end $$;

-- Opcional: preenche o mapa das lideranças já cadastradas a partir da regional vinculada,
-- para os registros que ficaram com o valor padrão 'curitiba' por engano.
update public.liderancas l
set mapa = r.mapa
from public.regionais r
where l.regional_id = r.id
  and l.mapa is distinct from r.mapa;
