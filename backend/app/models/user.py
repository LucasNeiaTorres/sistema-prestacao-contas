# app/models/user.py
from pydantic import BaseModel, Field, field_validator
from app.validators import cpf_validator, senha_validator, email_validator, cpf_cnpj_validator

class LoginRequest(BaseModel):
    email: str = Field(..., example="user1")
    senha: str = Field(..., example="password1")
    
class LogoutResponse(BaseModel):
    message: str = Field(..., example="Logout realizado com sucesso")
    
class TokenResponse(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    token_type: str = Field(..., example="bearer")
    
class LoginResponse(TokenResponse):
    message: str = Field(..., example="Login successful")
    refresh_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    
class CadastroUsuarioRequest(BaseModel):
    nome: str = Field(..., example="John Doe")
    cpf_cnpj: str = Field(..., example="123.456.789-01")
    email: str = Field(..., example="john.doe@example.com")
    senha: str = Field(..., example="securePassword1")
    
    @field_validator('cpf_cnpj')
    def validate_cpf_cnpj(cls, v):
        return cpf_cnpj_validator(v)
    
    @field_validator('senha')
    def validate_senha(cls, v):
        return senha_validator(v)
    
    @field_validator('email')
    def validate_email(cls, v):
        return email_validator(v)
    
class Usuario(BaseModel):
    usuario_id: int = Field(..., example=123)
    nome: str = Field(..., example="John Doe")
    cpf_cnpj: str = Field(..., example="123.456.789-01")
    email: str = Field(..., example="john.doe@example.com")  