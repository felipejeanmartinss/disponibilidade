# Contrato da importação de pastas

A futura planilha poderá usar os seguintes cabeçalhos:

| Campo | Obrigatório | Exemplo |
|---|---:|---|
| Unidade | Sim | 803 |
| Bloco | Apenas se o código se repetir | Bloco A |
| Nº da pasta | Não | 000123 |
| Tipo da pasta | Não | Reserva |
| Nome do cliente | Não | Cliente exemplo |
| Canal | Não | lopes-rio |
| Parceira | Condicional | Imobiliária X |
| Superintendente | Não | Nome |
| Diretor | Não | Nome |
| Gerente Parceiro | Condicional | Nome |
| Coordenador | Não | Nome |
| Gerente | Não | Nome |
| Corretor | Não | Nome |

## Fluxo implementado

Na Configuração, abra **Importar base de pastas** e siga:

1. baixe o modelo CSV, se necessário;
2. selecione um arquivo separado por ponto e vírgula ou vírgula;
3. confira a pré-visualização e as mensagens de validação;
4. corrija a origem caso existam erros;
5. confirme a importação para atualizar e persistir as unidades.

Campos vazios preservam os dados atuais. Uma unidade repetida, inexistente ou
ambígua impede a confirmação. O canal pode ser informado por código, nome ou
etiqueta e precisa existir na configuração comercial.

O leitor CSV é um adaptador separado do `FolderImportService`. Um futuro leitor
XLSX poderá entregar as mesmas linhas ao serviço sem alterar Models, Views ou as
regras de validação.
