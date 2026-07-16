# Disponibilidade

Aplicação web para configurar empreendimentos imobiliários e acompanhar a posição comercial de cada unidade.

## Estado atual

- três modos de uso: Operação, Configuração e Visão Executiva;
- matriz configurável por bloco, pavimentos e colunas;
- unidades sincronizadas entre configuração e operação;
- modal comercial com equipe, pasta, observações e fila de condicionais;
- catálogo CSV de clientes e preenchimento automático pelo número da pasta;
- persistência local no navegador;
- fundação Supabase com schema versionado e políticas RLS;
- acesso protegido por e-mail e senha com Supabase Auth;
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

Consulte [a arquitetura](docs/architecture.md), [o roadmap](docs/roadmap.md),
[a configuração do Supabase](docs/supabase-setup.md),
[a configuração do login com senha](docs/password-auth-setup.md) e
[a estratégia de persistência](docs/supabase-persistence.md). A publicação
sanitizada está descrita em [link público do mapa](docs/public-map.md).

## Execução local

Como a aplicação usa módulos JavaScript, execute `index.html` por um servidor local, como a extensão Live Server do VS Code.

## Dados e privacidade

O navegador mantém uma cópia local para contingência. Usuários autenticados
sincronizam os dados com o Supabase de acordo com as políticas RLS. Não use
dados pessoais reais em ambientes públicos ou sem controle de acesso.
