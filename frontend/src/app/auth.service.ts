import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap, tap } from 'rxjs';
import { DadosCadastraisService } from './shared/dados-cadastrais.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private dadosCadastraisService: DadosCadastraisService,
    private router: Router
  ) {}

  login(email: string, senha: string): Observable<any> {
    const body = new HttpParams().set('username', email).set('password', senha);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post('http://0.0.0.0:8000/login', body.toString(), {
        headers,
      })
      .pipe(tap((res) => this.setToken(res)));
  }

  submitUser(body: any): Observable<any> {
    if (!body) return null;
    body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, '');
    delete body.confirmaSenha;

    return this.dadosCadastraisService
      .postForm(body, 'usuario', false)
      .pipe(mergeMap((res) => this.login(body.email, body.senha)));
  }

  setToken(res: any): void {
    localStorage.setItem('token', res['access_token']);
  }

  getToken(): string {
    return localStorage.getItem('token');
  }

  logout(): void {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    this.http
      .post(
        'http://0.0.0.0:8000/logout/',
        {},
        {
          headers: headers,
        }
      )
      .subscribe({
        next: () => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err)
          this.router.navigate(['/login']);
        }
        ,
      });
  }

  // forgotPassword

  // isLoggedIn

  // isLoggedOut

  // refreshToken - quando der 401
}
