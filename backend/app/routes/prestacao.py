from decimal import Decimal
from typing import Annotated, List
from app.common import get_anexos_receita
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from starlette import status
from collections import defaultdict
from sqlalchemy import desc, func
from sqlalchemy.exc import SQLAlchemyError
from app.models.prestacao import (
    Prestacao,
    PrestacaoRequest,
    PrestacaoResidentes,
    PrestacoesCuratelado,
    PrestacaoCard,
    PrestacaoResponse,
    PrestacaoUpdateResponse,
)
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemUpdatedResponse,
    ItemDeletedResponse,
)
from .auth import get_current_user
from app.database import SessionLocal, engine, get_db
from app.db_schema import (
    ReceitaAnexoDB,
    ReceitaDB,
    ResidenteDB,
    PrestacaoDB,
    CurateladoDB,
)
from app.models.receita_anexo import ReceitaAnexoMetadata
from app.models.residente import ResidenteRequest, Residente
from app.models.receita import Receita
from fastapi.encoders import jsonable_encoder
from app.dependencies import get_token_header
from app.models.receita_mensal import ReceitaPorPrestacao, ReceitaPorMes


router = APIRouter(
    prefix="/prestacao",
    tags=["prestacao"],
)

user_dependency = Annotated[dict, Depends(get_current_user)]


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=List[PrestacoesCuratelado],
)
async def obter_lista_prestacao_contas(
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Obtém a lista de prestação de contas do usuário por curatelado
    """
    try:
        usuario_id = usuario.get("user_id")

        db_result = (
            db.query(
                CurateladoDB.curatelado_id,
                CurateladoDB.nome,
                PrestacaoDB.data_inicial,
                PrestacaoDB.data_final,
                PrestacaoDB.prestacao_id,
            )
            .join(PrestacaoDB, PrestacaoDB.curatelado_id == CurateladoDB.curatelado_id)
            .filter(PrestacaoDB.usuario_id == usuario_id)
            .order_by(CurateladoDB.nome, desc(PrestacaoDB.data_final))
            .all()
        )

        if not db_result:
            raise HTTPException(status_code=404, detail="Prestações não encontradas")

        # agrupa db_result por curatelado_id
        prestacoes_por_curatelado = defaultdict(list)
        curatelado_names = {}
        for row in db_result:
            prestacao_card = PrestacaoCard(
                prestacao_id=row.prestacao_id,
                data_inicial=row.data_inicial,
                data_final=row.data_final,
                numero_pendencias=12,  # muda
                saldo_final=-223,  # muda
            )
            prestacoes_por_curatelado[row.curatelado_id].append(prestacao_card)
            curatelado_names[row.curatelado_id] = row.nome

        # cria lista de PrestacoesCuratelado juntando lista de nomes com lista de prestacoes
        lista = [
            PrestacoesCuratelado(
                nomeCuratelado=curatelado_names[curatelado_id], prestacoes=prestacoes
            )
            for curatelado_id, prestacoes in prestacoes_por_curatelado.items()
        ]

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Erro ao obter prestações")

    return lista


@router.get(
    "/{prestacao_id}",
    status_code=status.HTTP_200_OK,
    response_model=PrestacaoResidentes,
)
async def obter_prestacao_contas_residentes(
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Obtém os dados de uma prestação de contas com os seus residentes
    """
    try:
        prestacao = await obter_prestacao_contas(prestacao_id, usuario, db)
        residentes = await obter_lista_residentes(prestacao_id, usuario, db)

        return PrestacaoResidentes(
            **{
                **prestacao.__dict__,
                "residentes": [
                    Residente(**residente.__dict__) for residente in residentes
                ],
            }
        )

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Erro ao obter prestação")


async def obter_prestacao_contas(
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Obtém os dados de uma prestação de contas
    """
    try:
        prestacao = (
            db.query(PrestacaoDB)
            .filter(PrestacaoDB.prestacao_id == prestacao_id)
            .first()
        )
        if not prestacao:
            raise HTTPException(status_code=404, detail="Prestação não encontrada")

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Erro ao obter prestação")

    return prestacao


@router.put(
    "/{prestacao_id}",
    status_code=status.HTTP_200_OK,
    response_model=PrestacaoUpdateResponse,
)
async def atualizar_prestacao_contas_residentes(
    prestacao: PrestacaoRequest,
    residentes: List[ResidenteRequest],
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza uma prestação de contas com os residentes
    """
    try:
        nome_curatelado = (await atualizar_prestacao_contas(prestacao, prestacao_id, usuario, db)).nome_curatelado
        await atualizar_residentes(residentes, prestacao_id, usuario, db)
        # print(nome_curatelado)
        db.commit()
    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500)

    return PrestacaoUpdateResponse(
        id=prestacao_id, message="Prestação atualizada com sucesso", nome_curatelado=nome_curatelado
    )


async def atualizar_prestacao_contas(
    prestacao: PrestacaoRequest,
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza uma prestação de contas
    """
    try:
        db_prestacao = (
            db.query(PrestacaoDB)
            .filter(PrestacaoDB.prestacao_id == prestacao_id)
            .first()
        )
        if not db_prestacao:
            raise HTTPException(status_code=404, detail="Prestação não encontrada")

        for campo, valor in prestacao.model_dump().items():
            if (campo != "prestacao_id") and (campo != "usuario_id"):
                setattr(db_prestacao, campo, valor)

        # devolve o nome do curatelado
        nome_curatelado = (
            db.query(CurateladoDB.nome)
            .filter(CurateladoDB.curatelado_id == db_prestacao.curatelado_id)
            .scalar()
        )

        db.add(db_prestacao)
        db.flush()
    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao atualizar prestação")

    return PrestacaoUpdateResponse(
        id=db_prestacao.prestacao_id,
        message="Prestação atualizada com sucesso",
        nome_curatelado=nome_curatelado,
    )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=PrestacaoResponse,
)
async def cadastrar_prestacao_contas_residentes(
    nova_prestacao: PrestacaoRequest,
    novos_residentes: List[ResidenteRequest],
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Cria uma nova prestação de contas com os residentes
    """
    try:
        response = await cadastrar_prestacao_contas(nova_prestacao, usuario, db)
        prestacao_id = response.id

        if nova_prestacao.reside_casa_repouso is False:
            response = await cadastrar_residentes(
                novos_residentes, prestacao_id, usuario, db
            )

        db.commit()

        # devolve o nome do curatelado
        nome_curatelado = (
            db.query(CurateladoDB.nome)
            .filter(CurateladoDB.curatelado_id == nova_prestacao.curatelado_id)
            .first()
        )
        return PrestacaoResponse(
            id=prestacao_id,
            message="Prestação cadastrada com sucesso",
            nome_curatelado=nome_curatelado[0],
        )
    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao cadastrar prestação")


async def cadastrar_prestacao_contas(
    nova_prestacao: PrestacaoRequest,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Cria uma nova prestação de contas
    """
    try:
        usuario_id = usuario.get("user_id")
        db_prestacao = PrestacaoDB(**nova_prestacao.model_dump(), usuario_id=usuario_id)
        db.add(db_prestacao)

        db.flush()
    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao cadastrar prestação")

    return ItemCreatedResponse(
        id=db_prestacao.prestacao_id, message="Prestação cadastrada com sucesso"
    )


@router.delete("/{prestacao_id}", response_model=ItemDeletedResponse)
async def deleta_prestacao_contas(
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Deleta uma prestação de contas
    """
    try:
        prestacao = (
            db.query(PrestacaoDB)
            .filter(PrestacaoDB.prestacao_id == prestacao_id)
            .first()
        )
        if prestacao is None:
            raise HTTPException(status_code=404, detail="Prestação não encontrada.")

        db.delete(prestacao)
        db.commit()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao deletar prestação")

    return ItemDeletedResponse(message="Prestação deletada com sucesso")


# Residentes


async def obter_lista_residentes(
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Obtém a lista de residentes de uma prestação de contas
    """
    try:
        residentes = (
            db.query(ResidenteDB).filter(ResidenteDB.prestacao_id == prestacao_id).all()
        )
        return residentes

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Erro ao obter residentes")


async def atualizar_residentes(
    novos_residentes: List[ResidenteRequest],
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza a lista de residentes de uma prestação de contas
    """
    try:
        if (
            db.query(PrestacaoDB)
            .filter(PrestacaoDB.prestacao_id == prestacao_id)
            .first()
            is None
        ):
            raise HTTPException(
                status_code=400, detail="Prestação de contas não encontrada"
            )

        db.query(ResidenteDB).filter(ResidenteDB.prestacao_id == prestacao_id).delete()

        for residente in novos_residentes:
            db_residente = ResidenteDB(
                **residente.model_dump(), prestacao_id=prestacao_id
            )
            db.add(db_residente)
        db.flush()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao atualizar residentes")

    return ItemUpdatedResponse(
        id=prestacao_id, message="Residentes atualizados com sucesso"
    )


async def cadastrar_residentes(
    novos_residentes: List[ResidenteRequest],
    prestacao_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Cadastra todos os residentes da prestação
    """
    try:
        if (
            db.query(PrestacaoDB)
            .filter(PrestacaoDB.prestacao_id == prestacao_id)
            .first()
            is None
        ):
            raise HTTPException(
                status_code=400, detail="Prestação de contas não encontrada"
            )
        for residente in novos_residentes:
            db_residente = ResidenteDB(
                **residente.model_dump(), prestacao_id=prestacao_id
            )
            db.add(db_residente)

        db.flush()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao cadastrar residentes")

    return ItemCreatedResponse(
        id=prestacao_id, message="Residentes cadastrados com sucesso"
    )


# Entrada: Nada
# Saída: ReceitaMensal possui referencia para anexos
@router.get("/{prestacao_id}/receitas", response_model=ReceitaPorPrestacao)
async def get_lista_receitas(
    prestacao_id: int,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Obtém a lista de receitas agrupadas por mês.
    """
    # Consulta ao banco de dados para obter as receitas mensais
    db_result = (
        db.query(
            ReceitaDB,
            func.extract("year", ReceitaDB.data).label("ano"),
            func.extract("month", ReceitaDB.data).label("mes"),
            func.sum(ReceitaDB.valor).label("subtotal"),
        )
        .filter(ReceitaDB.prestacao_id == prestacao_id)
        .group_by(
            func.extract("year", ReceitaDB.data),
            func.extract("month", ReceitaDB.data),
            ReceitaDB,
        )
        .order_by(
            func.extract("year", ReceitaDB.data).desc(),
            func.extract("month", ReceitaDB.data).desc(),
        )
        .all()
    )

    # Inicializa a saída (lista de receitas mensais) e o total acumulado
    output = ReceitaPorPrestacao(meses=[], total=Decimal(0))
    total = Decimal(0)
    mes_ano_anterior = None

    for receita_db, ano, mes, subtotal in db_result:
        # Converte o objeto ReceitaDB em um objeto Receita
        receita = Receita(
            **jsonable_encoder(receita_db),
            anexos=await get_anexos_receita(receita_db.receita_id, db),
        )

        # Mapeia os números dos meses para seus nomes
        meses = {
            1: "Janeiro",
            2: "Fevereiro",
            3: "Março",
            4: "Abril",
            5: "Maio",
            6: "Junho",
            7: "Julho",
            8: "Agosto",
            9: "Setembro",
            10: "Outubro",
            11: "Novembro",
            12: "Dezembro",
        }

        # Formata o mês e ano no formato "Janeiro, 2024"
        mes_ano = f"{meses[mes]}, {ano}"

        # Atualiza o total acumulado
        total += subtotal

        # Se os meses são iguais, adiciona a receita ao mês atual
        if mes_ano == mes_ano_anterior:
            output.meses[-1].items.append(receita)
            output.meses[-1].subtotal += subtotal

        # Senão cria um novo grupo de receitas para o novo mês
        else:
            novo_mes = ReceitaPorMes(mes=mes_ano, subtotal=subtotal, items=[receita])
            output.meses.append(novo_mes)

        # Atualiza o mês e ano anterior para o mês e ano atual
        mes_ano_anterior = mes_ano

    # Atualiza o total acumulado na saída
    output.total = total

    # Retorna a lista de receitas mensais
    return output
