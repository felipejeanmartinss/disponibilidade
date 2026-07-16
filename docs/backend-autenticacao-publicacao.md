# Banco, autenticação e matriz pública

## Decisão recomendada

Usar Firebase como camada compartilhada da aplicação:

- **Cloud Firestore:** projetos, unidades, catálogo de pastas e publicações;
- **Firebase Authentication:** login Microsoft corporativo;
- **Firebase Hosting:** aplicação operacional e visualização pública;
- **Security Rules:** separação entre dados internos, dados pessoais e mapa público.

## Coleções propostas

```text
projects/{projectId}
projects/{projectId}/units/{unitId}
projects/{projectId}/folderCatalog/{folderNumber}
users/{userId}
publicMaps/{shareId}
```

O catálogo contém dados pessoais e nunca deve ser público. `publicMaps` recebe
somente um snapshot sanitizado com geometria, código da unidade, status, cor e
etiqueta do canal.

## Ordem de implementação

1. criar projeto Firebase e repositórios de dados;
2. migrar LocalStorage para Firestore mantendo uma cópia de segurança;
3. configurar Microsoft como provedor no Firebase Authentication;
4. registrar a SPA no Microsoft Entra como aplicação interna (single-tenant);
5. criar perfis e permissões;
6. publicar snapshots sanitizados e gerar links revogáveis.

## Segurança do link público

- não incluir cliente, pasta, equipe, observações ou histórico;
- usar identificador de compartilhamento não sequencial;
- permitir revogação e nova publicação;
- restringir escrita a usuários autenticados e autorizados;
- expor leitura somente para snapshots marcados como ativos.
