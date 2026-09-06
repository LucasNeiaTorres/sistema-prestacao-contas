# app/routes/user.py
from decimal import Decimal
import hashlib
import pathlib
from typing import Annotated, List
from fastapi import APIRouter, File, HTTPException, Depends, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import func
from app.models.receita import ReceitaRequest, Receita
from app.models.crud_response import (
    ItemCreatedResponse,
    ItemUpdatedResponse,
    ItemDeletedResponse,
)
from app.common import create_example
from app.dependencies import get_token_header, get_valid_anexo
from fastapi.encoders import jsonable_encoder

from sqlalchemy.orm import Session
import app.db_schema as db_schema
from app.db_schema import ReceitaAnexoDB, ReceitaCategoriaDB, ReceitaDB
from app.database import SessionLocal, engine, get_db
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from PIL import Image

from app.models.receita_mensal import ReceitaPorPrestacao, ReceitaPorMes
from app.models.receita_anexo import ReceitaAnexoMetadata
from app.models.receita_categoria import ReceitaCategoria
from app.common import get_anexos_receita

db_schema.Base.metadata.create_all(bind=engine)

router = APIRouter()


# Entrada: ReceitaRequest SEM referencia para anexos.
# front precisa fazer um POST /receita/anexo por anexo separadamente.
# Saída: ItemCreatedResponse
# Combo:
@router.post("/receita", response_model=Receita)
async def cadastrar_receita(
    nova_receita: ReceitaRequest,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Cadastra uma nova receita
    """
    db_receita = ReceitaDB(**nova_receita.model_dump())

    try:
        db.add(db_receita)
        db.commit()
        db.refresh(db_receita)

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500)

    return Receita(
        **jsonable_encoder(db_receita),
        anexos=await get_anexos_receita(db_receita.receita_id, db),
    )


# @router.get("/receita/{id}", response_model=Receita)
# async def get_receita(
#     id: int,
#     authorization: str = Depends(get_token_header),
#     db: Session = Depends(get_db),
# ):
#     """
#     Obtém os dados de uma receita
#     """

#     receita = db.query(ReceitaDB).filter(ReceitaDB.receita_id == id).first()

#     if not receita:
#         raise HTTPException(status_code=404, detail="Receita não encontrada")

#     return receita


# Entrada: Receita SEM referencia para anexos.
# front precisa fazer um POST ou DELETE /receita/anexo por anexo separadamente.
# Saída: ItemUpdatedResponse
@router.put("/receita/{id}", response_model=Receita)
async def update_receita(
    id: int,
    receitaRequest: ReceitaRequest,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Atualiza uma receita
    """
    try:
        db_receita = db.query(ReceitaDB).filter(ReceitaDB.receita_id == id).first()

        if not db_receita:
            raise HTTPException(status_code=404, detail="Receita não encontrada")

        receita = Receita(
            **jsonable_encoder(receitaRequest),
            receita_id=id,
            anexos=await get_anexos_receita(id, db),
        )

        for field, value in receita.model_dump().items():
            if field != "prestacao_id":
                setattr(db_receita, field, value)

        db.commit()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Parâmetro(s) inválido(s)") from e

    return receita


# Entrada: ID da receita
# Esse endpoint deleta a receita e todos os anexos associados a ela.
# Saída: ItemDeletedResponse
@router.delete("/receita/{id}", response_model=ItemDeletedResponse)
async def delete_receita(
    id: int,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Deleta uma receita
    """
    try:
        db_receita = db.query(ReceitaDB).filter(ReceitaDB.receita_id == id).first()

        if not db_receita:
            raise HTTPException(status_code=404, detail="Receita não encontrada")

        # Deleta os anexos associados à receita
        db_anexos = (
            db.query(ReceitaAnexoDB).filter(ReceitaAnexoDB.receita_id == id).all()
        )
        anexo_paths = [anexo.path for anexo in db_anexos]

        for anexo in db_anexos:
            db.delete(anexo)

        db.delete(db_receita)
        db.commit()

        # Deleta os arquivos dos anexos
        for path in anexo_paths:
            try:
                pathlib.Path(path).unlink()
            except FileNotFoundError:
                pass

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500) from e

    return ItemDeletedResponse(id=id, message="Receita deletada com sucesso")


# Entrada: ID da receita e arquivo do anexo literalmente
# Saída: ItemCreatedResponse
@router.post("/receita/{id}/anexo", response_model=ItemCreatedResponse)
async def upload_anexo_receita(
    id: int,
    anexo: UploadFile = Depends(get_valid_anexo),
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Adiciona um anexo a uma receita
    """

    db_receita = db.query(ReceitaDB).filter(ReceitaDB.receita_id == id).first()

    if not db_receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    try:
        # Insere o anexo no banco de dados para obter o ID
        db_anexo = ReceitaAnexoDB(
            receita_id=id,
            size=anexo.size,
            content_type=anexo.content_type,
            path="se isso esta no banco deu ruim. Ver receita.py",
            hash="se isso esta no banco deu ruim. Ver receita.py",
            # Filtra o nome de arquivo para evitar problemas de segurança
            filename_user="".join(
                c
                for c in anexo.filename
                if c.isalnum() or c in ("_", ".", "(", ")", "-")
            ),
        )
        db.add(db_anexo)
        db.flush()
        db.refresh(db_anexo)
        anexo_id = db_anexo.receita_anexo_id

        anexo_path = f"/anexos/receitas/{anexo_id}"

        # Cria o diretório para salvar o anexo
        pathlib.Path(anexo_path).parent.mkdir(parents=True, exist_ok=True)

        # Salva o anexo
        if anexo.content_type in ("image/jpeg", "image/png"):
            with Image.open(anexo.file) as img:
                img.save(anexo_path, format="JPEG", optimize=True, quality=75)

            with open(anexo_path, "rb") as f:
                file_content = f.read()
                db_anexo.hash = generate_hash(file_content)

        else:
            with open(anexo_path, "wb") as f:
                file_content = await anexo.read()
                f.write(file_content)
                db_anexo.hash = generate_hash(file_content)

        # Atualiza o caminho do anexo no banco de dados
        db_anexo.path = anexo_path

        db.commit()

    except SQLAlchemyError as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500) from e

    return ItemCreatedResponse(id=anexo_id, message="Anexo adicionado com sucesso")


def generate_hash(data, algorithm="sha256"):
    """Generate the hash of a file."""
    hasher = hashlib.new(algorithm)
    hasher.update(data)
    return hasher.hexdigest()


# Entrada: ID da receita e ID do anexo
# Saída: ItemDeletedResponse
@router.delete("/receita/{id}/anexo/{anexo_id}", response_model=ItemDeletedResponse)
async def delete_anexo_receita(
    id: int,
    anexo_id: int,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Deleta um anexo de uma receita
    """
    db_anexo = (
        db.query(ReceitaAnexoDB)
        .filter(
            ReceitaAnexoDB.receita_id == id, ReceitaAnexoDB.receita_anexo_id == anexo_id
        )
        .first()
    )

    if not db_anexo:
        raise HTTPException(status_code=404, detail="Anexo não encontrado")

    try:
        # Deleta o anexo do banco de dados
        db.delete(db_anexo)

        # Deleta o arquivo do anexo
        pathlib.Path(db_anexo.path).unlink()

        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500) from e

    except FileNotFoundError:
        db.rollback()
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return ItemDeletedResponse(id=anexo_id, message="Anexo deletado com sucesso")


# Entrada: ID da receita e ID do anexo
# Saída: arquivo do anexo literalmente
@router.get("/receita/{id}/anexo/{anexo_id}", response_class=FileResponse)
async def get_anexo_receita(
    id: int,
    anexo_id: int,
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Obtém os dados de um anexo de uma receita
    """
    db_anexo = (
        db.query(ReceitaAnexoDB)
        .filter(
            ReceitaAnexoDB.receita_id == id, ReceitaAnexoDB.receita_anexo_id == anexo_id
        )
        .first()
    )

    if not db_anexo:
        raise HTTPException(status_code=404, detail="Anexo não encontrado")

    # Checa se o hash do arquivo é o mesmo que o hash salvo no banco
    with open(db_anexo.path, "rb") as f:
        file_content = f.read()
        if db_anexo.hash != generate_hash(file_content):
            raise HTTPException(
                status_code=422, detail="Problemas com a integridade do arquivo"
            )

    return FileResponse(db_anexo.path, filename=db_anexo.filename_user)


@router.get("/receita/categoria", response_model=List[ReceitaCategoria])
async def get_categorias(
    authorization: str = Depends(get_token_header),
    db: Session = Depends(get_db),
):
    """
    Obtém a lista de categorias de receitas
    """
    db_result = db.query(ReceitaCategoriaDB).all()

    return [
        ReceitaCategoria(
            receita_categoria_id=entry.receita_categoria_id,
            receita_categoria=entry.receita_categoria,
        )
        for entry in db_result
    ]
