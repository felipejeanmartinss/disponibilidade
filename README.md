# Disponibilidade

Aplicação web para configurar empreendimentos imobiliários e acompanhar a posição comercial de cada unidade.

## Estado atual

- três modos de uso: Operação, Configuração e Visão Executiva;
- matriz configurável por bloco, pavimentos e colunas;
- unidades sincronizadas entre configuração e operação;
- modal comercial com equipe, pasta, observações e fila de condicionais;
- catálogo CSV de clientes e preenchimento automático pelo número da pasta;
- persistência local no navegador;
- indicadores visuais por status e canal de vendas.

## Arquitetura

```text
src/
├── css/          Design system, layout e componentes
├── data/         Configuração inicial do empreendimento
└── js/
    ├── config/       Constantes e opções
    ├── controllers/  Eventos e fluxos da interface
    ├── factories/    Criação de unidades pela matriz
    ├── models/       Regras de Unidade, Bloco e Projeto
    ├── services/     Persistência, estrutura e importação
    └── views/        Renderização da interface
```

Consulte [a arquitetura](docs/architecture.md) e [o roadmap](docs/roadmap.md).

## Execução local

Como a aplicação usa módulos JavaScript, execute `index.html` por um servidor local, como a extensão Live Server do VS Code.

## Dados e privacidade

Nesta fase, os dados ficam somente no `localStorage` do navegador. Não use dados pessoais reais em ambiente público até Firebase, autenticação e regras de acesso estarem configurados.
