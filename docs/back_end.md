
# DOCUMENTAÇÃO DO BACKEND

## 1. AUTH
Para a autenticação, é usado o JWT (JSON Web Token). Os parâmetros para a criação do JWT estão em um arquivo separado para garantir a segurança.

### Access Token
O token de acesso é o token que o usuário usa para acessar as rotas protegidas. Ele é gerado a partir do login do usuário e armazenado no local storage do navegador. O token é válido por 60 minutos, após esse tempo, o token é inválido.

### Refresh Token
O token de atualização é o token que o usuário usa para obter um novo access token, caso não esteja expirado. Ele é gerado a partir do login do usuário e é armazenado na tabela `Sessao` do Banco de dados, juntamente com sua data de criação. O token é válido por 7 dias, após esse tempo, o token é inválido.

### Blacklist
A blacklist é uma tabela no banco de dados que armazena os tokens inválidos. Quando um token é inválido, ele é armazenado na blacklist. Quando um token é usado, é verificado se ele está na blacklist. Se estiver, o token é inválido.

### `oauth2_bearer`
O `oauth2_bearer` é um esquema de autenticação que usa o JWT. Ele é usado para proteger as rotas que precisam de autenticação. Para usá-lo, é necessário passar o token no header da requisição, no campo `Authorization`, com o valor `Bearer <token>`.

### Funções e endpoints
- **`authenticate_user`**
    - Recebe o email e a senha do usuário
    - Verifica se o usuário existe e se a senha está correta no banco de dados
    - retorna o usuário do banco de dados
  
- **`create_token`**
    - Recebe o email, o id do usuário e o tempo de expiração do token (se não receber o tempo de expiração, o tempo padrão é 10 minutos)
    - Cria um token (seja access ou refresh token) e o retorna
  
- **`is_token_blacklisted`**
    - Recebe o token
    - Verifica se o token está na tabela blacklist no banco de dados
    - Retorna True se estiver, False se não estiver

- **`get_current_user`**
    - Recebe o token 
    - Verifica se o token é válido
    - Decodifica o token e retorna o usuário associado ao token
  
- **`/login`**
    - Recebe o OAuth2PasswordRequestForm (email e senha)
    - Autentica o usuário com a função `authenticate_user`
    - Verifica se o usuário tem uma sessão ativa
      - Se tiver, deleta tal sessão
    - Cria um novo access token e refresh token com a função `create_token`
    - Insere o refresh token na tabela Sessao
    - Retorna o access token e o refresh token
  
- **`/logout`**
    - Recebe o token
    - Chama a função `get_current_user` para receber o usuário associado ao token
    - Verifica se o usuário tem uma sessão ativa no banco de dados
      - Se tiver, deleta tal sessão e insere o token na blacklist

- **`/refresh`**
    - Recebe o access token 
    - Verifica se o token está na blacklist no banco de dados
    - Decodifica o token
    - Verifica se o usuario associado ao token tem uma sessão ativa
    - Verifica se o refresh token da sessão no banco de dados está expirado
      - Se não estiver, insere o access token atual na blacklist e cria um novo access token

### Observações
Ainda não é utilizado o refresh token, pois o front-end ainda não está pronto para usá-lo. O refresh token é necessário para que o usuário não precise fazer login toda vez que o token expirar.

## 2. USER

### Funções e endpoints

- **`/usuario/curadores`**
  - Faz get na tabela de curadores que o usuario logado têm e os retorna, ordenado do mais recente para o mais antigo
  - Pode ser usado numa futura funcionalidade de seleção de curador

- **`/usuario/curatelados`**
  - Faz get na tabela de curatelados que o usuario logado têm e os retorna, ordenado do mais recente para o mais antigo
  - Pode ser usado numa futura funcionalidade de seleção de curatelado
  
- **post `/usuario`**
  - Criptografa a senha do usuário
  - Faz post na tabela de usuários 
  - Verifica se o email ou CPF/CNPJ já está cadastrado no banco de dados
    - Se estiver, retorna erro de conflito (409)
  
- **put `/usuario`**
  - Faz put no usuário logado

### Observações
- Não foi desenvolvido o delete de usuário, pois ainda não foi decidido se será necessário.
- O put ainda não foi implementado no front-end, pois ainda não foi decidido se será necessário e como seria feito.

## 3. CURADOR

### Funções e endpoints

- **get `/curador/{curador_id}`**
  - Faz get no curador com o id passado se o curador pertencer ao usuário logado
  - Retorna o curador

- **put `/curador/{curador_id}`** 
  - Faz put no curador com o id passado se o curador pertencer ao usuário logado
  - Não altera o `curador_id`, o `usuario_id` e nem o `cpf_cnpj`

- **post `/curador`**
  - Verifica se o usuário logado já tem um curador com o mesmo `cpf_cnpj` ou `email` cadastrado
  - Faz post na tabela de curadores 
  
### Observações
Não foi desenvolvido o delete de curador, pois ainda não foi decidido se será necessário e como seria feito.
  
## 4. CURATELADO

### Funções e endpoints

- **get `/curatelado/{curatelado_id}`**
  - Faz get no curatelado com o id passado se o curatelado pertencer ao usuário logado
  - Retorna o curatelado

- **put `/curatelado/{curatelado_id}`**
  - Faz put no curatelado com o id passado se o curatelado pertencer ao usuário logado
  - Não altera o `curatelado_id` e nem o `cpf`

- **post `/curatelado`**
  - Verifica se o usuário logado já tem um curatelado com o mesmo `cpf` cadastrado
  - Faz post na tabela de curatelados
  
### Observações
Não foi desenvolvido o delete de curatelado, pois ainda não foi decidido se será necessário e como seria feito.

## 5. PRESTACAO

### Funções e endpoints da prestação

- **get `/prestacao`**
  - Dá get na lista de prestações do usuário logado fazendo o `join` com a tabela de curatelados ordenado do mais recente para o mais antigo e por ordem alfabética do nome do curatelado
  - Agrupa as prestações por curatelado, pois na tela de selecionar prestação, é exibido todas as prestações de cada curatelado daquele usuário
  - Vale ressaltar que o `numero_pendencias` e o `saldo_final` deveriam ser calculados ou ter um campo no banco de dados, mas ainda não foi decidido como seria feito, por isso, esses campos estão fixos com valores aleatórios

- **get `/prestacao/{prestacao_id}`**
  - Chama as funções `obter_prestacao_contas` e `obter_lista_residentes`, agrupa os dados
  - Retorna a prestação de contas com seus residentes

- **`obter_prestacao_contas`**
  - Recebe o id da prestação e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Faz get na tabela de prestação de contas com o id passado
  - Retorna a prestação de contas

- **put `/prestacao/{prestacao_id}`**
  - Faz put na prestação de contas do id passado com seus residentes
  - Para isso, chama a função `atualizar_prestacao_contas` e `atualizar_residentes`
  - Retorna o nome do curatelado da prestação de contas atualizada para inserir no localStorage do front-end para exibir a prestação selecionada no sidebar
  
- **`atualizar_prestacao_contas`**
  - Recebe o id da prestação, os dados novos e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Faz put na tabela de prestação de contas com o id passado e não altera o `prestacao_id` nem o `usuario_id`
  - É utilizado o `flush` ao invés do `commit` para que, caso dê errado ao atualizar os residentes, a prestação de contas não seja alterada ao dar `rollback`
  - Retorna o id e o nome do curatelado da prestação de contas atualizada para ser usado no endpoint de put no `/prestacao/{prestacao_id}`

- **post `/prestacao`**
  - Faz post na tabela de prestação de contas com seus residentes ou não
  - Para isso, chama a função `cadastrar_prestacao_contas`
  - Se `reside_casa_repouso` for `False`, chama a função `cadastrar_residentes`, pois somente é necessário cadastrar os residentes se o curatelado não reside em casa de repouso
  - Retorna o nome do curatelado da prestação de contas cadastrada para inserir no localStorage do front-end para exibir a prestação selecionada no sidebar

- **`cadastrar_prestacao_contas`**
  - Recebe os dados da prestação de contas e o usuário logado
  - Faz post na tabela de prestação de contas
  - É utilizado o `flush` ao invés do `commit` para que, caso dê errado ao cadastrar os residentes, a prestação de contas não seja cadastrada ao dar `rollback`

- **delete `/prestacao/{prestacao_id}`**
  - Recebe o id da prestação de contas e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Dá get na tabela de prestação de contas com o id passado
  - Faz delete na prestação 
  - Para isso, chama a função `deletar_prestacao_contas`
  - Retorna o nome do curatelado da prestação de contas deletada para inserir no localStorage do front-end para exibir a prestação selecionada no sidebar

### Funções e endpoints dos residentes

- **`obter_lista_residentes`**
  - Recebe o id da prestação de contas e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Faz get na tabela de residentes com o id da prestação de contas passado
  - Retorna a lista de residentes

- **`atualizar_residentes`**
  - Recebe o id da prestação de contas, os dados novos e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Faz put na tabela de residentes com o id da prestação de contas passado
  - É utilizado o `flush` ao invés do `commit` para que, caso dê errado ao atualizar os residentes, consiga dar `rollback` na prestação de contas

- **`cadastrar_residentes`**
  - Recebe o id da prestação de contas, a lista de residentes e o usuário logado **(não utilizado, pode retirar ou usar para verificar se o usuário tem acesso à prestação)**
  - Faz post da lista de residentes na tabela de residentes com o id da prestação de contas passado 
  - É utilizado o `flush` ao invés do `commit` para que, caso dê errado ao cadastrar os residentes, consiga dar `rollback` na prestação de contas

### Funções e endpoints das receitas
TODO: Inserir funções e endpoints das receitas do Vinícius

## 6. VALIDATORS
Para a padronização dos erros de validação customizada de forms, foi utilizado o `PydanticCustomError` com o tipo `value_error`, pois facilita o tratamento de erros no front-end. Este retorna o erro 422, com `value_error`, o mesmo retorno de erros de validação padrão do pydantic.

### Validadores customizados

- **`cpf_validator`**
- **`cnpj_validator`**
- **`cpf_cnpj_validator`** - utiliza os dois validadores acima para campos que aceitam tanto CPF quanto CNPJ
- **`senha_validator`** - aceita apenas senhas com 8 ou mais caracteres com pelo menos uma letra maiúscula, uma minúscula e um número **(verificar necessidade)**
- **`data_validator`** - aceita apenas datas menores que a data atual e maiores que 1800-01-01
- **`email_validator`**
  
### Observações

- Poderia ter utilizado o `EmailStr` do pydantic, mas foi utilizado o `email_validator` para customizar a mensagem de erro
- Pode ser implementado o cep_validator

## 7. DEV

- **`/dev/populate_database`**
  - Popula todas as tabelas do banco de dados com dados aleatórios da biblioteca `Faker`
  - Utilizado para testar a aplicação
  - Cria um usuário admin com email "admin@gmail.com" e senha informada no arquivo

- **`/dev/recreate_db`**
  - Dropa todas as tabelas do banco de dados e as cria novamente

- **`/dev/drop_all_brute_force`**
  - Dropa o banco de dados inteiro
  - Dá erro mas funciona
  
## 8. ORM
Para o ORM, foi utilizado o SQLAlchemy, que é um ORM para Python que facilita a comunicação com o banco de dados. O SQLAlchemy é utilizado para fazer as queries no banco de dados, criar as tabelas e mapear as classes.

## 9. PASTAS E ARQUIVOS

- **`models`** - contém os modelos das classes no qual são mapeadas as tabelas do banco de dados (precisam estar iguais ao banco de dados) com suas validações. Define o modelo dos requests e responses dos endpoints.
- **`routes`** - contém os endpoints da aplicação, onde são definidos os métodos HTTP e as funções que são chamadas ao acessar o endpoint.
- **`database`** - contém a configuração do banco de dados
- **`db_schema`** - contém todas as tabelas do banco de dados
- 
- **`validators`** - contém os validadores customizados
- **`dependencies`** - contém as dependências dos endpoints
- **`common`** - contém funções comuns a alguns os endpoints
- **`.env`** - contém as variáveis de ambiente
