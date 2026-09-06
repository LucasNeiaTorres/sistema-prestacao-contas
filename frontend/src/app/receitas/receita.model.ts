export type Receita = {
  receita_id: number;
  prestacao_id: number;
  data: Date;
  descricao: string;
  valor: string;
  receita_categoria_id: number;
  justificativa: string | null;
  anexos: {
    receita_anexo_id: number;
    filename_user: string;
    url: string;
    size: number;
    content_type: string;
  }[];
};

export type ReceitaRequest = {
  prestacao_id: number;
  data: Date;
  descricao: string;
  valor: string;
  receita_categoria_id: number;
  justificativa: string | null;
};

export type ReceitaPorMes = {
  mes: string;
  subtotal: string;
  items: Receita[];
};

export type ReceitaPorPrestacao = {
  meses: ReceitaPorMes[];
  total: string;
};

export type ReceitaCategoria = {
  receita_categoria_id: number;
  receita_categoria: string;
};
