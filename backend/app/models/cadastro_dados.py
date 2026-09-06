from pydantic import BaseModel, Field
from backend.app.models.pessoa import Pessoa
from backend.app.models.pessoa import Curatelado
from backend.app.models.prestacao import Prestacao

class CadastroDadosRequest(BaseModel):
    curador: Pessoa
    curatelado: Curatelado
    prestacao: Prestacao