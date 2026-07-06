# Painel de Lideranças Supabase — categorias, mobile e meta manual

Projeto Next.js conectado ao Supabase, com login, mapa, categorias de pin, exportação CSV/Excel e layout responsivo.

## Atualizações desta versão

- Pins do mapa renderizados em SVG para manter as cores no desktop, iPad e mobile.
- Cards de lideranças mostram a cor da categoria cadastrada.
- WhatsApp com máscara automática `(xx) xxxxx-xxxx`.
- Meta de cada liderança em campo manual: `Meta manual de votos previstos`.
- Exportação Excel/CSV com: Nome, Bairro, Cidade, Regional, Nome da categoria, Descrição da categoria, Quantidade de votos previstos, Quantidade de votos alcançados.

## SQL obrigatório antes do deploy

Rode no Supabase SQL Editor (nesta ordem, se o banco já existir):

```sql
-- ver também supabase/migration-mapa.sql
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
```

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

## Mapa base mais legível e localização automática por nome

- O mapa (Leaflet) agora usa o estilo **CARTO Positron** (`light_all`), mais limpo e com melhor contraste para os pins coloridos. Não precisa de chave de API — é gratuito, como o anterior. Para trocar de estilo depois, basta editar a constante `TILE_URL` no topo de `components/PainelLiderancas.jsx` (outras opções gratuitas do CARTO: `rastertiles/voyager` para o estilo antigo, ou `dark_all` para um mapa escuro).
- No formulário de nova liderança/edição, ao digitar em **"Bairro / cidade"** e sair do campo (ou clicar em **"📍 Localizar no mapa automaticamente"**), o sistema busca as coordenadas automaticamente via geocodificação gratuita do OpenStreetMap (Nominatim) e preenche Latitude/Longitude sozinho. A busca é ajustada conforme o "Mapa" selecionado: para Curitiba, procura o bairro dentro de Curitiba; para Paraná, procura a cidade digitada dentro do estado. Se não encontrar automaticamente, você ainda pode clicar no mapa ou digitar a lat/lng manualmente — nada foi travado.
- Essa busca usa o serviço público `nominatim.openstreetmap.org`, gratuito mas de uso moderado (não é para volumes muito altos de requisições); como é acionado só quando o usuário edita o campo, o uso normal do painel fica tranquilo dentro da política deles.

- **Bug crítico de banco**: a tabela `liderancas` não tinha a coluna `mapa`, mas o código grava e lê esse campo. Rode `supabase/migration-mapa.sql` se o banco já existir (o `schema.sql` já foi atualizado para instalações novas).
- **Bug do seletor "Regional" travado em Curitiba**: ao trocar o campo "Mapa" para Paraná dentro do formulário, a lista de Regionais continuava mostrando os bairros de Curitiba. Corrigido — agora a lista de Regionais é recalculada assim que o Mapa muda.
- **Cards de resumo por regional agora são clicáveis**: clicar em um card na seção abaixo do mapa filtra a lista de "Lideranças cadastradas" pela regional correspondente (mesmo comportamento das abas acima do mapa) e rola a tela até a lista.
- **Abertura por cidade no Paraná**: como cada regional do Paraná é uma mesorregião com várias cidades, clicar em um card de regional no mapa do Paraná agora expande a lista de cidades cadastradas naquela regional (extraídas do campo "Bairro / cidade" de cada liderança). Clicar numa cidade filtra a lista só pelas lideranças daquela cidade.
- **Pins individuais no mapa**: cada liderança já gera seu próprio marcador; quando duas ou mais compartilham exatamente a mesma coordenada, elas são distribuídas em círculo ao redor do ponto para não ficarem uma sobre a outra. O raio desse deslocamento foi ajustado para crescer com a quantidade de lideranças agrupadas, deixando os pins mais legíveis quando há vários cadastros no mesmo bairro/ponto.
