# app/routes/user.py
import pathlib
import random
import shutil
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemUpdatedResponse,
    ItemDeletedResponse,
)
from app.common import create_example
from app.dependencies import get_token_header
from app.db_schema import (
    UsuarioDB,
    CuradorDB,
    CurateladoDB,
    PrestacaoDB,
    ResidenteDB,
    DespesaDB,
    DespesaCategoriaDB,
    DespesaAnexoDB,
    ReceitaDB,
    ReceitaCategoriaDB,
    ReceitaAnexoDB,
    ContaBancariaDB,
    ContaBancariaAnexoDB,
    ContaBancariaCategoriaDB,
    PatrimonioCategoriaDB,
    PatrimonioTipoDB,
    PatrimonioDB,
    PatrimonioAnexoDB,
    InstituicaoFinanceiraDB,
    PrestacaoAnexoTipoDB,
    PrestacaoAnexoDB,
)
from sqlalchemy import MetaData
from sqlalchemy.orm import Session
import app.db_schema as db_schema
from app.database import SessionLocal, engine, get_db
from datetime import date
from sqlalchemy import func
from .user import bcrypt_context
from faker import Faker

fake = Faker("pt_BR")
router = APIRouter()


@router.post(
    "/dev/populate_database",
    tags=["dev"],
    summary="Insere dados de exemplo no banco de dados",
)
def populate_database(db: Session = Depends(get_db)):
    # adiciona dados validos (falta validação de data)
    qtde = 100
    inicio_id = db.query(func.max(UsuarioDB.usuario_id)).scalar() or 0
    hasAdmin = db.query(UsuarioDB).filter(UsuarioDB.email == "admin@gmail.com").first()
    usuarios = [
        UsuarioDB(
            nome=fake.name(),
            cpf_cnpj=fake.cpf(),
            email=fake.email(),
            senha_hash=bcrypt_context.hash(
                fake.password(
                    length=10,
                    special_chars=True,
                    digits=True,
                    upper_case=True,
                    lower_case=True,
                )
            ),
        )
        for i in range(1, qtde if hasAdmin is None else qtde + 1)
    ]

    if hasAdmin is None:
        usuarios.append(
            UsuarioDB(
                nome="admin",
                cpf_cnpj="12599979951",
                email="admin@gmail.com",
                senha_hash=bcrypt_context.hash("admin123"),
            )
        )
    db.add_all(usuarios)
    db.commit()

    inicio_curadores = db.query(func.max(CuradorDB.curador_id)).scalar() or 0
    curadores = [
        CuradorDB(
            # nome=fake.name(),
            nome=usuarios[i].nome,
            usuario_id=(i % qtde) + 1 + inicio_id,
            # email=fake.email(),
            email=usuarios[i].email,
            # cpf=fake.cpf(),
            cpf_cnpj=usuarios[i].cpf_cnpj,
            rg=fake.rg(),
            data_nascimento=fake.date_of_birth(),
            estado_civil=fake.random_element(
                elements=("Solteiro", "Casado", "Divorciado")
            ),
            cep=fake.postcode(),
            estado=fake.state(),
            cidade=fake.city(),
            bairro=fake.bairro(),
            logradouro=fake.street_name(),
            numero=fake.building_number(),
            complemento="Casa",
        )
        for i in range(0, qtde)
    ]
    db.add_all(curadores)
    db.commit()

    inicio_curatelados = db.query(func.max(CurateladoDB.curatelado_id)).scalar() or 0
    curatelados = [
        CurateladoDB(
            usuario_id=(i % qtde) + 1 + inicio_id,
            nome=fake.name(),
            parentesco=fake.random_element(elements=("Filho", "Cônjuge", "Irmão")),
            cpf=fake.cpf(),
            rg=fake.rg(),
            estado_civil=fake.random_element(
                elements=("Solteiro", "Casado", "Divorciado")
            ),
            data_nascimento=fake.date_of_birth(),
            data_obito=None,
        )
        for i in range(0, qtde)
    ]
    db.add_all(curatelados)
    db.commit()

    inicio_prestacoes = db.query(func.max(PrestacaoDB.prestacao_id)).scalar() or 0
    qtde_prestacoes = 2 * qtde
    prestacoes = [
        PrestacaoDB(
            usuario_id=(i % qtde) + 1 + inicio_id,
            curatelado_id=(i % qtde) + 1 + inicio_curatelados,
            curador_id=(i % qtde) + 1 + +inicio_curadores,
            numero_processo=fake.random_int(min=10000, max=99999),
            situacao_prestacao_anterior=fake.random_element(
                elements=("Aprovada", "Reprovada")
            ),
            tipo_interdicao=fake.random_element(elements=("Curatela", "Tutela")),
            motivo_interdicao=fake.random_element(
                elements=(
                    "Doença Mental",
                    "Deficiência Intelectual",
                    "Deficiência Física",
                    "Idoso",
                    "Outro",
                )
            ),
            data_termo=fake.date_this_year(),
            data_inicial=fake.date_this_year(),
            data_final=fake.date_this_year(),
            reside_casa_repouso=fake.boolean(),
            cep=fake.postcode(),
            estado=fake.state(),
            cidade=fake.city(),
            bairro=fake.bairro(),
            logradouro=fake.street_name(),
            numero=fake.building_number(),
            complemento="Casa",
        )
        for i in range(1, qtde_prestacoes + 1)
    ]
    db.add_all(prestacoes)
    db.commit()
    fim_prestacoes = db.query(func.max(PrestacaoDB.prestacao_id)).scalar() or 0

    inicio_residentes = db.query(func.max(ResidenteDB.residente_id)).scalar() or 0
    qtde_residentes = qtde * 3
    residentes = [
        ResidenteDB(
            prestacao_id=fake.random_int(
                min=inicio_prestacoes + 1, max=qtde_prestacoes + inicio_prestacoes - 1
            ),
            nome=fake.name(),
            parentesco=fake.random_element(elements=("Filho", "Cônjuge", "Irmão")),
            cpf=fake.cpf(),
        )
        for i in range(1, qtde_residentes)
    ]
    db.add_all(residentes)
    db.commit()

    despesa_categorias = [
        DespesaCategoriaDB(despesa_categoria="Alimentação"),
        DespesaCategoriaDB(despesa_categoria="Moradia"),
        DespesaCategoriaDB(despesa_categoria="Saúde"),
    ]
    db.add_all(despesa_categorias)
    db.commit()

    receita_categorias = [
        ReceitaCategoriaDB(receita_categoria="Salário"),
        ReceitaCategoriaDB(receita_categoria="Aposentadoria"),
        ReceitaCategoriaDB(receita_categoria="Pensão"),
    ]
    db.add_all(receita_categorias)
    db.commit()

    inicio_desp = db.query(func.max(DespesaDB.despesa_id)).scalar() or 0
    qtde_despesas = qtde * 4
    despesas = [
        DespesaDB(
            prestacao_id=fake.random_int(
                min=inicio_prestacoes + 1, max=qtde_prestacoes + inicio_prestacoes - 1
            ),
            data=fake.date_this_year(),
            descricao=fake.random_element(
                elements=(
                    "Remédios Mãe",
                    "Conserto AP 2 Rouxinol",
                    "Cartão de Crédito Santander",
                )
            ),
            valor=fake.pydecimal(right_digits=2, max_value=5000, positive=True),
            rateio=fake.pydecimal(left_digits=0, right_digits=4, positive=True),
            forma_pagamento=fake.random_int(min=1, max=3),
            despesa_categoria_id=fake.random_int(min=1, max=3),
        )
        for i in range(1, qtde_despesas)
    ]
    db.add_all(despesas)
    db.commit()

    inicio_rec = db.query(func.max(ReceitaDB.receita_id)).scalar() or 0
    qtde_receitas = qtde * 4
    receitas = [
        ReceitaDB(
            prestacao_id=fake.random_int(
                min=inicio_prestacoes + 1, max=qtde_prestacoes + inicio_prestacoes - 1
            ),
            data=fake.date_this_year(),
            descricao=fake.random_element(
                elements=("Crédito INSS", "Crédito Pix Maria Janete", "Cred Juros")
            ),
            valor=fake.pydecimal(right_digits=2, max_value=5000, positive=True),
            receita_categoria_id=fake.random_int(min=1, max=3),
            justificativa=fake.sentence(nb_words=20) if random.random() < 0.2 else None,
        )
        for i in range(1, qtde_receitas)
    ]
    db.add_all(receitas)
    db.commit()

    inicio_receita_anexo = (
        db.query(func.max(ReceitaAnexoDB.receita_anexo_id)).scalar() or 0
    )
    receitas_anexos = [
        ReceitaAnexoDB(
            path=fake.file_path(),
            hash=fake.sha256(),
            receita_id=fake.random_int(
                min=inicio_rec + 1, max=inicio_rec + qtde_receitas - 1
            ),
            filename_user=fake.file_name(),
            size=fake.random_int(min=1, max=10000),
            content_type=fake.random_element(
                elements=("image/jpeg", "image/png", "application/pdf")
            ),
        )
        for i in range(1, qtde * 2)
    ]
    # filter out anexos in which receita has justificativa
    receitas_anexos = [
        anexo
        for anexo in receitas_anexos
        if db.query(ReceitaDB.justificativa)
        .filter(ReceitaDB.receita_id == anexo.receita_id)
        .scalar()
        is None
    ]
    db.add_all(receitas_anexos)
    db.commit()

    despesas_anexos = [
        DespesaAnexoDB(
            path=fake.file_path(),
            hash=fake.sha256(),
            despesa_id=fake.random_int(
                min=inicio_desp + 1, max=inicio_desp + qtde_despesas - 1
            ),
            filename_user=fake.file_name(),
        )
        for i in range(1, qtde * 2)
    ]
    db.add_all(despesas_anexos)
    db.commit()

    qtde_conta_bancaria_categoria = 3
    conta_bancaria_categorias = [
        ContaBancariaCategoriaDB(conta_bancaria_categoria="Corrente"),
        ContaBancariaCategoriaDB(conta_bancaria_categoria="Poupança"),
        ContaBancariaCategoriaDB(conta_bancaria_categoria="Salário"),
    ]
    db.add_all(conta_bancaria_categorias)
    db.commit()

    # Insert dummy data into the InstituicaoFinanceira table
    qtd_instituicoes = 10
    instituicoes_financeiras = [
        InstituicaoFinanceiraDB(nome_instituicao=fake.company()) for _ in range(10)
    ]
    db.add_all(instituicoes_financeiras)
    db.commit()

    # Insert dummy data into the ContaBancaria table
    inicio_conta = db.query(func.max(ContaBancariaDB.conta_bancaria_id)).scalar() or 0
    contas_bancarias = [
        ContaBancariaDB(
            prestacao_id=fake.random_int(min=1, max=qtde_prestacoes),
            instituicao_id=fake.random_int(min=1, max=qtd_instituicoes),
            conta_bancaria_categoria_id=fake.random_int(
                min=1, max=qtde_conta_bancaria_categoria
            ),
            numero_conta=fake.random_number(digits=5),
            digito_conta=fake.random_int(min=0, max=9),
            numero_agencia=fake.random_number(digits=4),
            digito_agencia=fake.random_int(min=0, max=9),
            saldo_inicial=fake.pydecimal(
                right_digits=2, max_value=10000, positive=True
            ),
            saldo_final=fake.pydecimal(right_digits=2, max_value=10000, positive=True),
            data_abertura=fake.date_this_year(),
        )
        for _ in range(10)
    ]
    db.add_all(contas_bancarias)
    db.commit()

    # Insert dummy data into the ContaBancariaAnexo table
    inicio_anexo = db.query(func.max(ContaBancariaAnexoDB.anexo_id)).scalar() or 0
    contas_bancarias_anexos = [
        ContaBancariaAnexoDB(
            conta_bancaria_id=fake.random_int(
                min=inicio_conta + 1, max=inicio_conta + 10
            ),
            data_inicial=fake.date_this_year(),
            data_final=fake.date_this_year(),
            filename_user=fake.file_name(),
            path=fake.file_path(),
            hash=fake.sha256(),
        )
        for _ in range(20)
    ]
    db.add_all(contas_bancarias_anexos)
    db.commit()

    qtde_patrimonio_categoria = 4
    conta_bancaria_categorias = [
        PatrimonioCategoriaDB(patrimonio_categoria="Poupança"),
        PatrimonioCategoriaDB(patrimonio_categoria="Veículo"),
        PatrimonioCategoriaDB(patrimonio_categoria="Aeronave"),
        PatrimonioCategoriaDB(patrimonio_categoria="Imóvel"),
    ]
    db.add_all(conta_bancaria_categorias)
    db.commit()

    qtde_patrimonio_tipo = 3
    patrimonio_tipos = [
        PatrimonioTipoDB(patrimonio_tipo="Investimento"),
        PatrimonioTipoDB(patrimonio_tipo="Bem"),
        PatrimonioTipoDB(patrimonio_tipo="Dívida"),
    ]
    db.add_all(patrimonio_tipos)
    db.commit()

    inicio_patrimonio = db.query(func.max(PatrimonioDB.patrimonio_id)).scalar() or 0
    qtde_patrimonio = 10
    patrimonios = [
        PatrimonioDB(
            prestacao_id=fake.random_int(min=1, max=qtde_prestacoes),
            patrimonio_categoria_id=fake.random_int(
                min=1, max=qtde_patrimonio_categoria
            ),
            patrimonio_tipo_id=fake.random_int(min=1, max=qtde_patrimonio_tipo),
            descricao=fake.sentence(nb_words=6),
            data_inicial=fake.date_between_dates(
                date_start=date(date.today().year, 1, 1)
            ),
            data_final=fake.date_between_dates(
                date_start=date(date.today().year, 1, 1)
            ),
            valor_inicial=fake.pydecimal(
                right_digits=2, max_value=10000, positive=True
            ),
        )
        for _ in range(qtde_patrimonio)
    ]
    db.add_all(patrimonios)
    db.commit()

    inicio_patrimonio_anexo = (
        db.query(func.max(PatrimonioAnexoDB.patrimonio_anexo_id)).scalar() or 0
    )
    patrimonio_anexos = [
        PatrimonioAnexoDB(
            patrimonio_id=fake.random_int(
                min=inicio_patrimonio + 1, max=qtde_patrimonio
            ),
            filename_user=fake.file_name(),
            path=fake.file_path(),
            hash=fake.sha256(),
        )
        for _ in range(20)
    ]
    db.add_all(patrimonio_anexos)
    db.commit()

    # Insert dummy data into the PrestacaoAnexoTipo table
    qtde_prestacao_anexo_tipos = 5
    prestacao_anexo_tipos = [
        PrestacaoAnexoTipoDB(prestacao_anexo_tipo="registrato_bacen"),
        PrestacaoAnexoTipoDB(prestacao_anexo_tipo="registro_movimentacao_patrimonial"),
        PrestacaoAnexoTipoDB(prestacao_anexo_tipo="declaracao_irpf"),
        PrestacaoAnexoTipoDB(
            prestacao_anexo_tipo="certidao_negativa_de_debitos_e_bens"
        ),
        PrestacaoAnexoTipoDB(prestacao_anexo_tipo="sentenca_judicial"),
    ]
    db.add_all(prestacao_anexo_tipos)
    db.commit()

    # Insert dummy data into the PrestacaoAnexo table
    inicio_prestacao_anexo = (
        db.query(func.max(PrestacaoAnexoDB.prestacao_anexo_id)).scalar() or 0
    )
    prestacao_anexos = [
        PrestacaoAnexoDB(
            prestacao_id=fake.random_int(min=1, max=qtde_prestacoes),
            prestacao_anexo_tipo_id=i + 1,
            filename_user=fake.file_name(),
            path=fake.file_path(),
            hash=fake.sha256(),
        )
        for i in range(qtde_prestacao_anexo_tipos)
    ]
    db.add_all(prestacao_anexos)
    db.commit()

    return "Dados de exemplo inseridos com sucesso"


@router.post(
    "/dev/recreate_db", tags=["dev"], summary="Recria as tabelas do banco de dados"
)
def recreate_db(db: Session = Depends(get_db)):
    db_schema.Base.metadata.drop_all(bind=db.get_bind())
    db_schema.Base.metadata.create_all(bind=db.get_bind())

    shutil.rmtree("/anexos/receitas/", ignore_errors=True)

    return "Tabelas recriadas com sucesso"


@router.post(
    "/dev/drop_all_brute_force",
    tags=["dev"],
    summary="Recria as tabelas do banco de dados (brute force)",
)
def drop_all_brute_force(db: Session = Depends(get_db)):
    # Get the metadata of the database
    metadata = MetaData()

    while True:
        # Reflect the current state of the database
        metadata.reflect(bind=db.get_bind())

        # Get a list of all table names
        table_names = list(metadata.tables.keys())

        if not table_names:
            # If no tables are left, break the loop
            break

        dropped_table = False

        for table_name in table_names:
            table = metadata.tables[table_name]
            try:
                # Try to drop the table
                table.drop(bind=db.get_bind())
                # If successful, mark that a table was dropped
                dropped_table = True
            except Exception as e:
                # If not successful, continue to the next table
                continue

        if not dropped_table:
            # If no tables were dropped in this pass, raise an error
            raise Exception("Could not drop all tables")
