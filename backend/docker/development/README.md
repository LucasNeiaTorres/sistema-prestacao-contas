# Oracle Instant Client

O `Dockerfile` deste diretório instala o Oracle Instant Client a partir de dois RPMs,
que **não são redistribuíveis** e por isso não estão versionados aqui (são ~55 MB cada).

Baixe as versões `basic` e `sqlplus` para Linux x86-64 em
<https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html>
e coloque-os neste diretório com estes nomes:

```
oracle-instantclient-basic-linuxx64.rpm
oracle-instantclient-sqlplus-linuxx64.rpm
```

O caminho da biblioteca configurado no `Dockerfile` (`/usr/lib/oracle/21/client64/lib`)
assume a série 21. Se baixar outra série, ajuste essa linha.
