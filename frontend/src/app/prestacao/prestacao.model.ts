export class Prestacao {
  constructor(
    public prestacao_id: number,
    public data_inicial: string,
    public data_final: string,
    public numero_pendencias: number,
    public saldo_final: number
  ) {}
}

export class CurateladoPrestacoes {
  constructor(public nomeCuratelado: string, public prestacoes: Prestacao[]) {}
}

// classe para armazenar a prestação atual - padrão storage
export class PrestacaoAtual {
  constructor(
    public prestacao_id: number,
    public ano_inicial: string,
    public nome_curatelado: string
  ) {}
}