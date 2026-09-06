import re
from datetime import date
from pydantic_core import PydanticCustomError


def cpf_validator(v: str):
    cpf = v.replace(".", "").replace("-", "")

    if len(cpf) != 11 or not cpf.isdigit():
        raise PydanticCustomError("value_error", "CPF Inválido")

    cpf = [int(digit) for digit in cpf]

    if cpf == cpf[::-1]:
        raise PydanticCustomError("value_error", "CPF Inválido")

    for i in range(9, 11):
        value = sum((cpf[num] * ((i+1) - num) for num in range(0, i)))
        digit = ((10 * value) % 11) % 10
    if digit != cpf[i]:
        raise PydanticCustomError("value_error", "CPF Inválido")
    return v


def cnpj_validator(v: str):
    cnpj = v.replace(".", "").replace("-", "").replace("/", "")
    if len(cnpj) != 14 or not cnpj.isdigit():
            raise PydanticCustomError("value_error", "CNPJ Inválido")

    cnpj = [int(digit) for digit in cnpj]

    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    value1 = sum((cnpj[num] * weights1[num] for num in range(0, 12)))
    digit1 = ((10 * value1) % 11) % 10
    if digit1 != cnpj[12]:
        raise PydanticCustomError("value_error", "CNPJ Inválido")

    value2 = sum((cnpj[num] * weights2[num] for num in range(0, 13)))
    digit2 = ((10 * value2) % 11) % 10
    if digit2 != cnpj[13]:
        raise PydanticCustomError("value_error", "CNPJ Inválido")


def cpf_cnpj_validator(v: str):
    documento = v.replace(".", "").replace("-", "").replace("/", "")

    if len(documento) <= 11:
        cpf_validator(documento)
    
    elif len(documento) > 11:
        cnpj_validator(documento)
    return v

def senha_validator(v: str):
    password_regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
    if not re.match(password_regex, v):
        raise PydanticCustomError("value_error", "Senha deve ter pelo menos 8 dígitos, pelo menos uma letra maiúscula, uma minúscula e um número")
    return v

def data_validator(v: str):
    if (v > date.today() or v < date(1800, 1, 1)):
        raise PydanticCustomError("value_error", "Data inválida")
    return v

def email_validator(v: str):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
        raise PydanticCustomError("value_error", "Email inválido")
    return v