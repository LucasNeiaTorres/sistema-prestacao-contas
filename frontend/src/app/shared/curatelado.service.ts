import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, map } from 'rxjs';

interface Curatelado {
  curatelado_id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class CurateladoService {
  curatelados = new Subject<Curatelado[]>();

  constructor(private http: HttpClient) {}

  fetchCuratelados() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );

    return this.http
      .get<Curatelado[]>('http://localhost:8000/usuario/curatelados', {
        headers: headers,
      })
      .pipe(
        map((curatelados) =>
          // converte os curatelados para o formato esperado
          curatelados.map((curatelado) => ({
            nome: curatelado.nome,
            curatelado_id: curatelado.curatelado_id,
          }))
        )
      );
  }

  // força a atualização dos curatelados
  forceFetchCuratelados() {
    this.fetchCuratelados().subscribe((curatelados) =>
      this.curatelados.next(curatelados)
    );
  }
}
