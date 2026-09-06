from decimal import Decimal
from typing import List
from pydantic import BaseModel, Field

from app.models.receita import Receita


"""
{
    "meses": [
        {
            "mes": "mm/yyyy",
            "subtotal": 1992.5,
            "items": [
                {
                    "id": 1,
                    "prestação_id": 1,
                    "data": "2024-01-16",
                    "descricao": "Crédito INSS",
                    "categoria": "Benefício Previdenciário",
                    "valor": 1992.5,
                    "anexos": [
                        {
                            "id": 1,
                            "nome": "comprovante.pdf",
                            "url": "http://localhost:3000/api/receita/1/anexo/1"
                        }
                    ]
                }
            ]
        }
    ]
    "total": 1992.5,
}
"""


class ReceitaPorMes(BaseModel):
    mes: str = Field(..., example="mm/yyyy")
    subtotal: Decimal = Field(..., example=100.8)
    items: List[Receita]


class ReceitaPorPrestacao(BaseModel):
    meses: List[ReceitaPorMes]
    total: Decimal = Field(..., example=1992.5)
