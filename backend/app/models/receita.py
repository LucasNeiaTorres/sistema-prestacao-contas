from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.receita_anexo import ReceitaAnexoMetadata


class ReceitaRequest(BaseModel):
    prestacao_id: int = Field(..., example=123)
    data: datetime = Field(
        ...,
        example="2022-01-01 09:30:26+07:00",
    )
    descricao: str = Field(..., example="Salary", max_length=255)
    valor: Decimal = Field(..., example=1000.12, max_digits=14, decimal_places=2)
    receita_categoria_id: int = Field(..., example=1)
    justificativa: Optional[str] = Field(
        None, example="Justificativa example", max_length=1024
    )


class Receita(ReceitaRequest):
    receita_id: int = Field(..., example=123)
    anexos: List[ReceitaAnexoMetadata]

    class Config:
        from_attributes = True
