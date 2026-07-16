# Banco, autenticação e matriz pública

## Decisão

Usar Supabase como camada compartilhada da aplicação:

- **PostgreSQL:** projetos, unidades, catálogo de pastas e publicações;
- **Supabase Auth:** login protegido por e-mail e senha;
- **Row Level Security:** separação entre dados internos, pessoais e públicos;
- **Realtime:** sincronização futura do mapa entre usuários conectados.

## Tabelas

```text
profiles
projects
project_members
units
folder_catalog
public_maps
```

O catálogo contém dados pessoais e nunca é público. `public_maps` recebe somente
um snapshot sanitizado com geometria, código da unidade, status, cor e etiqueta
do canal.

## Ordem de implementação

1. aplicar a migration inicial e validar as políticas RLS;
2. criar repositórios Supabase e migrar o LocalStorage com cópia de segurança;
3. habilitar o provedor de e-mail e senha no Supabase Auth;
4. desabilitar o cadastro público e criar usuários pela administração;
5. criar perfis e permissões;
6. publicar snapshots sanitizados e gerar links revogáveis.

## Segurança do link público

- não incluir cliente, pasta, equipe, observações ou histórico;
- usar identificador de compartilhamento não sequencial;
- permitir revogação e nova publicação;
- restringir escrita a usuários autenticados e autorizados;
- expor leitura somente para snapshots marcados como ativos.
