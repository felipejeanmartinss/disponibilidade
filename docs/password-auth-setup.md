# Login com e-mail e senha no Supabase

A aplicação usa o Supabase Auth para validar e-mail e senha. As senhas não são
armazenadas em tabelas públicas nem no código da aplicação. O Supabase mantém
somente hashes protegidos das senhas dentro do schema reservado `auth`.

## 1. Habilitar o provedor de e-mail

1. Abra o projeto no Supabase.
2. Acesse **Authentication > Providers > Email**.
3. Confirme que o provedor de e-mail está habilitado.
4. Desative a opção que permite novos cadastros públicos (**Allow new users to
   sign up**). Os usuários serão criados somente pela administração.
5. Não exponha uma tela de cadastro público na aplicação.

## 2. Definir a política de senha

Em **Authentication > Settings**, configure:

- mínimo de 10 caracteres;
- pelo menos uma letra minúscula;
- pelo menos uma letra maiúscula;
- pelo menos um número;
- pelo menos um símbolo, quando possível.

Oriente os usuários a utilizar um gerenciador de senhas e a não reutilizar
credenciais de outros sistemas.

## 3. Cadastrar usuários

1. Abra **Authentication > Users**.
2. Selecione **Add user**.
3. Informe o e-mail e uma senha temporária forte.
4. Marque o e-mail como confirmado somente após validar a identidade do
   usuário.
5. Após a criação, confirme que o usuário aparece também em `public.profiles`.

Não crie uma tabela própria contendo senhas. A tabela `public.profiles` deve
armazenar apenas dados de apresentação e autorização, como nome, avatar, cargo
e permissões.

## 4. Autorizar acesso ao empreendimento

O login confirma a identidade, mas o acesso aos dados depende das políticas RLS.
Inclua o usuário autenticado em `public.project_members`, relacionando:

- `user_id`: identificador do usuário em `auth.users`;
- `project_id`: empreendimento permitido;
- `role`: papel do usuário no projeto.

Sem essa associação, o usuário pode entrar, mas não deve acessar dados de um
empreendimento para o qual não recebeu autorização.

## 5. Testar

1. Execute a aplicação por um servidor local.
2. Entre com o e-mail e a senha cadastrados.
3. Confirme que o nome e o e-mail aparecem no menu do usuário.
4. Confirme que os dados autorizados são carregados do Supabase.
5. Clique em **Sair** e confirme que a sessão foi encerrada.

## Regras importantes

- a Publishable Key pode permanecer no navegador;
- a `service_role` nunca pode ser colocada no navegador ou no repositório;
- criação administrativa por API deve ocorrer somente em servidor seguro;
- as políticas RLS continuam obrigatórias mesmo com login;
- não registre senhas em logs, planilhas, mensagens ou tabelas próprias.
