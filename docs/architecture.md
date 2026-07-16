# Arquitetura

## Fluxo principal

```text
index.html
  → app.js
  → ProjectConfig + UnitFactory
  → AppView
  → Controllers
  → LocalStorageService / Supabase
```

O `ProjectConfig` é a fonte da geometria do empreendimento. A `UnitFactory` transforma essa configuração em unidades operacionais. Dados comerciais previamente salvos são reaplicados pelo `id` estável da unidade.

## Responsabilidades

- **Models:** validam e normalizam dados do negócio.
- **Views:** geram a interface, sem persistir dados.
- **Controllers:** traduzem cliques e formulários em ações.
- **Services:** armazenam dados ou executam operações externas.
- **Factories:** criam entidades a partir de uma configuração.

## Unidade

Uma unidade contém:

- posição física e código de exibição;
- status e canal;
- equipe responsável, incluindo Superintendente, Diretor e gestão comercial;
- pasta comercial;
- fila de clientes condicionais;
- observações.

## Persistência

O `LocalStorageService` mantém os dados operacionais durante a transição. O
`SupabaseClientService` inicializa a conexão remota e a migration versionada cria
o schema PostgreSQL com RLS. O `SupabasePersistenceService` carrega ou cria o
projeto do usuário, sincroniza configuração, unidades e catálogo, mantendo o
LocalStorage como contingência. Consulte o
[fluxo de persistência](supabase-persistence.md).

## Importação

O `FolderImportService` recebe linhas já convertidas e cria um catálogo de
clientes indexado pelo número da pasta. O `FolderCatalogService` persiste esse
catálogo e permite ao modal preencher automaticamente cliente, classificação,
canal e equipe. O `CsvReaderService` é o primeiro adaptador de arquivo. Leitores
futuros, como XLSX ou uma integração de API, poderão produzir o mesmo formato de
linhas sem alterar a regra de domínio.
