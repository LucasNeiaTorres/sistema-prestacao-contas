import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DadosCadastraisService } from 'src/app/shared/dados-cadastrais.service';
import { ErrorHandlerService } from 'src/app/shared/error-handler.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormService } from 'src/app/tutorial/form.service';

@Component({
  selector: 'app-curatelado',
  templateUrl: './curatelado.component.html',
  styleUrls: ['./curatelado.component.scss'],
})
export class CurateladoComponent implements OnInit {
  isLoading = false;
  form: FormGroup = new FormGroup({});
  formSubscription = new Subscription();
  editMode = false;
  id: number;

  constructor(
    private dadosCadastraisService: DadosCadastraisService,
    private formService: FormService,
    private handleError: ErrorHandlerService,
    private cd: ChangeDetectorRef,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // quando clica novamnete no curatelado ele não redireciona para o primeiro curatelado
    this.route.firstChild?.params.subscribe((params: Params) => {
      this.id = Number(+params['id']);
      if (this.id) this.editMode = true;
    });
    // tira essa função quando houver a tela de curatelados - ela esta redirecionando sempre para o primeiro curatelado
    if (!this.editMode) this.redirecionaCuratelado();
    // if (this.editMode)
    //   this.router.navigate([this.id], { relativeTo: this.route });
    // else {
    //   localStorage.removeItem('form-curatelado');
    //   this.router.navigate(['novo'], { relativeTo: this.route });
    // }
    this.formSubscription = this.formService.formCuratelado.subscribe(
      (form) => (this.form = form)
    );
  }

  redirecionaCuratelado() {
    this.dadosCadastraisService.fetchList('usuario/curatelados').subscribe({
      next: (curatelado) => {
        const id = curatelado[0].curatelado_id;
        this.router.navigate([id], { relativeTo: this.route });
        this.editMode = true;
        this.id = id;
      },
      error: (error) => {
        localStorage.removeItem('form-curatelado');
        this.router.navigate(['novo'], { relativeTo: this.route });
        this.editMode = false;
      },
    });
  }

  onCadastrar() {
    const form = this.formService.getFormCuratelado().getRawValue();
    this.isLoading = true;
    if (this.editMode) {
      this.dadosCadastraisService.editCuratelado(form, this.id).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.clearToasts();
          localStorage.removeItem('form-curatelado');
          this.toastService.addToast(
            'Curatelado alterado com sucesso!',
            'success'
          );
        },
        error: (error) => {
          this.handleError.handle(error);
          this.isLoading = false;
        },
      });
    } else {
      this.dadosCadastraisService.submitCuratelado(form).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.clearToasts();
          this.form.reset();
          localStorage.removeItem('form-curatelado');
          this.toastService.addToast(
            'Curatelado cadastrado com sucesso!',
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
