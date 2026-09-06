from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from passlib.context import CryptContext
from typing import Annotated
from datetime import timedelta, datetime, timezone
from pydantic import BaseModel
from jose import jwt, JWTError
from starlette import status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from decouple import config
from app.database import get_db
from app.db_schema import UsuarioDB, SessaoDB, BlacklistDB
from app.models.user import LoginRequest, LoginResponse, LogoutResponse, TokenResponse
from app.models.crud_response import ItemUpdatedResponse

router = APIRouter(tags=["auth"])

JWT_SECRET_KEY = config("JWT_SECRET_KEY")
JWT_SIGNING_ALGORITHM = config("JWT_SIGNING_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Usuário não autenticado.",
    headers={"WWW-Authenticate": "Bearer"},
)


def authenticate_user(email: str, senha: str, db):
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == email).first()
    if not usuario:
        return False
    if not bcrypt_context.verify(senha, usuario.senha_hash):
        return False
    return usuario


def create_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {"username": username, "user_id": user_id}
    if expires_delta:
        expires = datetime.now(timezone.utc) + expires_delta
    else:
        expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    encode.update({"exp": expires})
    return jwt.encode(encode, JWT_SECRET_KEY, algorithm=JWT_SIGNING_ALGORITHM)


def is_token_blacklisted(token: str, db: Session):
    return (
        db.query(BlacklistDB).filter(BlacklistDB.access_token == token).first()
        is not None
    )


async def get_current_user(
    token: Annotated[str, Depends(oauth2_bearer)], db: Session = Depends(get_db)
):
    try:
        if is_token_blacklisted(token, db):
            raise credentials_exception
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_SIGNING_ALGORITHM])
        username: str = payload.get("username")
        user_id: int = payload.get("user_id")

        if username is None or user_id is None:
            raise credentials_exception

        return {"username": username, "user_id": user_id}
    except JWTError:
        raise credentials_exception


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    login_request: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """
    Realiza o login do usuário
    """

    usuario = authenticate_user(login_request.username, login_request.password, db)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Seu email ou senha estão incorretos."
        )

    token_check = db.query(SessaoDB).filter(SessaoDB.usuario_id == usuario.usuario_id)

    if token_check.first():
        token_check.delete()
        db.commit()

    access_token = create_token(
        usuario.email,
        usuario.usuario_id,
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_token(
        usuario.email,
        usuario.usuario_id,
        timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES),
    )

    sessao = SessaoDB(
        usuario_id=usuario.usuario_id,
        refresh_token=refresh_token,
        data_criacao=datetime.now(timezone.utc),
    )
    try:
        db.add(sessao)
        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500) from e

    return LoginResponse(
        message="Login realizado com sucesso",
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/logout", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout(
    token: Annotated[str, Depends(oauth2_bearer)], db: Session = Depends(get_db)
):
    """
    Realiza o logout do usuário
    """
    usuario = await get_current_user(token, db)
    db_bl = BlacklistDB(
        usuario_id=usuario.get("user_id"),
        access_token=token,
        data_logout=datetime.now(timezone.utc),
    )

    try:
        sessao = (
            db.query(SessaoDB)
            .filter(SessaoDB.usuario_id == usuario.get("user_id"))
            .first()
        )
        if sessao:
            db.add(db_bl)
            db.delete(sessao)
            db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500) from e

    return LogoutResponse(message="Logout realizado com sucesso.")


@router.get("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def get_new_access_token(
    token: Annotated[str, Depends(oauth2_bearer)], db: Session = Depends(get_db)
):
    """
    Obtém um novo token de acesso
    """
    if is_token_blacklisted(token, db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido."
        )

    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_SIGNING_ALGORITHM])
    username: str = payload.get("username")
    user_id: int = payload.get("user_id")

    sessao = db.query(SessaoDB).filter(SessaoDB.usuario_id == user_id).first()
    if not sessao:
        raise credentials_exception

    if sessao.data_criacao.replace(tzinfo=timezone.utc) + timedelta(
        minutes=REFRESH_TOKEN_EXPIRE_MINUTES
    ) < datetime.now(timezone.utc):
        db.delete(sessao)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de atualização expirado",
        )

    db_bl = BlacklistDB(
        usuario_id=user_id,
        access_token=token,
        data_logout=datetime.now(timezone.utc),
    )
    db.add(db_bl)
    db.commit()

    new_access_token = create_token(
        username,
        user_id,
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(access_token=new_access_token, token_type="bearer")
