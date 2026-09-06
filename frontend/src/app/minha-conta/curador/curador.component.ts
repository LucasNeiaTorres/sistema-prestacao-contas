import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DadosCadastraisService } from 'src/app/shared/dados-cadastrais.service';
import { ErrorHandlerService } from 'src/app/shared/error-handler.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormService } from 'src/app/tutorial/form.service';

@Component({
  selector: 'app-curador',
  templateUrl: './curador.component.html',
  styleUrls: ['./curador.component.scss'],
})
export class CuradorComponent implements OnInit {
  isLoading = false;
  form: FormGroup = new FormGroup({});
  formSubscription = new Subscription();
  editMode = false;
  id: number;

  constructor(
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private dadosCadastraisService: DadosCadastraisService,
    private toastService: ToastService,
    private handleError: ErrorHandlerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.firstChild?.params.subscribe((params: Params) => {
      const id = Number(+params['id']);
      if (id) this.id = id;
      this.editMode = this.id != null;
    });
    // tira essa função quando houver a tela de curadores - ela esta redirecionando sempre para o primeiro curador
    if (!this.editMode) this.redirecionaCurador();
    // if (this.editMode)
    //   this.router.navigate([this.id], { relativeTo: this.route });
    // else {
    //   localStorage.removeItem('form-curador');
    //   this.router.navigate(['novo'], { relativeTo: this.route });
    // }
    this.formSubscription = this.formService.formCurador.subscribe(
      (form) => (this.form = form)
    );
  }

  redirecionaCurador() {
    this.dadosCadastraisService.fetchList('usuario/curadores').subscribe({
      next: (curador) => {
        const id = curador[0].curador_id;
        this.router.navigate([id], { relativeTo: this.route });
        this.editMode = true;
        this.id = id;
      },
      error: (error) => {
        localStorage.removeItem('form-curador');
        this.router.navigate(['novo'], { relativeTo: this.route });
      },
    });
  }

  onCadastrar() {
    const form = this.formService.getFormCurador().getRawValue();
    this.isLoading = true;
    if (this.editMode) {
      this.dadosCadastraisService.editCurador(form, this.id).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.clearToasts();
          localStorage.removeItem('form-curador');
          this.toastService.addToast(
            'Curador alterado com sucesso!',
            'success'
          );
        },
        error: (error) => {
          this.handleError.handle(error);
          this.isLoading = false;
        },
      });
    } else {
      this.dadosCadastraisService.submitCurador(form).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.clearToasts();
          this.form.reset();
          localStorage.removeItem('form-curador');
          this.toastService.addToast(
            'Curador cadastrado com sucesso!',
            'success'
          );
        },
        error: (error) => {
          this.handleError.handle(error);
          this.isLoading = false;
        },
      });
    }
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }
}
