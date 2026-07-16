# Persistência Supabase

## Estratégia

A aplicação usa persistência local primeiro e sincronização remota quando existe
uma sessão autenticada:

```text
alteração do usuário
  → LocalStorage imediato
  → fila de sincronização
  → Supabase, quando autenticado
```

O LocalStorage continua funcionando como cópia de contingência. Uma falha de
rede não impede a utilização do painel nem apaga os dados locais.

## Primeira autenticação

Na primeira sessão autenticada, o `SupabasePersistenceService`:

1. procura um projeto associado ao usuário;
2. carrega o projeto remoto, quando ele já existe;
3. cria um projeto e envia a cópia local quando ainda não existe nenhum;
4. guarda localmente o identificador remoto do projeto;
5. passa a sincronizar configuração, unidades e catálogo de pastas.

O projeto remoto é a fonte compartilhada após essa associação. O login
Microsoft é o próximo requisito para ativar esse fluxo na interface.

## Dados sincronizados

- configuração e aparência do empreendimento em `projects.config`;
- dados comerciais das unidades em `units`;
- catálogo pré-cadastrado de clientes em `folder_catalog`.

As gravações remotas são enfileiradas para preservar a ordem das alterações.
As políticas RLS continuam sendo a camada responsável por autorizar cada
leitura ou gravação.
