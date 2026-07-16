# Configuração inicial do Supabase

## Projeto conectado

```text
Project URL: https://wzdfiofvnfxuohhsypqg.supabase.co
```

A aplicação usa somente a Publishable Key no navegador. Nunca adicione ao
repositório a senha do banco, `service_role`, secret key ou senha de usuário.

## Aplicar o schema inicial

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor**.
3. Crie uma nova consulta.
4. Copie todo o conteúdo de
   `supabase/migrations/202607150001_initial_schema.sql`.
5. Execute a consulta. O arquivo pode ser executado novamente com segurança se
   for necessário corrigir uma tentativa anterior.
6. Em **Table Editor**, confirme as tabelas `profiles`, `projects`,
   `project_members`, `units`, `folder_catalog` e `public_maps`.

A migration habilita RLS, cria as políticas e libera leitura anônima apenas para
snapshots ativos de `public_maps`.

## Estado desta etapa

O cliente Supabase já é inicializado pela aplicação, mas os dados continuam no
LocalStorage. Essa transição evita perda de informações enquanto autenticação,
repositórios remotos e rotina de migração ainda estão sendo construídos.

## Autenticação

A aplicação exige uma sessão autenticada antes de carregar os dados comerciais.
Consulte [a configuração do login com senha](password-auth-setup.md) para
habilitar o provedor de e-mail, cadastrar usuários e controlar o acesso.
