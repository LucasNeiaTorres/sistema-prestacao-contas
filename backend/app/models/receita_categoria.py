from pydantic import BaseModel


class ReceitaCategoria(BaseModel):
    receita_categoria_id: int
    receita_categoria: str
