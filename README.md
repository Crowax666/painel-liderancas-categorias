# Painel de Lideranças Supabase — versão com categorias de pin

Projeto Next.js conectado ao Supabase, com login, mapa, cadastro de lideranças, exportação CSV/Excel e classificação por cor de pin.

## Categorias de pin

- Pin Vermelho — Prefeitos, Ex-Prefeitos, Vereadores, Ex-Vereadores, Deputados e Ex-Deputados
- Pin Amarelo — Funcionários Públicos, Diretores de escolas, Vice-diretores, Secretários e Conselheiros tutelares
- Pin Azul — Associação de moradores, ONGs, OSCs e Banco de Alimentos
- Pin Verde — Produtores Rurais e Permissionários
- Pin Branco — Empresários de grande relevância
- Pin Preto — Associações Esportivas

## Antes do deploy

No Supabase, rode o arquivo:

```sql
supabase/migration-categorias.sql
```

Ele adiciona a coluna `categoria` na tabela `liderancas`.

## Variáveis da Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CAMPANHA_ID=6d493722-17d8-4ea2-a488-d1c12d399372
```

## Deploy em novo repositório

Crie um repositório novo, por exemplo:

```text
painel-liderancas-categorias
```

Suba estes arquivos na raiz do repositório:

```text
app/
components/
lib/
supabase/
package.json
next.config.mjs
README.md
```

Na Vercel:

- Framework Preset: Next.js
- Root Directory: vazio
- Build Command: npm run build
- Output Directory: vazio
- Install Command: npm install



## Atualização desta versão

- Pins do mapa reforçados com cor da categoria em desktop, iPad e mobile.
- Cards de lideranças exibem bolinha e faixa lateral com a cor da categoria cadastrada.
- Campo WhatsApp aplica máscara automática no formato `(xx) xxxxx-xxxx`.
- Exportação CSV/Excel mantém categoria, descrição, cor e HEX do pin.

## Atualização da exportação
A exportação principal do Excel/CSV agora usa as colunas solicitadas:
- Nome
- Bairro
- Cidade
- Regional
- Nome da categoria
- Descrição da categoria
- Quantidade de votos previstos
- Quantidade de votos alcançados

O campo Bairro/Cidade é separado automaticamente a partir do campo local usando vírgula. Exemplo: `Batel, Curitiba` vira Bairro = Batel e Cidade = Curitiba.
