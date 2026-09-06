from pydantic import BaseModel, Field

class ItemCreatedResponse(BaseModel):
    message: str = Field(..., example="Item criado com sucesso")
    id: int = Field(..., example=123)

class ItemUpdatedResponse(BaseModel):
    message: str = Field(..., example="Item atualizado com sucesso")

class ItemDeletedResponse(BaseModel):
    message: str = Field(..., example="Item deletado com sucesso")