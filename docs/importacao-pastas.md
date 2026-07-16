# Contrato da importação de pastas

A futura planilha poderá usar os seguintes cabeçalhos:

| Campo | Obrigatório | Exemplo |
|---|---:|---|
| Nº da pasta | Sim | 000123 |
| Tipo da pasta | Não | Ouro |
| Nome do cliente | Sim | Cliente exemplo |
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
5. confirme a importação para incluir ou atualizar o catálogo de clientes.

Cada número de pasta identifica um cliente pré-cadastrado. Ao informar esse
número no modal de uma unidade ou de um cliente condicional, o sistema preenche
automaticamente tipo, cliente, canal e equipe responsável. O tipo aceita apenas
Ouro, Prata ou Bronze. Pastas duplicadas e canais desconhecidos impedem a
confirmação.

O leitor CSV é um adaptador separado do `FolderImportService`. Um futuro leitor
XLSX poderá entregar as mesmas linhas ao serviço sem alterar Models, Views ou as
regras de validação.
