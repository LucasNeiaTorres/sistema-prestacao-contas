from pydantic import BaseModel, Field, field_validator
from app.validators import cpf_validator


class ResidenteRequest(BaseModel):
    nome: str = Field(..., example="Felipe Mercedes", min_length=2)
    parentesco: str = Field(..., example="Pai")
    cpf: str = Field(..., example="123.456.789-00")
    # prestacao_id: int = Field(..., example=1)
    
    @field_validator('cpf')
    def validate_cpf(cls, v):
        return cpf_validator(v)
    
class Residente(ResidenteRequest):
    residente_id: int = Field(..., example=1)
    prestacao_id: int = Field(..., example=1)