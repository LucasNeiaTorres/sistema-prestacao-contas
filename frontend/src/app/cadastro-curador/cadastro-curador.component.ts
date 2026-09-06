import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  validarDocumento,
  validarData,
  validarCep,
} from '../shared/validators.service';
import { HttpClient } from '@angular/common/http';
import { FormService, FormName } from '../tutorial/form.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DadosCadastraisService } from '../shared/dados-cadastrais.service';

@Component({
  selector: 'app-cadastro-curador',
  templateUrl: './cadastro-curador.component.html',
  styleUrls: ['./cadastro-curador.component.scss'],
})
export class CadastroCuradorComponent implements OnInit {
  form: FormGroup;
  formName: FormName = 'curador';
  editMode = false;
  id: number;
  validators = {
    nome: [Validators.required],
    email: [Validators.required, Validators.email],
    cpf_cnpj: [Validators.required, Validators.minLength(11), validarDocumento],
    rg: [Validators.required, Validators.minLength(9)], // 9 RG + 2 pontos + 1 traço
    data_nascimento: [Validators.required, validarData],
    estado_civil: [Validators.required],
    cep: [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(9), // 8 Números + 1 traço
    ],
    estado: [Validators.required],
    cidade: [Validators.required],
    bairro: [Validators.required],
    logradouro: [Validators.required],
    numero: [Validators.required],
    complemento: [],
  };

  constructor(
    private formService: FormService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dadosCadastraisService: DadosCadastraisService
  ) {}

  ngOnInit(): void {
    // verifica se é editMode
    this.route.params.subscribe((params: Params) => {
      const id = Number(+params['id']);
      if (id) this.id = id;
      this.editMode = this.id != null;
    });
    if (this.editMode) this.fetchCurador(this.id);
    // se o formCurador existir e contiver a propriedade nome
    if (
      this.formService.getFormCurador() &&
      this.formService.getFormCurador().contains('nome')
    ) {
      this.form = this.formService.getFormCurador();
      // se o form não tiver validadores (provavelmente foi preenchido pelo localStorage)
      if (!this.form.controls['nome'].validator) {
        this.setaValidadores();
      }
      this.formService.setFormCurador(this.form);
    } else {
      // adiciona os FormControls iniciados com null do form instanciando com os validadores
      this.form = new FormGroup({});
      Object.keys(this.validators).forEach((campo) => {
        this.form.addControl(
          campo,
          new FormControl(null, this.validators[campo])
        );
      });
      this.form.controls['cep']?.setAsyncValidators(
        validarCep(this.form, this.http)
      );
      this.form.controls['estado']?.disable();
      this.form.controls['cidade']?.disable();
      this.formService.setFormCurador(this.form);
    }
  }

  ngAfterViewInit() {
    if (!this.form.controls['nome'].validator) this.setaValidadores();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  setaValidadores() {
    Object.keys(this.form.controls).forEach((campo) => {
      this.form.controls[campo].setValidators(this.validators[campo]);
      if (this.form.controls[campo].value !== null)
        this.form.controls[campo].markAsTouched();
      this.form.controls[campo].updateValueAndValidity();
    });
    this.form.controls['cep']?.setAsyncValidators(
      validarCep(this.form, this.http)
    );
    this.form.controls['estado']?.disable();
    this.form.controls['cidade']?.disable();
  }

  fetchCurador(id: number) {
    this.dadosCadastraisService.fetch('curador', id).subscribe({
      next: (curador) => {
        this.form.patchValue(curador);
        this.formService.setFormCurador(this.form);
      },
      error: (error) => {
        this.form.reset();
        localStorage.removeItem('form-curador');
        this.router.navigate(['curador/']);
      },
    });
  }

  ngOnDestroy() {
    this.formService.setFormCurador(this.form);
  }
}
