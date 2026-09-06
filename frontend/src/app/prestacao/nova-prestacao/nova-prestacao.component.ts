import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Subscription, fromEvent, map } from 'rxjs';
import { DadosCadastraisService } from 'src/app/shared/dados-cadastrais.service';
import { ErrorHandlerService } from 'src/app/shared/error-handler.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FormService } from 'src/app/tutorial/form.service';
import { PrestacaoService } from '../prestacao.service';

@Component({
  selector: 'app-nova-prestacao',
  templateUrl: './nova-prestacao.component.html',
  styleUrls: ['./nova-prestacao.component.scss'],
})
export class NovaPrestacaoComponent implements OnInit {
  isLoading = false;
  form: FormGroup = new FormGroup({});
  formSubscription = new Array<Subscription>();
  editMode = false;
  id: number;
  activeNav = 1;
  windowWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);
  windowWidthSubscription: Subscription;

  constructor(
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private dadosCadastraisService: DadosCadastraisService,
    private toastService: ToastService,
    private handleError: ErrorHandlerService,
    private cd: ChangeDetectorRef,
    private prestacaoService: PrestacaoService
  ) {}

  ngOnInit(): void {
    // verifica se é editMode pela rota
    this.route.firstChild?.params.subscribe((params: Params) => {
      const id = Number(+params['id']);
      if (id) this.id = id;
      this.editMode = this.id != null;
    });

    // ouve mudanças nos forms e atualiza o form principal
    this.formSubscription.push(
      this.formService.formEndereco.subscribe((form) =>
        this.form.setControl('endereco', form)
      )
    );
    this.formSubscription.push(
      this.formService.formPrestacao.subscribe((form) =>
        this.form.setControl('prestacao', form)
      )
    );
    this.formSubscription.push(
      this.formService.formResidentes.subscribe((form) =>
        this.form.setControl('residentes', form)
      )
    );

    if (this.editMode) this.fetchPrestacao(this.id);

    // ouve mudanças no tamanho da tela
    this.windowWidthSubscription = fromEvent(window, 'resize')
      .pipe(map(() => window.innerWidth))
      .subscribe((width) => {
        this.windowWidth.next(width);
      });
  }

  // 992px é o breakpoint do lg no bootstrap
  isLgWidth(): boolean {
    return this.windowWidth.value > 992;
  }

  isMobileWidth(): boolean {
    return this.windowWidth.value <= 768;
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

  fetchPrestacao(id: number): void {
    this.dadosCadastraisService.fetch('prestacao', id).subscribe({
      next: (prestacao) => {
        const { body_endereco, body_prestacao } =
          this.separaEnderecoPrestacao(prestacao);
        const body_residentes = this.arrayToFormArray(prestacao.residentes);
        this.formService.setFormPrestacao(body_prestacao);
        this.formService.setFormEndereco(body_endereco);
        this.formService.setFormResidentes(body_residentes);
        this.formService.removePrestacaoStorage();
      },
      error: (error) => {
        this.router.navigate(['selecionar-prestacao/']);
      },
    });
  }

  // função para separar os dados de endereço e prestação para enviar ao service para editar prestação
  separaEnderecoPrestacao(prestacao: any): {
    body_endereco: FormGroup;
    body_prestacao: FormGroup;
  } {
    const body_endereco = new FormGroup({
      cep: new FormControl(prestacao.cep),
      bairro: new FormControl(prestacao.bairro),
      cidade: new FormControl(prestacao.cidade),
      complemento: new FormControl(prestacao.complemento),
      logradouro: new FormControl(prestacao.logradouro),
      estado: new FormControl(prestacao.estado),
      numero: new FormControl(prestacao.numero),
      reside_casa_repouso: new FormControl(prestacao.reside_casa_repouso),
    });

    const body_prestacao = new FormGroup({
      data_inicial: new FormControl(prestacao.data_inicial),
      data_final: new FormControl(prestacao.data_final),
      curatelado_id: new FormControl(prestacao.curatelado_id),
      curador_id: new FormControl(prestacao.curador_id),
      numero_processo: new FormControl(prestacao.numero_processo),
      situacao_prestacao_anterior: new FormControl(
        prestacao.situacao_prestacao_anterior
      ),
      tipo_interdicao: new FormControl(prestacao.tipo_interdicao),
      motivo_interdicao: new FormControl(prestacao.motivo_interdicao),
      data_termo: new FormControl(prestacao.data_termo),
    });
    return { body_endereco, body_prestacao };
  }

  arrayToFormArray(array: any[]): FormArray {
    return new FormArray(
      array.map((item) => {
        return new FormGroup({
          nome: new FormControl(item.nome),
          parentesco: new FormControl(item.parentesco),
          cpf: new FormControl(item.cpf),
        });
      })
    );
  }

  onCadastrar() {
    this.isLoading = true;
    const prestacao = this.formService.getFormPrestacao().getRawValue();
    const endereco = this.formService.getFormEndereco().getRawValue();
    const residentes = this.formService.getFormResidentes()
      ? this.formService.getFormResidentes().getRawValue()
      : [];
    if (this.editMode) {
      this.dadosCadastraisService
        .editPrestacao(prestacao, endereco, residentes, this.id)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.toastService.addToast(
              'Prestação de contas alterada com sucesso!',
              'success'
            );
            this.formService.removePrestacaoStorage();
            this.prestacaoService.setPrestacaoAtual({
              prestacao_id: this.id,
              nome_curatelado: res.nome_curatelado,
              ano_inicial: prestacao.data_inicial,
            });
            this.router.navigate(['/receitas']);
          },
          error: (error) => {
            this.handleError.handle(error);
            this.isLoading = false;
          },
        });
    } else {
      this.dadosCadastraisService
        .submitPrestacao(prestacao, endereco, residentes)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.toastService.addToast(
              'Prestação de contas cadastrada com sucesso!',
              'success'
            );
            this.formService.removePrestacaoStorage();
            this.prestacaoService.setPrestacaoAtual({
              prestacao_id: res.id,
              nome_curatelado: res.nome_curatelado,
              ano_inicial: prestacao.data_inicial,
            });
            this.router.navigate(['/receitas']);
          },
          error: (error) => {
            this.handleError.handle(error);
            this.isLoading = false;
          },
        });
    }
  }

  ngOnDestroy() {
    this.formSubscription.forEach((subscription) => subscription.unsubscribe());
    if (this.windowWidthSubscription) {
      this.windowWidthSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }
}
