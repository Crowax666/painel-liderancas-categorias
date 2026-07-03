# Painel de Lideranças conectado ao Supabase

Versão em Next.js conectada ao Supabase com login, regionais e lideranças no banco.

## Novidades desta versão

- Responsivo para celular, iPad e desktop.
- Dados salvos no Supabase, não mais no navegador.
- Login com Supabase Auth.
- Botões de regionais para facilitar a operação.
- Exportação de planilha Excel `.xlsx` com abas:
  - Todas lideranças
  - Resumo regionais
  - Ranking votos
  - Pendências
  - Contatos WhatsApp
- Exportação CSV mantida como alternativa simples.

## Variáveis na Vercel

Configure no projeto da Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_publishable_key
NEXT_PUBLIC_CAMPANHA_ID=6d493722-17d8-4ea2-a488-d1c12d399372
```

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy

Suba os arquivos na raiz do repositório GitHub e importe na Vercel como Next.js.
