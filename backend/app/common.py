# app/common.py
from app.db_schema import ReceitaAnexoDB
from app.models.receita_anexo import ReceitaAnexoMetadata
from pydantic import BaseModel
from sqlalchemy.orm import Session


def create_example(model: BaseModel) -> BaseModel:
    field_values = {
        name: field.get("example")
        for name, field in model.schema().get("properties").items()
    }
    return model(**field_values)


async def get_anexos_receita(
    id: int,
    db: Session,
):
    """
    Obtém a lista de anexos (somente metadados) de uma receita
    """
    db_anexos = db.query(ReceitaAnexoDB).filter(ReceitaAnexoDB.receita_id == id).all()

    # Cria a lista de metadados de anexos
    anexos = [
        ReceitaAnexoMetadata(
            receita_anexo_id=anexo.receita_anexo_id,
            filename_user=anexo.filename_user,
            url=f"/receita/{id}/anexo/{anexo.receita_anexo_id}",
            size=anexo.size,
            content_type=anexo.content_type,
        )
        for anexo in db_anexos
    ]

    return anexos
