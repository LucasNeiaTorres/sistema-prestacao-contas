from pydantic import BaseModel, Field


class ReceitaAnexoMetadata(BaseModel):
    receita_anexo_id: int = Field(..., example=123)
    filename_user: str = Field(..., example="comprovante.pdf")
    url: str = Field(..., example="/receita/1/anexo/1")
    size: int = Field(..., example=123456)
    content_type: str = Field(..., example="application/pdf")
