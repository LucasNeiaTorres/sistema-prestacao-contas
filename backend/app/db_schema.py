from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Date,
    Boolean,
    ForeignKey,
    Identity,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class ResidenteDB(Base):
    __tablename__ = "residente"

    residente_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    nome = Column(String(255), nullable=False)
    parentesco = Column(String(255), nullable=False)
    cpf = Column(String(255), nullable=False)


class PrestacaoDB(Base):
    __tablename__ = "prestacao"

    prestacao_id = Column(Integer, Identity(start=1), primary_key=True)
    usuario_id = Column(
        Integer, ForeignKey("usuario.usuario_id", ondelete="CASCADE"), default=None
    )
    curatelado_id = Column(
        Integer,
        ForeignKey("curatelado.curatelado_id", ondelete="CASCADE"),
        default=None,
    )
    curador_id = Column(
        Integer, ForeignKey("curador.curador_id", ondelete="CASCADE"), default=None
    )
    numero_processo = Column(String(255), nullable=False)
    situacao_prestacao_anterior = Column(String(255), nullable=False)
    tipo_interdicao = Column(String(255), nullable=False)
    motivo_interdicao = Column(String(255), nullable=False)
    data_termo = Column(Date, nullable=False)
    data_inicial = Column(Date, nullable=False)
    data_final = Column(Date, nullable=True, default=None)
    reside_casa_repouso = Column(Boolean, nullable=False, default=False)
    cep = Column(String(255), nullable=False)
    estado = Column(String(255), nullable=False)
    cidade = Column(String(255), nullable=False)
    bairro = Column(String(255), nullable=False)
    logradouro = Column(String(255), nullable=False)
    numero = Column(String(255), nullable=False)
    complemento = Column(String(255), nullable=True, default=None)


class PrestacaoAnexoDB(Base):
    __tablename__ = "prestacao_anexo"

    prestacao_anexo_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    prestacao_anexo_tipo_id = Column(
        Integer,
        ForeignKey("prestacao_anexo_tipo.prestacao_anexo_tipo_id"),
        nullable=False,
    )
    filename_user = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    hash = Column(String(255), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "prestacao_id", "prestacao_anexo_tipo_id", name="_prestacao_anexo_uc"
        ),
    )


class PrestacaoAnexoTipoDB(Base):
    __tablename__ = "prestacao_anexo_tipo"

    prestacao_anexo_tipo_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_anexo_tipo = Column(String(255), nullable=False)


class UsuarioDB(Base):
    __tablename__ = "usuario"

    usuario_id = Column(Integer, Identity(start=1), primary_key=True)
    nome = Column(String(255), nullable=False)
    cpf_cnpj = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=False, default="", unique=True)
    senha_hash = Column(String(255), nullable=False, default="")


class ReceitaDB(Base):
    __tablename__ = "receita"

    receita_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    data = Column(DateTime, nullable=False)
    descricao = Column(String(255), nullable=False)
    valor = Column(Numeric(14, 2), nullable=False)
    justificativa = Column(String(1024), nullable=True)
    receita_categoria_id = Column(
        Integer,
        ForeignKey("receita_categoria.receita_categoria_id"),
        nullable=True,
        default=None,
    )
    receita_anexos = relationship("ReceitaAnexoDB", backref="receita")


class ReceitaAnexoDB(Base):
    __tablename__ = "receita_anexo"

    receita_anexo_id = Column(Integer, Identity(start=1), primary_key=True)
    receita_id = Column(
        Integer, ForeignKey("receita.receita_id", ondelete="CASCADE"), default=None
    )
    filename_user = Column(String(255), nullable=False, default="")
    size = Column(Integer, nullable=False, default=0)
    content_type = Column(String(255), nullable=False, default="")
    path = Column(String(255), nullable=False, default="")
    hash = Column(String(255), nullable=False, default="")


class ReceitaCategoriaDB(Base):
    __tablename__ = "receita_categoria"

    receita_categoria_id = Column(Integer, Identity(start=1), primary_key=True)
    receita_categoria = Column(String(255), nullable=False, default="")


class DespesaDB(Base):
    __tablename__ = "despesa"

    despesa_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    descricao = Column(String(255), nullable=False)
    # data = Column(Date, nullable=False)
    data = Column(String(255), nullable=False)
    valor = Column(Numeric(14, 2), nullable=False)  # máximo de R$ 999.999.999.999,99
    despesa_categoria_id = Column(
        Integer,
        ForeignKey("despesa_categoria.despesa_categoria_id"),
        nullable=True,
        default=None,
    )
    forma_pagamento = Column(Integer, nullable=False)
    rateio = Column(Numeric(4, 4), nullable=False)


class DespesaAnexoDB(Base):
    __tablename__ = "despesa_anexo"

    despesa_anexo_id = Column(Integer, Identity(start=1), primary_key=True)
    despesa_id = Column(
        Integer, ForeignKey("despesa.despesa_id", ondelete="CASCADE"), default=None
    )
    filename_user = Column(String(255), nullable=False, default="")
    path = Column(String(255), nullable=False, default="")
    hash = Column(String(255), nullable=False, default="")


class DespesaCategoriaDB(Base):
    __tablename__ = "despesa_categoria"

    despesa_categoria_id = Column(Integer, Identity(start=1), primary_key=True)
    despesa_categoria = Column(String(255), nullable=False, default="")


class SessaoDB(Base):
    __tablename__ = "sessao"

    sessao_id = Column(Integer, Identity(start=1), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    refresh_token = Column(String(255), nullable=False, default="")
    data_criacao = Column(DateTime, nullable=False, default="")


class BlacklistDB(Base):
    __tablename__ = "sessao_blacklist"

    sessao_blacklist_id = Column(Integer, Identity(start=1), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.usuario_id"), nullable=False)
    access_token = Column(String(255), nullable=False, default="")
    data_logout = Column(DateTime, nullable=False, default="")


class CuradorDB(Base):
    __tablename__ = "curador"

    curador_id = Column(Integer, Identity(start=1), primary_key=True)
    usuario_id = Column(
        Integer, ForeignKey("usuario.usuario_id", ondelete="CASCADE"), default=None
    )
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    cpf_cnpj = Column(String(255), nullable=False)
    rg = Column(String(255), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    estado_civil = Column(String(255), nullable=False)
    cep = Column(String(255), nullable=False)
    estado = Column(String(255), nullable=False)
    cidade = Column(String(255), nullable=False)
    bairro = Column(String(255), nullable=False)
    logradouro = Column(String(255), nullable=False)
    numero = Column(String(255), nullable=False)
    complemento = Column(String(255), nullable=True, default=None)


class CurateladoDB(Base):
    __tablename__ = "curatelado"

    curatelado_id = Column(Integer, Identity(start=1), primary_key=True)
    usuario_id = Column(
        Integer, ForeignKey("usuario.usuario_id", ondelete="CASCADE"), default=None
    )
    nome = Column(String(255), nullable=False)
    parentesco = Column(String(255), nullable=False)
    cpf = Column(String(255), nullable=False)
    rg = Column(String(255), nullable=False)
    estado_civil = Column(String(255), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    data_obito = Column(Date, nullable=True, default=None)


class ContaBancariaDB(Base):
    __tablename__ = "conta_bancaria"

    conta_bancaria_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    instituicao_id = Column(
        Integer,
        ForeignKey("instituicao_financeira.instituicao_id", ondelete="CASCADE"),
        default=None,
    )
    conta_bancaria_categoria_id = Column(
        Integer,
        ForeignKey("conta_bancaria_categoria.conta_bancaria_categoria_id"),
        nullable=False,
    )
    numero_conta = Column(String(255), nullable=False)
    digito_conta = Column(Integer, nullable=False)
    numero_agencia = Column(String(255), nullable=False)
    digito_agencia = Column(Integer, nullable=False)
    saldo_inicial = Column(Numeric(14, 2), nullable=False)
    saldo_final = Column(Numeric(14, 2), nullable=False)
    data_abertura = Column(Date, nullable=False)


class InstituicaoFinanceiraDB(Base):
    __tablename__ = "instituicao_financeira"

    instituicao_id = Column(Integer, Identity(start=1), primary_key=True)
    nome_instituicao = Column(String(255), nullable=False)


class ContaBancariaAnexoDB(Base):
    __tablename__ = "conta_bancaria_anexo"

    anexo_id = Column(Integer, Identity(start=1), primary_key=True)
    conta_bancaria_id = Column(
        Integer,
        ForeignKey("conta_bancaria.conta_bancaria_id", ondelete="CASCADE"),
        default=None,
    )
    data_inicial = Column(Date, nullable=False)
    data_final = Column(Date, nullable=False)
    filename_user = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    hash = Column(String(255), nullable=False)


class ContaBancariaCategoriaDB(Base):
    __tablename__ = "conta_bancaria_categoria"

    conta_bancaria_categoria_id = Column(Integer, Identity(start=1), primary_key=True)
    conta_bancaria_categoria = Column(String(255), nullable=False)


class PatrimonioCategoriaDB(Base):
    __tablename__ = "patrimonio_categoria"

    patrimonio_categoria_id = Column(Integer, Identity(start=1), primary_key=True)
    patrimonio_categoria = Column(String(255), nullable=False)


class PatrimonioTipoDB(Base):
    __tablename__ = "patrimonio_tipo"

    patrimonio_tipo_id = Column(Integer, Identity(start=1), primary_key=True)
    patrimonio_tipo = Column(String(255), nullable=False)


class PatrimonioDB(Base):
    __tablename__ = "patrimonio"

    patrimonio_id = Column(Integer, Identity(start=1), primary_key=True)
    prestacao_id = Column(
        Integer, ForeignKey("prestacao.prestacao_id", ondelete="CASCADE"), default=None
    )
    patrimonio_categoria_id = Column(
        Integer,
        ForeignKey("patrimonio_categoria.patrimonio_categoria_id"),
        nullable=False,
    )
    patrimonio_tipo_id = Column(
        Integer, ForeignKey("patrimonio_tipo.patrimonio_tipo_id"), nullable=False
    )
    descricao = Column(String(255), nullable=False)
    data_inicial = Column(Date, nullable=False)
    data_final = Column(Date, nullable=False)
    valor_inicial = Column(Numeric(14, 2), nullable=False)


class PatrimonioAnexoDB(Base):
    __tablename__ = "patrimonio_anexo"

    patrimonio_anexo_id = Column(Integer, Identity(start=1), primary_key=True)
    patrimonio_id = Column(
        Integer,
        ForeignKey("patrimonio.patrimonio_id", ondelete="CASCADE"),
        default=None,
    )
    filename_user = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    hash = Column(String(255), nullable=False)
