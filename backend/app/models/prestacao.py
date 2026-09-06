from pydantic import BaseModel, Field, field_validator
from app.models.residente import Residente
from typing import List, Optional
from app.validators import data_validator
from datetime import date
from pydantic_core import PydanticCustomError
from app.models.crud_response import ItemCreatedResponse, ItemUpdatedResponse



class PrestacaoRequest(BaseModel):
    curatelado_id: int = Field(..., example=1)
    curador_id: int = Field(..., example=1)
    numero_processo: str = Field(..., example="123456")
    situacao_prestacao_anterior: str = Field(..., example="Aprovada")
    tipo_interdicao: str = Field(..., example="Curatela")
    motivo_interdicao: str = Field(..., example="Idoso")
    data_termo: date = Field(..., example="2022-01-01")
    data_inicial: date = Field(..., example="2022-01-01")
    data_final: date = Field(..., example="2022-12-31")
    reside_casa_repouso: bool = Field(..., example=True)
    cep: str = Field(..., example="12345000")
    estado: str = Field(..., example="Paraná")
    cidade: str = Field(..., example="Curitiba")
    bairro: str = Field(..., example="Centro")
    logradouro: str = Field(..., example="Rua 1")
    numero: str = Field(..., example="123")
    complemento: Optional[str] = Field(None, example="Apt 3")
    
    # valida cep?
    
    @field_validator('data_termo')
    def validate_data_termo(cls, v):
        return data_validator(v)
    
    @field_validator('data_inicial')
    def validate_data_inicial(cls, v):
        return data_validator(v)
    
    @field_validator('data_final')
    def validate_data_final(cls, v, values):
        if v < date(1800, 1, 1):
            raise PydanticCustomError("value_error", "Data inválida")
        if v < values.data['data_inicial']:
            raise PydanticCustomError("value_error", "Data final não pode ser anterior à data inicial")
        return v
    
class Prestacao(PrestacaoRequest):
    prestacao_id: int = Field(..., example=1)
    
    
class PrestacaoResidentes(Prestacao):
    residentes: List[Residente] = []
    
    
class PrestacaoCard(BaseModel):
    prestacao_id: int = None
    data_inicial: date = None
    data_final: date = None
    numero_pendencias: int = None
    saldo_final: float = None

class PrestacoesCuratelado(BaseModel):
    nomeCuratelado: str = None
    prestacoes: List[PrestacaoCard] = [] 
    
class PrestacaoResponse(ItemCreatedResponse):
    nome_curatelado: str = Field(..., example='João da Silva')
    
class PrestacaoUpdateResponse(ItemUpdatedResponse):
    nome_curatelado: str = Field(..., example='João da Silva')