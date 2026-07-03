# Painel de Lideranças Supabase — categorias, mobile e meta manual

Projeto Next.js conectado ao Supabase, com login, mapa, categorias de pin, exportação CSV/Excel e layout responsivo.

## Atualizações desta versão

- Pins do mapa renderizados em SVG para manter as cores no desktop, iPad e mobile.
- Cards de lideranças mostram a cor da categoria cadastrada.
- WhatsApp com máscara automática `(xx) xxxxx-xxxx`.
- Meta de cada liderança em campo manual: `Meta manual de votos previstos`.
- Exportação Excel/CSV com: Nome, Bairro, Cidade, Regional, Nome da categoria, Descrição da categoria, Quantidade de votos previstos, Quantidade de votos alcançados.

## SQL obrigatório antes do deploy

Rode no Supabase SQL Editor:

```sql
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
```

## Variáveis na Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CAMPANHA_ID=6d493722-17d8-4ea2-a488-d1c12d399372
```

## Deploy

Root Directory vazio se `package.json` estiver na raiz do GitHub.

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

## Atualização: botão Voltar no cadastro

Esta versão adiciona o botão **Voltar** no formulário de cadastro/edição de liderança, mantendo também **Salvar**, **Cancelar** e **Excluir** quando estiver editando uma liderança existente.
