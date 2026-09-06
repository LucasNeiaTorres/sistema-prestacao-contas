import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DadosCadastraisService {
  constructor(private http: HttpClient) {}

  // função genérica para enviar um formulário para o backend
  postForm(
    body: any,
    formName: string,
    isAuth: boolean = true
  ): Observable<any> {
    let headers = {};
    if (isAuth) {
      headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${localStorage.getItem('token')}`
      );
    }
    return this.http.post('http://0.0.0.0:8000/' + formName + '/', body, {
      headers: headers,
    });
  }

  // função genérica para enviar um put para o backend
  putForm(body: any, formName: string, id: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.put('http://0.0.0.0:8000/' + formName + '/' + id, body, {
      headers: headers,
    });
  }

  formataCurador(curador: any): any {
    curador.cpf_cnpj = curador.cpf_cnpj.replace(/\D/g, '');
    curador.cep = curador.cep.replace(/\D/g, '');
    return curador;
  }

  editCurador(body: any, id: number): Observable<any> {
    if (!body) return null;
    body = this.formataCurador(body);

    return this.putForm(body, 'curador', id);
  }

  submitCurador(body: any): Observable<any> {
    if (!body) return null;
    body = this.formataCurador(body);

    return this.postForm(body, 'curador');
  }

  formataCuratelado(curatelado: any): any {
    curatelado.cpf = curatelado.cpf.replace(/\D/g, '');
    return curatelado;
  }

  editCuratelado(body: any, id: number): Observable<any> {
    if (!body) return null;
    body = this.formataCuratelado(body);

    return this.putForm(body, 'curatelado', id);
  }

  submitCuratelado(body: any): Observable<any> {
    if (!body) return null;
    body = this.formataCuratelado(body);

    return this.postForm(body, 'curatelado');
  }

  formataPrestacao(
    prestacao: any,
    endereco: any,
    residentes: any,
    editMode: boolean = false
  ): any {
    endereco.cep = endereco.cep.replace(/\D/g, '');

    residentes?.forEach((residente) => {
      residente.cpf = residente.cpf.replace(/\D/g, '');
    });

    let nome_prestacao: string;
    let nome_residentes: string;
    if (!editMode) {
      nome_prestacao = 'nova_prestacao';
      nome_residentes = 'novos_residentes';
    } else {
      nome_prestacao = 'prestacao';
      nome_residentes = 'residentes';
    }

    const body = {
      [nome_prestacao]: {
        ...prestacao,
        ...endereco,
      },
      [nome_residentes]: residentes,
    };

    return body;
  }

  editPrestacao(
    body_prestacao: any,
    body_endereco: any,
    body_residentes: any,
    id: number
  ): Observable<any> {
    if (!body_prestacao || !body_endereco) return null;
    const body = this.formataPrestacao(
      body_prestacao,
      body_endereco,
      body_residentes,
      true
    );

    return this.putForm(body, 'prestacao', id);
  }

  submitPrestacao(
    body_prestacao: any,
    body_endereco: any,
    body_residentes: any
  ): Observable<any> {
    if (!body_prestacao || !body_endereco) return null;
    const body = this.formataPrestacao(
      body_prestacao,
      body_endereco,
      body_residentes
    );
    return this.postForm(body, 'prestacao');
  }

  fetch(name: string, id: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.get('http://0.0.0.0:8000/' + name + '/' + id, {
      headers: headers,
    });
  }

  fetchList(path: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.get('http://0.0.0.0:8000/' + path + '/', {
      headers: headers,
    });
  }
}
