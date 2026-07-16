# Link público do mapa

O modo Operação permite publicar um snapshot sanitizado da matriz. O endereço
gerado abre `public.html` sem login, toolbar, filtros, equipe comercial ou dados
de clientes.

## Dados publicados

- posição física e número de exibição das unidades;
- status, nome e cores do status;
- etiqueta curta e cor do canal;
- células vazias e unificações necessárias para preservar a matriz.

## Dados que nunca entram no snapshot

- nome completo do canal;
- superintendente, diretor, parceiro, coordenador, gerente ou corretor;
- pasta, tipo de pasta e cliente;
- clientes condicionais;
- observações;
- e-mail, nome ou identificador do usuário que acessa o sistema.

## Funcionamento

1. Um editor autenticado clica em **Gerar link público**.
2. O snapshot é salvo em `public.public_maps` com um UUID aleatório.
3. Novas publicações do mesmo empreendimento atualizam o snapshot e preservam
   o endereço existente.
4. A política RLS permite leitura anônima somente quando `is_active = true`.

O link não deve ser considerado secreto. Qualquer pessoa que receber o endereço
poderá visualizar o snapshot enquanto ele estiver ativo. A revogação do link
será adicionada em uma evolução posterior usando o campo `is_active`.
