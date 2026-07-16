# Roadmap

## Fase 1 — Fundação concluída

- estrutura modular;
- design system e layout;
- grid/matriz de unidades;
- modal operacional;
- Model `Unit`;
- persistência em LocalStorage;
- configuração básica de produto, bloco, pavimentos e colunas.

## Fase 2 — Operação comercial

- equipe ampliada: Diretor, Gerente Parceiro, Coordenador, Gerente e Corretor;
- Pasta: número, tipo e cliente;
- fila de clientes condicionais;
- logos locais dos canais;
- filtros por empreendimento, bloco, pavimento, status e busca;
- importação CSV com prévia, validação e relatório de erros;
- adaptador futuro para importação XLSX;
- filtros por bloco, pavimento, status, canal e unidade;
- tela cheia e zoom do mapa;
- timer dos status comerciais com limite de cinco horas;
- tooltip dos cards com status, canal e gerente;
- editor RGB das cores de status e canais.

## Fase 3 — Configurador de produto

- múltiplos blocos selecionáveis;
- renomeação de unidades;
- gardens e coberturas;
- junções horizontais, verticais e retangulares;
- confirmação e histórico para mudanças destrutivas na matriz.
- tipos: unidade tipo, garden, cobertura linear e cobertura dúplex;
- unificações horizontais e verticais.

## Fase 4 — Firebase e segurança

- interface de repositório de dados;
- Firestore;
- autenticação Microsoft corporativa via Firebase Authentication;
- perfis e permissões;
- trilha de auditoria;
- migração do LocalStorage.
- publicação de snapshot sanitizado da matriz em link revogável;

## Fase 5 — Gestão

- Visão Executiva com KPIs;
- dashboard por empreendimento, bloco, canal e período;
- resumo e gráfico de composição por status;
- ranking de canais e top 10 gerentes;
- composição de propostas com filtro por canal;
- relatórios CSV/Excel/PDF;
- integração com Power BI;
- testes automatizados e monitoramento.
