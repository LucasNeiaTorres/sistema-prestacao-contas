import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Receita,
  ReceitaCategoria,
  ReceitaPorPrestacao,
  ReceitaRequest,
} from './receita.model';
import { DropzoneControl } from '../shared/dropzone/dropzone-control.class';
import {
  catchError,
  combineLatest,
  first,
  from,
  merge,
  mergeMap,
  of,
  pipe,
  tap,
  toArray,
} from 'rxjs';
import { PrestacaoService } from '../prestacao/prestacao.service';

@Injectable({
  providedIn: 'root',
})
export class ReceitasService {
  deleteAnexoQueue: { receita: Receita; anexoId: number }[] = [];

  constructor(
    private http: HttpClient,
    private prestacaoService: PrestacaoService
  ) {}

  fetchReceitaCategorias() {
    return this.http.get<ReceitaCategoria[]>(
      'http://localhost:8000/receita/categoria'
    );
  }

  fetchReceitas() {
    const prestacao_id =
      // TODO: Tirar isso e tratar o erro
      this.prestacaoService.getPrestacaoAtual()?.prestacao_id ?? 7;
    return this.http.get<ReceitaPorPrestacao>(
      `http://localhost:8000/prestacao/${prestacao_id}/receitas`
    );
  }

  createReceita(receita: Receita) {
    const request: ReceitaRequest = { ...receita };
    return this.http.post<Receita>('http://localhost:8000/receita', request);
  }

  updateReceita(receita: Receita) {
    const id = receita.receita_id;
    const request: ReceitaRequest = { ...receita };
    return this.http.put<Receita>(
      `http://localhost:8000/receita/${id}`,
      request
    );
  }

  deleteReceita(receita: Receita) {
    const id = receita.receita_id;
    return this.http.delete(`http://localhost:8000/receita/${id}`);
  }

  getAnexoUrl(receita: Receita) {
    const id = receita.receita_id;
    return `http://localhost:8000/receita/${id}/anexo`;
  }

  scheduleDeleteAnexo(receita: Receita, anexoId: number) {
    this.deleteAnexoQueue.push({ receita, anexoId });
  }

  deleteAnexo(receita: Receita, anexoId: number) {
    const id = receita.receita_id;
    return this.http.delete(
      `http://localhost:8000/receita/${id}/anexo/${anexoId}`
    );
  }

  deleteScheduledAnexos() {
    return from(this.deleteAnexoQueue).pipe(
      mergeMap(({ receita, anexoId }) => this.deleteAnexo(receita, anexoId)),
      catchError((error) => of(error)),
      toArray(),
      tap(() => (this.deleteAnexoQueue = []))
    );
  }

  emptyDeleteAnexoQueue() {
    this.deleteAnexoQueue = [];
  }

  uploadAnexos(dropzoneControl: DropzoneControl) {
    return dropzoneControl.processQueue().pipe(first());
  }
}
