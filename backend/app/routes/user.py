# app/routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from starlette import status
from passlib.context import CryptContext
from typing import Annotated, List

from app.models.user import CadastroUsuarioRequest, Usuario
from app.models.pessoa import Curatelado, Curador
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemDeletedResponse,
    ItemUpdatedResponse,
)
import app.db_schema as db_schema
from app.db_schema import UsuarioDB, CuradorDB, CurateladoDB
from app.database import SessionLocal, engine, get_db
from .auth import get_current_user


db_schema.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/usuario",
    tags=["usuario"],
)

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
user_dependency = Annotated[dict, Depends(get_current_user)]



@router.get("/curadores", status_code=status.HTTP_200_OK, response_model=List[Curador])
async def obter_curadores_usuario(
    user: user_dependency, db: Session = Depends(get_db)
):
    """
    Obtém os curadores do usuario logado
    """
    try:
        curadores = db.query(CuradorDB).filter(CuradorDB.usuario_id == user.get('user_id')).order_by(CuradorDB.curador_id.desc()).all()
        if curadores is None or len(curadores) == 0:
            raise HTTPException(status_code=404, detail="Curadores não encontrados")
        
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500)
    return curadores


@router.get("/curatelados", status_code=status.HTTP_200_OK, response_model=List[Curatelado])
async def obter_curatelados_usuario(
    user: user_dependency, db: Session = Depends(get_db)
):
    """
    Obtém os curatelados do usuario logado
    """
    try:
        curatelados = db.query(CurateladoDB).filter(CurateladoDB.usuario_id == user.get('user_id')).order_by(CurateladoDB.curatelado_id.desc()).all()
        if curatelados is None or len(curatelados) == 0:
            raise HTTPException(status_code=404, detail="Curatelados não encontrados")
        
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500)
    return curatelados


@router.get("/", status_code=status.HTTP_200_OK, response_model=Usuario)
async def obter_usuario(user: user_dependency, db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="Erro de autenticação")
    return db.query(UsuarioDB).filter(UsuarioDB.usuario_id == user.get("user_id")).first()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ItemCreatedResponse,
)
async def cadastrar_usuario(
    novo_usuario: CadastroUsuarioRequest, db: Session = Depends(get_db)
):
    """
    Cadastra o usuário (login e senha)
    """
    
    db_usuario = UsuarioDB(
        nome=novo_usuario.nome,
        cpf_cnpj=novo_usuario.cpf_cnpj,
        email=novo_usuario.email,
        senha_hash=bcrypt_context.hash(novo_usuario.senha),
    )
    
    try:
        if db.query(UsuarioDB).filter(UsuarioDB.cpf_cnpj == db_usuario.cpf_cnpj).first():
            raise HTTPException(status_code=409, detail="CPF/CNPJ já está cadastrado no sistema.")

        
        if db.query(UsuarioDB).filter(UsuarioDB.email == db_usuario.email).first():
            raise HTTPException(status_code=409, detail="Email já está cadastrado no sistema.")
        
        db.add(db_usuario)
        db.commit()
    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500)

    return ItemCreatedResponse(
        id=db_usuario.usuario_id, message="Usuário cadastrado com sucesso"
    )


@router.put("/", response_model=ItemUpdatedResponse, status_code=status.HTTP_200_OK)
async def atualizar_usuario(
    usuario: CadastroUsuarioRequest,
    usuario_logado: user_dependency,
    db: Session = Depends(get_db),
):
    """
    Atualiza um usuario
    """

    try:
        db_usuario = (
            db.query(UsuarioDB)
            .filter(UsuarioDB.usuario_id == usuario_logado.get('user_id'))
            .first()
        )
        if not db_usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        db_usuario.nome = usuario.nome
        db_usuario.cpf_cnpj = usuario.cpf_cnpj
        db_usuario.email = usuario.email
        db_usuario.senha_hash = bcrypt_context.hash(usuario.senha)
        
        db.add(db_usuario)
        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500) from e

    return ItemUpdatedResponse(id=id, message="Usuário atualizado com sucesso")


# @router.delete("/remove/{user_id}", response_model=ItemDeletedResponse)
# async def remove_user(user_id: int, db: Session = Depends(get_db)):
#     # if user is None:
#     #     raise HTTPException(status_code=401, detail='Authentication Failed')

#     user_model = db.query(UsuarioDB).filter(UsuarioDB.usuario_id == user_id).first()
#     if user_model is None:
#         raise HTTPException(status_code=404, detail='Todo not found.')
#     db.query(UsuarioDB).filter(UsuarioDB.usuario_id == user_id).delete()

#     db.commit()
#     return create_example(ItemDeletedResponse)
