# API do Portal de Prestação de Contas em Curatela


## Instalação

```

pip install -r requirements.txt
```

## Execução

```
uvicorn main:app --reload
```


## Estrutura do diretório

```
.
├── app                     # Pasta principal do aplicativo
│   ├── common.py           # funções comuns usadas em todo o aplicativo
│   ├── database.py         # configurações e operações do banco de dados
│   ├── db_schema.py        # define os esquemas do banco de dados
│   ├── dependencies.py     # define injeções de dependências
│   ├── models              # modelos de dados (pydantic)
│   │   ├── cadastro_dados.py
│   │   ├── crud_response.py
│   │   ├── pessoa.py
│   │   ├── prestacao.py
│   │   ├── receita.py
│   │   ├── relatorio.py
│   │   └── user.py
│   └── routes              # rotas da API
│       ├── prestacao.py
│       ├── receita.py
│       └── user.py
├── main.py                 # arquivo principal para iniciar o aplicativo FastAPI
├── README.md               # documentação do projeto
├── requirements.txt        # dependências do projeto
└── sql_app.db              # banco de dados SQLite (testes)
```
