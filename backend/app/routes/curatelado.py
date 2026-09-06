from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.models.pessoa import CurateladoRequest, Curatelado
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemDeletedResponse,
    ItemUpdatedResponse,
)
import app.db_schema as db_schema
from app.db_schema import CurateladoDB
from app.database import SessionLocal, engine, get_db
from .auth import get_current_user


db_schema.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/curatelado",
    tags=["curatelado"],
)

user_dependency = Annotated[dict, Depends(get_current_user)]


@router.get(
    "/{curatelado_id}", status_code=status.HTTP_200_OK, response_model=Curatelado
)
async def obter_curatelado(
    user: user_dependency, curatelado_id: int, db: Session = Depends(get_db)
):
    """
    Obtém um curatelado
    """
    if user is None:
        raise HTTPException(status_code=401, detail="Erro de autenticação")
    usuario_id = user.get("user_id")
    try:
        curatelado = (
            db.query(CurateladoDB)
            .filter(CurateladoDB.curatelado_id == curatelado_id)
            .filter(CurateladoDB.usuario_id == usuario_id)
            .first()
        )
        if curatelado is None:
            raise HTTPException(status_code=404, detail="Curatelado não encontrado")

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500)
    return curatelado


@router.put(
    "/{curatelado_id}",
    response_model=ItemUpdatedResponse,
    status_code=status.HTTP_200_OK,
)
async def atualizar_curatelado(
    curatelado: CurateladoRequest,
    curatelado_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza um curatelado
    """
    usuario_id = usuario.get("user_id")
    try:
        db_curatelado = (
            db.query(CurateladoDB)
            .filter(CurateladoDB.curatelado_id == curatelado_id)
            .filter(CurateladoDB.usuario_id == usuario_id)
            .first()
        )
        if not db_curatelado:
            raise HTTPException(status_code=404, detail="Curatelado não encontrado")

        for campo, valor in curatelado.model_dump().items():
            if (campo != "curatelado_id") and (campo != "cpf"):
                setattr(db_curatelado, campo, valor)

        db.add(db_curatelado)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500) from e

    return ItemUpdatedResponse(
        id=db_curatelado.curatelado_id, message="Curatelado atualizado com sucesso"
    )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ItemCreatedResponse,
)
async def cadastrar_curatelado(
    novo_curatelado: CurateladoRequest,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Cadastra o curatelado
    """
    try:
        usuario_id = usuario.get("user_id")
        if (
            db.query(CurateladoDB)
            .filter(CurateladoDB.cpf == novo_curatelado.cpf)
            .filter(CurateladoDB.usuario_id == usuario_id)
            .first()
        ):
            raise HTTPException(status_code=400, detail="Curatelado já existe")

        db_curatelado = CurateladoDB(
            **novo_curatelado.model_dump(), usuario_id=usuario_id
        )
        db.add(db_curatelado)
        db.commit()

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500)

    return ItemCreatedResponse(
        id=db_curatelado.curatelado_id, message="Curatelado cadastrado com sucesso"
    )
