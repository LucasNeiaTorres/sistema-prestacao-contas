import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../shared/toast/toast.service';
import {
  validarDocumento,
  validarSenhas,
  validarSenhasConfirmar,
} from '../shared/validators.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss'],
})
export class CadastroUsuarioComponent implements OnInit {
  form: FormGroup;
  error = null;
  passwordVisible1 = false;
  passwordVisible2 = false;
  isLoading = false;

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private toastService: ToastService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sidebarService.disableSidebar();
    this.form = new FormGroup({
      nome: new FormControl(null, [Validators.required]),
      cpf_cnpj: new FormControl(null, [
        Validators.required,
        Validators.minLength(11), // 11 CPF + 2 pontos + 1 traço
        validarDocumento,
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      senha: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        validarSenhas.bind(this),
      ]),
      confirmaSenha: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        validarSenhasConfirmar.bind(this),
      ]),
    });
  }

  onCadastrar(): void {
    if (this.form) {
      this.isLoading = true;
      let usuario = this.form.getRawValue();

      this.authService.submitUser(usuario).subscribe({
        next: (res) => {
          this.sidebarService.enableSidebar();
          localStorage.setItem('step', '1');
          this.router.navigate(['/tutorial']);
          this.toastService.clearToasts();
          this.toastService.addToast(
            'Usuário cadastrado com sucesso!',
            'success'
          );
          this.isLoading = false;
        },
        error: (error) => {
          this.errorHandler.handle(error);
          this.error = error.error.detail;
          this.isLoading = false;
        },
      });
    }
  }
}
