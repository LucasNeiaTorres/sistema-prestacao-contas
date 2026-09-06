import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CurateladoPrestacoes,
  Prestacao,
  PrestacaoAtual,
} from './prestacao.model';
import { BehaviorSubject, map } from 'rxjs';
import { DadosCadastraisService } from '../shared/dados-cadastrais.service';

@Injectable({
  providedIn: 'root',
})
export class PrestacaoService {
  curatelado_id = new BehaviorSubject<number>(null);
  curador_id = new BehaviorSubject<number>(null);

  constructor(
    private http: HttpClient,
    private dadosCadastraisService: DadosCadastraisService
  ) {}

  setPrestacaoAtual(prestacaoAtual: PrestacaoAtual) {
    // coloca somente o ano no storage
    prestacaoAtual['ano_inicial'] = prestacaoAtual['ano_inicial'].split('-')[0];
    localStorage.setItem('prestacao_atual', JSON.stringify(prestacaoAtual));
  }

  getPrestacaoAtual(): PrestacaoAtual | null {
    return JSON.parse(localStorage.getItem('prestacao_atual'));
  }

  // função para remover a prestação atual do storage se a prestação atual for a prestação que está sendo deletada
  removePrestacaoAtual(id: number) {
    if (this.getPrestacaoAtual()?.prestacao_id === id)
      localStorage.removeItem('prestacao_atual');
  }

  fetchPrestacoes() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.get<CurateladoPrestacoes[]>(
      'http://0.0.0.0:8000/prestacao/',
      {
        headers: headers,
      }
    );
  }

  deletePrestacao(id: number) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.delete(`http://0.0.0.0:8000/prestacao/${id}`, {
      headers: headers,
    });
  }

  fetchCuradorId() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );

    return this.dadosCadastraisService.fetchList('usuario/curadores').pipe(
      map((curadores) => {
        return curadores[0].curador_id;
      })
    );
  }

  // força a atualização do curador_id
  forceFetchCurador() {
    this.fetchCuradorId().subscribe((curador_id) =>
      this.curador_id.next(curador_id)
    );
  }

  fetchCurateladoId() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );

    return this.dadosCadastraisService.fetchList('usuario/curatelados').pipe(
      map((curatelados) => {
        return curatelados[0].curatelado_id;
      })
    );
  }

  // força a atualização do curatelado_id
  forceFetchCuratelado() {
    this.fetchCurateladoId().subscribe((curatelado_id) =>
      this.curatelado_id.next(curatelado_id)
    );
  }
}
