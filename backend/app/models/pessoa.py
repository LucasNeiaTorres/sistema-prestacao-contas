from pydantic import BaseModel, Field, field_validator
from datetime import date
from app.validators import cpf_validator, data_validator, cpf_cnpj_validator, email_validator
from typing import Optional

class PessoaRequest(BaseModel):
    nome: str = Field(..., example="John Doe", min_length=1)
    rg: str = Field(..., example="12.345.678-9")
    data_nascimento: date = Field(..., example="2000-01-01")
    estado_civil: str = Field(..., example="Solteiro")
    
    @field_validator('data_nascimento')
    def validate_data_nascimento(cls, v):
        return data_validator(v)
    
class CurateladoRequest(PessoaRequest):
    cpf: str = Field(..., example="123.456.789-00")
    parentesco: str = Field(..., example="Pai")
    data_obito: Optional[date] = Field(None, example="2020-01-01")
        
    @field_validator('cpf')
    def validate_cpf(cls, v):
        return cpf_validator(v) 
    
    @field_validator('data_obito')
    def validate_data_obito(cls, v):
        if v is not None:
            return data_validator(v)
    
class CuradorRequest(PessoaRequest):
    cpf_cnpj: str = Field(..., example="123.456.789-00")
    email: str = Field(..., example="john.doe@example.com")
    cep: str = Field(..., example="12345000")
    estado: str = Field(..., example="Paraná")
    cidade: str = Field(..., example="Curitiba")
    bairro: str = Field(..., example="Centro")
    logradouro: str = Field(..., example="Rua 1")
    numero: str = Field(..., example="123")
    complemento: Optional[str] = Field(None, example="Apt 3")
        
    @field_validator('cpf_cnpj')
    def validate_cpf_cnpj(cls, v):
        return cpf_cnpj_validator(v) 
    
    @field_validator('email')
    def validate_email(cls, v):
        return email_validator(v)
    
    # valida cep?

class Curatelado(CurateladoRequest):
    curatelado_id: int = Field(..., example=1)

class Curador(CuradorRequest):
    curador_id: int = Field(..., example=1)