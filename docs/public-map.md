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
5. Depois da primeira publicação, alterações de unidades, estrutura e
   aparência atualizam automaticamente o snapshot sanitizado.
6. Links que estiverem abertos recebem essas atualizações pelo Supabase
   Realtime, sem recarregar a página.
7. Como contingência, a página também verifica uma nova versão do snapshot a
   cada cinco segundos, caso o canal Realtime esteja indisponível.

## Exibição responsiva

- em celulares, as colunas ocupam a largura disponível e a navegação ocorre
  verticalmente;
- em telas verticais de grande formato, a altura dos pavimentos se ajusta para
  exibir a matriz completa;
- em telas estreitas, o texto do status permanece visível em formato compacto,
  acompanhado pela cor do card.

O link não deve ser considerado secreto. Qualquer pessoa que receber o endereço
poderá visualizar o snapshot enquanto ele estiver ativo. A revogação do link
será adicionada em uma evolução posterior usando o campo `is_active`.

## Empreendimento não sincronizado

Se a publicação informar que o empreendimento não está sincronizado:

1. execute a migration
   `supabase/migrations/202607150002_fix_project_bootstrap_rls.sql` no SQL
   Editor;
2. confirme que a execução termina com sucesso;
3. saia e entre novamente na aplicação;
4. abra a Operação e gere o link outra vez.

A migration de correção é idempotente e pode ser reaplicada. Se o Supabase recusar a
sincronização, a interface passa a mostrar também a mensagem original do banco,
facilitando a identificação da política ou permissão ausente.

## Atualização em tempo real

Execute uma vez no SQL Editor:

`supabase/migrations/202607160001_enable_public_map_realtime.sql`

A migration inclui `public.public_maps` na publicação do Supabase Realtime e
pode ser executada novamente com segurança.
