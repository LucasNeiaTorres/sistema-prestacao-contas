from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from typing import Annotated
from sqlalchemy.exc import SQLAlchemyError
from app.models.pessoa import CuradorRequest, Curador
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemDeletedResponse,
    ItemUpdatedResponse,
)
import app.db_schema as db_schema
from app.db_schema import CuradorDB
from app.database import SessionLocal, engine, get_db
from .auth import get_current_user


db_schema.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/curador",
    tags=["curador"],
)

user_dependency = Annotated[dict, Depends(get_current_user)]


@router.get("/{curador_id}", status_code=status.HTTP_200_OK, response_model=Curador)
async def obter_curador(
    user: user_dependency, curador_id: int, db: Session = Depends(get_db)
):
    """
    Obtém um curador
    """
    usuario_id = user.get("user_id")
    try:
        curador = db.query(CuradorDB).filter(CuradorDB.curador_id == curador_id).filter(CuradorDB.usuario_id == usuario_id).first()
        if curador is None:
            raise HTTPException(status_code=404, detail="Curador não encontrado")

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500)
    return curador


@router.put(
    "/{curador_id}", response_model=ItemUpdatedResponse, status_code=status.HTTP_200_OK
)
async def atualizar_curador(
    curador: CuradorRequest,
    curador_id: int,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza um curador
    """
    usuario_id = usuario.get("user_id")
    try:
        db_curador = (
            db.query(CuradorDB).filter(CuradorDB.curador_id == curador_id).filter(CuradorDB.usuario_id == usuario_id).first()
        )
        if not db_curador:
            raise HTTPException(status_code=404, detail="Curador não encontrado")

        for campo, valor in curador.model_dump().items():
            if (campo != "curador_id") and (campo != "cpf_cnpj") and (campo != "usuario_id"):
                setattr(db_curador, campo, valor)

        db.add(db_curador)
        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500) from e

    return ItemUpdatedResponse(id=curador_id, message="Curador atualizado com sucesso")


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ItemCreatedResponse,
)
async def cadastrar_curador(
    novo_curador: CuradorRequest,
    usuario: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Cadastra o curador
    """
    try:
        usuario_id = usuario.get("user_id")

        if (
            db.query(CuradorDB).filter(CuradorDB.cpf_cnpj == novo_curador.cpf_cnpj).filter(CuradorDB.usuario_id == usuario_id).first()
            or db.query(CuradorDB).filter(CuradorDB.email == novo_curador.email).filter(CuradorDB.usuario_id == usuario_id).first()
        ):
            raise HTTPException(status_code=400, detail="Curador já existe")
        db_curador = CuradorDB(**novo_curador.model_dump(), usuario_id=usuario_id)
        db.add(db_curador)
        db.commit()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500)

    return ItemCreatedResponse(
        id=db_curador.curador_id, message="Curador cadastrado com sucesso"
    )
