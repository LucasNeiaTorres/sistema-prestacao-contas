# REQUISITOS

## SIDEBAR

Quando o usuário ainda não cadastrou uma prestação de contas, sidebar tem apenas os itens de cadastro de curador, curatelado e prestação de contas, além da tela inicial. Isto pois não é possível prestar contas sem que tenha cadastrado uma prestação.

## 0. LOGIN

- **Campo de email**
  - Validação do formato de email
- **Campo de senha**
  - Validação se tem 6 caracteres ou mais
- **Link de esqueceu sua senha**
- **Botão de login**
  - Clicável apenas se todos os campos forem válidos
- **Botão de cadastrar**

## 1. CADASTRO DO USUARIO

- **Nome Completo**
  - String obrigatória
- **CPF/CNPJ**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do campo (se houver 11 ou menos caracteres é CPF, senão é CNPJ) usando a diretiva CpfCnpjMaskDirective 
  - Validação de tamanho mínimo de 14 dígitos (11 números, 2 pontos e 1 traço)
- **Email**
  - String obrigatória
  - Validação do formato de email
- **Senha**
  - String obrigatória
  - Validação de tamanho mínimo de 6 caracteres
  - Adicionar validação de caracteres especiais
- **Confirmar Senha**
  - String obrigatória
  - Validação de tamanho mínimo de 6 caracteres
  - Validação se o campo "senha" é igual ao "confirmar senha" e vice-versa
- **Botão de cadastrar**
  - Clicável apenas se todos os campos forem válidos

## 2. TELA INICIAL

Tela exibida no primeiro acesso do usuário.

Nesta tela, um indicador de progresso (stepper) destaca as etapas essenciais para a prestação de contas, proporcionando orientação ao usuário e apresentando de forma clara o fluxo do sistema. Essas etapas incluem: Completar seu Cadastro, Cadastrar Curatelado, Cadastrar Prestação de Contas e Prestar Contas.

## 3. SELEÇÃO DE PRESTAÇÃO

Tela exibida caso o curador já tenha cadastrado alguma prestação de contas.

- **Listagem de todas as prestações de contas associadas ao usuário**
  - Opção para selecionar a prestação desejada, dando continuidade ao processo de prestação
  - A prestação com destaque em vermelho indica a presença de pendências a serem resolvidas
- **Botão Nova**
  - Navega até a página de cadastro de prestação de contas
- **Botão de lixeira**
  - Remove a prestação selecionada 
- **Campo de pesquisa**
  - Campo onde o usuário pode pesquisar o nome do curatelado desejado, facilitando a localização e continuidade do processo de prestação.

OBS: a lista pode ser alterada por cards com o objetivo de ficar claro ao usuário que é possível selecionar uma prestação.

## 4. CADASTRO COMPLETO DO CURADOR

- **Nome Completo**
  - String obrigatória
- **Email**
  - String obrigatória
  - Validação do formato de email
- **CPF/CNPJ**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do campo (se houver 11 ou menos caracteres é CPF, senão é CNPJ) usando a diretiva CpfCnpjMaskDirective 
  - Validação de tamanho mínimo de 14 dígitos (11 números, 2 pontos e 1 traço)
- **RG**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do formato de RG
  - Validação de tamanho mínimo (a definir)
- **Data de Nascimento**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Estado civil**
  - Campo selecionável obrigatório
  - Solteiro(a), Casado(a), Viúvo(a), Divorciado(a)
- **CEP**
  - String obrigatória
  - Puxar dados para outros campos (estado, cidade, bairro)
  - Máscara do formato do CEP
  - Validação de tamanho mínimo de 8 dígitos
- **Estado**
  - Campo selecionável obrigatório
  - Lista todos os estados 
- **Cidade**
  - Campo selecionável obrigatório
  - Lista todas as cidades do estado
- **Bairro**
  - String obrigatória
  - Lista todos os bairros da cidade
- **Logradouro**
  - String obrigatória
- **Número**
  - Int obrigatório
- **Complemento**
  - String opcional
- **Botão de cadastrar**
  - Clicável apenas se todos os campos forem válidos

## 5. CADASTRO DO CURATELADO

- **Nome completo**
  - String obrigatória
- **Parentesco**
  - String obrigatória
- **CPF**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do formato do CPF usando a diretiva CpfCnpjMaskDirective 
  - Validação de tamanho mínimo e máximo de 14 dígitos (11 números, 2 pontos e 1 traço)
- **RG**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do formato de RG
  - Validação de tamanho mínimo (a definir)
- **Estado civil**
  - Campo selecionável obrigatório
  - Solteiro(a), Casado(a), Viúvo(a), Divorciado(a)
- **Data de Nascimento**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Data de Óbito (se houver)**
  - Date opcional
  - Validação de data (se é uma data e é menor que a data atual)
- **Botão de cadastrar**
  - Clicável apenas se todos os campos forem válidos

## 6. CADASTRO DA PRESTAÇÃO DE CONTAS

Para cadastrar uma prestação de contas, o usuário precisa ter adicionado um curatelado antes.

Seleção da aba para preencher dados da prestação, são as abas:

### 6.1. DADOS DA PRESTAÇÃO

- **Nome Completo do Curatelado**
  - Campo selecionável obrigatório
  - Lista todos os curatelados do curador
- **Número do processo**
  - String (para considerar 0's à esquerda) obrigatória (a definir)
- **Situação da Prestação Anterior**
  - Campo selecionável obrigatório
  - Aprovado, Reprovado
- **Tipo de Interdição**
  - Campo selecionável obrigatório
  - Curatela, Tutela
- **Motivo da Interdição**
  - String obrigatória
- **Data do Termo de Compromisso**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Data Inicial da Prestação**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Data Final da Prestação**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)

### 6.2. DADOS DO ENDEREÇO

- **CEP**
  - String obrigatória
  - Puxar dados para outros campos (estado, cidade, bairro)
  - Máscara do formato do CEP
  - Validação de tamanho mínimo de 8 dígitos
- **Estado**
  - Campo selecionável obrigatório
  - Lista todos os estados 
- **Cidade**
  - Campo selecionável obrigatório
  - Lista todas as cidades do estado
- **Bairro**
  - String obrigatória
  - Lista todos os bairros da cidade
- **Logradouro**
  - String obrigatória
- **Número**
  - Int obrigatório
- **Complemento**
  - String opcional
- **Reside em casa de repouso**
  - Radio button obrigatório
  - Sim ou não
  - Se sim, não é habilitada a opção para adicionar os residentes em conjunto do curatelado

#### 6.2.1. RESIDENTES

São os dados das pessoas que moram com o curatelado.
Seção obrigatória se o curatelado não reside em casa de repouso.

- **Nome Completo**
  - String obrigatória
- **Parentesco**
  - String obrigatória
- **CPF**
  - String (para considerar 0's à esquerda) obrigatória
  - Máscara do formato do CPF usando a diretiva CpfCnpjMaskDirective 
  - Validação de tamanho mínimo e máximo de 14 dígitos (11 números, 2 pontos e 1 traço)
- **Botão de lixeira**
  - Remove a linha do residente selecionado
- **Botão de Novo Residente**
  - Adiciona um novo residente, criando uma nova linha com os campos acima 

# PRESTAÇÃO DE CONTAS

## 7. CONTAS BANCÁRIAS

Tela redirecionada logo após o cadastro da prestação de contas, pois deixa mais claro ao usuário que, para comprovar uma receita ou despesa, não é aceito o extrato  bancário.

Para o usuário ver as contas bancárias, é necessário selecionar uma prestação de contas antes.

Nesta tela o usuário pode adicionar o registrato BACEN (documento que contém todas as informações sobre as instituições financeiras com as quais o usuário possui relações) do curatelado. Ainda não sabemos o layout do botão, já que é um card muito grande para apenas um anexo.

- **Cadastro de novas contas bancárias**
- **Listagem de todas as contas bancárias do curatelado selecionado**
- **Selecionar uma conta**
  - Ao clicar em uma linha da tabela, abre a tela de edição da conta
  - Fazer um botão de editar ou clicar na linha???? 
- **Botão de lixeira**
  - Remove a conta bancária selecionada

### 7.1. CADASTRO CONTA BANCÁRIA

OBS: Não foi reutilizado o offcanvas de outros cadastros por se tratar de um formulário potencialmente grande (adicionar comprovante por comprovante).

Seleção da aba para preencher dados da prestação, são as abas:

#### 7.1.1. DADOS DA CONTA

- **Banco**
  - Campo selecionável obrigatório
  - Lista todos os bancos possíveis
- **Tipo de Conta**
  - Campo selecionável obrigatório
  - Conta corrente, poupança, investimento, salário, pagamentos, **etc...**
- **Número da Conta**
  - String (para considerar 0's a esquerda) obrigatória
- **DV** (Dígito Verificador) do número da conta
  - Int obrigatório
  - Verificar se é necessário um campo só para isso
  - Verificar se está claro o que é DV
- **Número da Agência**
- **DV** (Dígito Verificador) do número da agência
  - Int obrigatório
  - Verificar se é necessário um campo só para isso
  - Verificar se está claro o que é DV
- **Saldo Inicial** 
  - Double (**????**) obrigatório
  - Pode ser negativo?
- **Saldo Final**
  - Double (**????**) obrigatório
  - Pode ser negativo?
  - Usado para calcular o saldo final geral, se o saldo inicial + receitas - despesas é equivalente ao saldo final de todas as contas
- **Data de Abertura**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)

#### 7.1.2. COMPROVANTES

Seção obrigatória, curador deve adicionar no mínimo 1 comprovante.

Cada linha representa um comprovante distinto. O curador tem a opção de agregar comprovantes, selecionando as datas correspondentes a cada conjunto de documentos.

- **Data Inicial do comprovante**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Data Final do comprovante**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Botão de anexar comprovante**
  - Anexo de extratos bancários, faturas de cartões de crédito e aplicações financeiras 
- **Botão de lixeira**
  - Remove o comprovante selecionado 
- **Botão de Novo Comprovante**
  - Adiciona uma nova linha de formulário para um novo comprovante

## 8. RECEITAS

- **Cadastro de novas receitas**
- **Listagem de receitas**
- **Exportação de Demonstrativos para Excel** 
- **Filtragem por data inicial - data final**
- **Botão de lixeira**
  - Remove a receita selecionada
- **Selecionar uma receita**
  - Ao clicar em uma linha da tabela, abre a tela de edição da receita
  - Fazer um botão de editar ou clicar na linha????
- **Cálculo do saldo final**
  
Ainda não se sabe como serão os filtros.

Ainda não se sabe como funcionará os checkbox de cada linha, nem se terá inicialmente.

### 8.1. NOVA RECEITA

Esta seção é expandida lateralmente, utilizando a abordagem de offcanvas do bootstrap, o que facilita a navegação do sistema para o usuário.

- **Data**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Descrição**
  - String obrigatória (**????**)
  - Serve para informar o curador posteriormente do que se trata tal receita
- **Valor**
  - Double (**????**) obrigatório
- **Categoria**
  - Campo selecionável obrigatório
  - Exige um tipo de comprovante diferente para cada categoria
   - Receitas de Proventos, salários, pensões.
   - Receitas de Alugueres com os devidos contratos anexados.
   - Receitas de Aplicações Financeiras.
   - Receitas - outras — especificar.
   - Benefício previdenciário com documento comprobatório (verificar a possível existência de pagamentos de parcelas de empréstimos consignados).
   - Reembolso de rateio
- **Anexar comprovantes** (opcional)
  - justificativa, se não houver anexo
  - Tipo de comprovante (contrato, contra-cheque, comprovante de desposito, extrato bancarios, outros - especificar)

## 9. DESPESAS

- **Cadastro de novas despesas**
- **Listagem de despesas**
- **Exportação de Demonstrativos para Excel** 
- **Filtragem por data inicial - data final**
- **Botão de lixeira**
  - Remove a despesa selecionada
- **Selecionar uma despesa**
  - Ao clicar em uma linha da tabela, abre a tela de edição da receita
  - Fazer um botão de editar ou clicar na linha????
- **Cálculo do saldo final**
  
Ainda não se sabe como serão os filtros.

Ainda não se sabe como funcionará os checkbox de cada linha, nem se terá inicialmente.

### 9.1. NOVA DESPESA

Esta seção é expandida lateralmente, utilizando a abordagem de offcanvas do bootstrap, o que facilita a navegação do sistema para o usuário.

- **Data**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Descrição**
  - String obrigatória (**????**)
  - Serve para informar o curador posteriormente do que se trata tal despesa
- **Valor**
  - Double (**????**) obrigatório
- **Categoria**
  - Campo selecionável obrigatório
  - Exige um tipo de comprovante diferente para cada categoria
  - Despesas médicas (plano de saúde, medicamentos, insumos, consultas médicas, fisioterapia, psicólogo, dentista).
   - Despesas Moradia (aluguel, condomínio, IPTU, seguros, água, luz, manutenção da casa - pequenos reparos).
   - Despesas com alimentação (restaurantes, lanchonetes, panificadoras, etc).
   - Despesas com supermercado,
   - Despesas com mensalidades em casa de repouso ou ILPI.
   - Despesas veículos (combustível, seguro, manutenção, IPVA, estacionamento).
   - Despesas Lazer (taxi, passagens, viagens, hospedagem).
   - Despesas serviços terceiros (empregada doméstica, cuidadores, acompanhantes).
   - Despesas com cuidados pessoais (vestuário, cabeleireiro, outros).
   - Despesas em academias, clubes esportivos e personal trainer.
   - Despesas bancárias
   - Honorários: (gerais e curatela).
   - Despesas com cartão de crédito (não se confundem com despesas pagas com uso de cartão de crédito).
   - Despesas com utensílios domésticos, eletrodomésticos e outros bens móveis.
   - Despesas com material de construção, pintura ou outros referentes à reformas na residência.
   - Despesas com dependentes (educação, saúde, vestuário, etc).
   - Outras despesas (animais de estimação, outras).
   - Repasse de recursos ao curatelado/assistido (mesada)
- **Formas de pagamento** das despesas
  - Dinheiro, débito, crédito, boleto, PIX.
  - se cartão: Despesas recorrentes com o mesmo valor (a definir)
- **Rateio** de despesas, definido a partir um percentual
<!-- - Benefício previdenciário com documento comprobatório (verificar a possível existência de pagamentos de parcelas de empréstimos consignados). -->
- **Anexar comprovantes** (opcional)
  - justificativa, se não houver anexo
  - Tipo de comprovante (contrato, contra-cheque, comprovante de desposito, extrato bancarios, outros - especificar)

Ainda não está especificado o caso do rateio entre os residentes. Terá algum cálculo automático do sistema entre os residentes?

O parcelamento de uma despesa gera automaticamente essa despesa nos outros meses de parcelamento.

## 10. BENS E DIREITOS

Nesta seção o curador adiciona todos os patrimônios e direitos (dívida, investimento, etc...) do curatelado.

Não se sabe a necessidade de adicionar patrimônio por patrimônio (exaustivo ao curador, principalmente quando há muitos patrimônios). Isto pois não sabe-se que há um comprovante por patrimônio ou não.

Nesta tela o usuário pode adicionar o registro patrimonial, a declaração do imposto de renda e as certidões negativas de débitos e bens.

- **Cadastro de novos bens/direitos**
- **Listagem de todos os bens e direitos do curatelado selecionado**
- **Selecionar um bem/direito**
  - Ao clicar em uma linha da tabela, abre a tela de edição do bem/direito
  - Fazer um botão de editar ou clicar na linha????
- **Botão de lixeira**
  - Remove o bem/direito selecionado

### 10.1. NOVO BEM/DIREITO

Esta seção é expandida lateralmente, utilizando a abordagem de offcanvas do bootstrap, o que facilita a navegação do sistema para o usuário.

- **Tipo**
  - Campo selecionável obrigatório
  - Investimento, Dívida ou Bem
- **Descrição**
  - String obrigatória (**????**)
- **Categoria**
  - Campo selecionável
  - São as categorias de investimentos, bens e direitos
  - Poupança, Veículo, Aeronave, Banco, etc...
- **Período**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual e se a data inicial é menor que a final)
  - botão de até atualmente???
- **Valor Inicial**
  - Double (**????**) obrigatório
- **Anexo de documentos**
  - Ainda não se sabe se é necessário


Ainda não há o registro da movimentação patrimonial: compra e venda de imóveis, veículos; além da evolução monetária do patrimônio. Realmente necessário?
  <!-- - Anexo de Autorização judicial -->

<!-- ## 12. INVESTIMENTOS ???

- Conta Bancária (Seletor)
- Data Inicial
- Data Final
- Valor aplicado em R$
- Rendimento em R$
- Tipo de Aplicação (Tesouro Direto, Previdência privada e Título de Capitalização, ?) -->

## 11. TRANSFERÊNCIA ENTRE CONTAS

- **Cadastro de novas transferências entre contas**
- **Listagem de todos as transferências entre contas do curatelado selecionado**
- **Selecionar uma transferência**
  - Ao clicar em uma linha da tabela, abre a tela de edição do transferência
  - Fazer um botão de editar ou clicar na linha????
- **Botão de lixeira**
  - Remove a transferência selecionada

### 11.1. NOVA TRANSFERÊNCIA

- **Conta de origem**
  - Campo selecionável obrigatório
  - Lista todas as contas cadastradas do curatelado
- **Conta de destino**
  - Campo selecionável obrigatório
  - Lista todas as contas cadastradas do curatelado
  - Valida se é a mesma da conta de origem
- **Valor**
  - Double (**????**) obrigatório
- **Data**
  - Date obrigatória
  - Validação de data (se é uma data e é menor que a data atual)
- **Anexo de comprovante(s)**
  - Obrigatório???

## 12. PENDÊNCIAS

- **Avisos de pendências ou inconsistências**
  - Link para a página do problema
- **Apontar as diferenças nos saldos da prestação de contas**
- **Acusar o atraso da prestação das contas das contas com base nos prazos estabelecidos** (a definir)
- **Trazer o valor total da fatura do cartão de crédito** (a definir)

## 13. GERAR RELATÓRIO

Nesta tela que é feita a exportação do relatório para PDF ou CSV para enviar ao PROJUDI, é a saída final do sistema. Tal PDF será feito de tal forma a possibilitar a conversão deste para Excel sem problemas.

--------------> como será feita?

Os relatórios são agrupados por: Receitas, Despesas, Saldo Bancário Inicial, Saldo Bancário Final; tal qual já era agrupado em planilha anteriormente. Possibilitando a verificação se os valores batem com os comprovantes.

Seleção da aba para agrupar o relatório de diferentes formas, são as abas:

### 13.1. MESES

As receitas/despesas são agrupados por mês da curatela, exibindo o valor total p/mês das receitas ou despesas para a conferência dos comprovantes e extratos.

### 13.2. CATEGORIAS

As receitas/despesas são agrupados por categoria, servindo mais como informação do valor total p/categoria das receitas ou despesas.


<!--
### Possibilidade do curatelado ter mais de um curador
Chegaram a mencionar esta feature, então precisamos pensar com as partes interessadas se isto realmente será necessário.

A ideia aqui seria compartilhar um mesmo curatelado para múltiplos logins de curadores, cuidando da sincronia entre os cadastros, o que parece um pouco complicado.
-->