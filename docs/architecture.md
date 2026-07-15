# Arquitetura

## Fluxo principal

```text
index.html
  → app.js
  → ProjectConfig + UnitFactory
  → AppView
  → Controllers
  → LocalStorageService
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

O `LocalStorageService` mantém dados operacionais e o `ProjectConfigService` mantém a geometria. A próxima camada de persistência será um repositório abstrato, permitindo trocar LocalStorage por Firebase sem alterar Views ou Models.

## Importação

O `FolderImportService` recebe linhas já convertidas de CSV/XLSX, normaliza cabeçalhos, valida unidades e aplica dados de pasta e equipe. O leitor de arquivos será implementado como adaptador separado.
