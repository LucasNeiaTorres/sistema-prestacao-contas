import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  validarRangeDatas,
  validarData,
} from '../../shared/validators.service';
import { CurateladoService } from '../../shared/curatelado.service';
import { FormService, FormName } from 'src/app/tutorial/form.service';
import { DadosCadastraisService } from 'src/app/shared/dados-cadastrais.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PrestacaoService } from '../prestacao.service';

class Curatelado {
  curatelado_id: number;
  nome: string;
}

@Component({
  selector: 'app-cadastro-prestacao',
  templateUrl: './cadastro-prestacao.component.html',
  styleUrls: ['./cadastro-prestacao.component.scss'],
})
export class CadastroPrestacaoComponent {
  form: FormGroup;
  formName: FormName = 'prestacao';
  curatelados: Curatelado[] = [];
  curateladosSubscription: Subscription;
  curatelado_idSubscription: Subscription;
  curador_idSubscription: Subscription;
  step: number;
  editMode = false;
  id: number;
  validators = {
    curatelado_id: [Validators.required],
    curador_id: [Validators.required],
    numero_processo: [Validators.required],
    situacao_prestacao_anterior: [Validators.required],
    tipo_interdicao: [Validators.required],
    motivo_interdicao: [Validators.required],
    data_termo: [Validators.required, validarData],
    data_inicial: [Validators.required, validarData],
    data_final: [Validators.required],
  };

  constructor(
    private formService: FormService,
    private curateladoService: CurateladoService,
    private dadosCadastraisService: DadosCadastraisService,
    private route: ActivatedRoute,
    private router: Router,
    private prestacaoService: PrestacaoService,
  ) {}

  ngOnInit(): void {
    // verifica se é editMode
    this.route.firstChild?.params.subscribe((params: Params) => {
      const id = Number(+params['id']);
      if (id) this.id = id;
      this.editMode = this.id != null;
    });

    // dá get nos curatelados
    this.curateladosSubscription = this.curateladoService
      .fetchCuratelados()
      .subscribe((curatelados) => (this.curatelados = curatelados));

    // adiciona os FormControls iniciados com null do form instanciando com os validadores
    this.form = new FormGroup({});
    Object.keys(this.validators).forEach((campo) => {
      if (campo === 'data_inicial' || campo === 'data_final')
        this.form.addControl(
          campo,
          new FormControl(null, [
            ...this.validators[campo],
            validarRangeDatas(this.form),
          ])
        );
      else
        this.form.addControl(
          campo,
          new FormControl(null, this.validators[campo])
        );
    });
    this.formService.setFormPrestacao(this.form);

    // seta os curatelados no form quando valor dos curatelados no serviço alterar
    this.curateladosSubscription = this.curateladoService.curatelados.subscribe(
      (curatelados) => (this.curatelados = curatelados)
    );

    if (!this.editMode) {
      // se houver mais de um curador algum dia terá que ser alterado
      // dá get no curatelado_id e curador_id
      this.curador_idSubscription = this.prestacaoService
        .fetchCuradorId()
        .subscribe({
          next: (curador_id) =>
            this.form.get('curador_id').setValue(curador_id),
        });

      this.curatelado_idSubscription = this.prestacaoService
        .fetchCurateladoId()
        .subscribe({
          next: (curatelado_id) =>
            this.form.get('curatelado_id').setValue(curatelado_id),
        });

      // seta o curador_id no form quando valor do curador_id no serviço alterar
      this.prestacaoService.curador_id.subscribe((curador_id) => {
        this.form.get('curador_id').setValue(curador_id);
      });

      // seta o curatelado_id no form quando valor do curatelado_id no serviço alterar
      this.prestacaoService.curatelado_id.subscribe((curatelado_id) => {
        this.form.get('curatelado_id').setValue(curatelado_id);
      });
    }

    // se houver mudança no form do serviço, atualiza o form - usado para editMode
    this.formService.formPrestacao.subscribe((form) => {
      if (form) this.form = form;
      this.setaValidadores();
    });
  }

  ngAfterViewInit(): void {
    if (!this.form.controls['numero_processo'].validator)
      this.setaValidadores();
  }

  fetchPrestacao(id: number): void {
    this.dadosCadastraisService.fetch('prestacao', id).subscribe({
      next: (prestacao) => {
        this.form.patchValue(prestacao);
        this.formService.setFormPrestacao(this.form);
      },
      error: (error) => {
        this.router.navigate(['selecionar-prestacao/']);
      },
    });
  }

  setaValidadores(): void {
    Object.keys(this.form.controls).forEach((campo) => {
      if (campo === 'data_inicial' || campo === 'data_final')
        this.form.controls[campo].setValidators([
          ...this.validators[campo],
          validarRangeDatas(this.form),
        ]);
      else this.form.controls[campo].setValidators(this.validators[campo]);
      if (this.form.controls[campo].value !== null)
        this.form.controls[campo].markAsTouched();
      this.form.controls[campo].updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.curateladosSubscription.unsubscribe();
    if (!this.editMode) {
      this.curatelado_idSubscription.unsubscribe();
      this.curador_idSubscription.unsubscribe();
    }
  }
}
