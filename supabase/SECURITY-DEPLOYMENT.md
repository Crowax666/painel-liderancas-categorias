# Ativacao segura do banco

Estas mudancas nao devem ser aplicadas automaticamente pela Vercel.

## Antes de comecar

1. Crie um backup do banco no Supabase.
2. Abra **Authentication > Users** e copie o UUID do usuario administrador.
3. Confirme o UUID da campanha configurado em `NEXT_PUBLIC_CAMPANHA_ID`.

## Banco existente

1. Execute `migration-security.sql`.
2. Edite e execute o `insert` comentado no final da migracao para cadastrar o primeiro administrador.
3. Execute `schema.sql` para criar funcoes, gatilhos e politicas RLS.
4. Teste em uma janela anonima com um usuario sem associacao: ele nao deve enxergar dados.
5. Teste os papeis:
   - `admin`: consulta, cadastro, edicao e exclusao;
   - `editor`: consulta, cadastro e edicao;
   - `leitor`: somente consulta.

## Instalacao nova

Execute `schema.sql`, crie a campanha pelo SQL Editor e depois cadastre o primeiro membro em `campanha_membros`. O SQL Editor administrativo continua disponivel mesmo quando o RLS bloqueia o frontend.

## Observacoes

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_CAMPANHA_ID` aparecem no navegador e nao devem ser tratados como segredos.
- Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` em uma variavel `NEXT_PUBLIC_*`.
- A protecao real e feita pelas politicas RLS e pela associacao do usuario a campanha.
