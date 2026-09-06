import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { ToastService } from '../shared/toast/toast.service';
import { MatStepper, MatStepperNext } from '@angular/material/stepper';
import { CurateladoService } from '../shared/curatelado.service';
import { DadosCadastraisService } from '../shared/dados-cadastrais.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { FormService } from './form.service';
import { BehaviorSubject, Subscription, fromEvent, map } from 'rxjs';
import { PrestacaoService } from '../prestacao/prestacao.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class TutorialComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  form: FormGroup = new FormGroup({});
  step: number = 1;
  isLoading = false;
  steps: String[] = [
    'Cadastrar Curador',
    'Cadastrar Curatelado',
    'Cadastrar Prestação',
    'Cadastrar Endereço do Curatelado',
    'Cadastrar Residentes do Endereço',
  ];
  formSubscription = new Array<Subscription>();
  windowWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);
  windowWidthSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sidebarService: SidebarService,
    private toastService: ToastService,
    private cd: ChangeDetectorRef,
    private curateladoService: CurateladoService,
    private dadosCadastraisService: DadosCadastraisService,
    private handleError: ErrorHandlerService,
    private formTutorialService: FormService,
    private prestacaoService: PrestacaoService
  ) {}

  ngOnInit(): void {
    // ouve mudanças nos forms e atualiza o form principal
    this.formSubscription.push(
      this.formTutorialService.formCurador.subscribe((form) =>
        this.form.setControl('curador', form)
      )
    );
    this.formSubscription.push(
      this.formTutorialService.formCuratelado.subscribe((form) =>
        this.form.setControl('curatelado', form)
      )
    );
    this.formSubscription.push(
      this.formTutorialService.formEndereco.subscribe((form) =>
        this.form.setControl('endereco', form)
      )
    );
    this.formSubscription.push(
      this.formTutorialService.formPrestacao.subscribe((form) =>
        this.form.setControl('prestacao', form)
      )
    );
    this.formSubscription.push(
      this.formTutorialService.formResidentes.subscribe((form) =>
        this.form.setControl('residentes', form)
      )
    );
    // localStorage.setItem('step', '1');
    this.step = Number(localStorage.getItem('step'));
    if (!this.step) {
      this.step = 1;
      localStorage.setItem('step', '1');
    }
    this.router.navigate([this.step], { relativeTo: this.route });

    this.sidebarService.disableSidebar();

    // verifica tamanho da tela para ajustar com o resize da tela
    this.windowWidthSubscription = fromEvent(window, 'resize')
      .pipe(map(() => window.innerWidth))
      .subscribe((width) => {
        this.windowWidth.next(width);
      });
  }

  ngAfterViewChecked() {
    if (
      this.stepper.steps.length > 4 &&
      !this.resideCasaRepouso() &&
      this.step === 5
    ) {
      this.stepper.selectedIndex = 4;
    }
    this.cd.detectChanges();
  }

  isDesktop() {
    // 992px é o breakpoint lg do bootstrap
    return this.windowWidth.value > 992;
  }

  // se reside_casa_repouso ou null (valor padrao) retorna true, senao false
  resideCasaRepouso() {
    if (
      this.form.get('endereco').get('reside_casa_repouso') === null ||
      this.form.get('endereco').get('reside_casa_repouso').value === null
    )
      return true;
    return this.form.get('endereco').get('reside_casa_repouso').value;
  }

  residentesInvalidos() {
    return (
      (this.form.get('residentes').status === 'INVALID' && this.step === 5) ||
      false
    );
  }

  valorProgressBar() {
    if (this.resideCasaRepouso()) return 25 * (this.step - 1);
    return 20 * (this.step - 1);
  }

  qtdeSteps() {
    if (!this.resideCasaRepouso()) return 5;
    return 4;
  }

  removeStep() {
    if (this.step == 1) return;

    this.step--;
    localStorage.setItem('step', String(this.step));
    this.router.navigate([this.step], { relativeTo: this.route });
  }

  addStep() {
    this.step++;
    localStorage.setItem('step', String(this.step));
    // da next no stepper mobile
    this.router.navigate([this.step], { relativeTo: this.route });
    // da next no stepper desktop
    MatStepperNext;
  }

  onProximo() {
    this.addStep();
    this.router.navigate([this.step], { relativeTo: this.route });
  }

  onAnterior() {
    this.removeStep();
    if (this.step === 1) {
      this.router.navigate(['/tutorial']);
    } else {
      this.router.navigate([this.step], { relativeTo: this.route });
    }
  }

  submitCurador(isMobile: boolean = false) {
    const curador = this.formTutorialService.getFormCurador().getRawValue();

    this.isLoading = true;
    this.dadosCadastraisService.submitCurador(curador).subscribe({
      next: (res) => {
        // força a atualização do curador_id
        this.prestacaoService.forceFetchCurador();
        this.addStep();
        localStorage.removeItem('form-curador');
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError.handle(error);
        this.isLoading = false;
      },
    });
  }

  submitCuratelado(isMobile: boolean = false) {
    const curatelado = this.formTutorialService
      .getFormCuratelado()
      .getRawValue();

    this.isLoading = true;

    this.dadosCadastraisService.submitCuratelado(curatelado).subscribe({
      next: (res) => {
        // força a atualização da lista de curatelados
        this.curateladoService.forceFetchCuratelados();
        // força a atualização do curatelado_id
        this.prestacaoService.forceFetchCuratelado();
        this.addStep();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError.handle(error);
        this.isLoading = false;
      },
    });
  }

  submitPrestacao() {
    const prestacao = this.formTutorialService.getFormPrestacao().getRawValue();
    const endereco = this.formTutorialService.getFormEndereco().getRawValue();
    const residentes = this.formTutorialService
      .getFormResidentes()
      .getRawValue();
    this.isLoading = true;
    this.dadosCadastraisService
      .submitPrestacao(prestacao, endereco, residentes)
      .subscribe({
        next: (res) => {
          this.addStep();
          this.router.navigate(['/receitas']);
          this.sidebarService.enableSidebar();
          this.isLoading = false;
          this.toastService.addToast(
            'Prestação de contas cadastrada com sucesso!',
            'success'
          );
          localStorage.removeItem('step');
          this.formTutorialService.removePrestacaoStorage();
          this.prestacaoService.setPrestacaoAtual({
            prestacao_id: res.id,
            nome_curatelado: res.nome_curatelado,
            ano_inicial: prestacao.data_inicial,
          });
        },
        error: (error) => {
          this.handleError.handle(error);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.formSubscription.forEach((subscription) => subscription.unsubscribe());
    if (this.windowWidthSubscription) {
      this.windowWidthSubscription.unsubscribe();
    }
  }
}
