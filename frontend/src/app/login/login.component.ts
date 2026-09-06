import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { SidebarService } from '../sidebar/sidebar.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  error = null;
  passwordVisible = false;
  isLoading = false;

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sidebarService.disableSidebar();
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      senha: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onLogin() {
    if (this.form) {
      this.isLoading = true;

      this.authService
        .login(this.form.value.email, this.form.value.senha)
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res['access_token']);
            this.sidebarService.enableSidebar();
            this.router.navigate(['/selecionar-prestacao']);
            this.isLoading = false;
          },
          error: (error) => {
            this.error = error.error.detail;
            this.form.get('senha').reset();
            this.isLoading = false;
          },
        });
    }
  }

  ngOnChanges() {
    this.error = null;
  }

  onCadastrar() {
    this.router.navigate(['/cadastro-usuario']);
  }
}
