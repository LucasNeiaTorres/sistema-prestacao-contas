from pydantic import BaseModel, Field

class RelatorioRequest(BaseModel):
    tipo: str = Field(..., example="Monthly")
