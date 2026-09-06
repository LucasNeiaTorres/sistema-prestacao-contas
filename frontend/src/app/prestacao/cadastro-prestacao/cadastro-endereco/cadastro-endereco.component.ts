import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validarCep } from 'src/app/shared/validators.service';
import { HttpClient } from '@angular/common/http';
import { FormService, FormName } from 'src/app/tutorial/form.service';

@Component({
  selector: 'app-cadastro-endereco',
  templateUrl: './cadastro-endereco.component.html',
  styleUrls: ['./cadastro-endereco.component.scss'],
})
export class CadastroEnderecoComponent {
  form: FormGroup;
  formName: FormName = 'endereco';
  step: number;
  validators = {
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
    reside_casa_repouso: [Validators.required],
  };

  constructor(private formService: FormService, private http: HttpClient) {}

  ngOnInit(): void {
    // se o formEndereco existir e contiver a propriedade cep
    if (
      this.formService.getFormEndereco() &&
      this.formService.getFormEndereco().contains('cep')
    ) {
      this.form = this.formService.getFormEndereco();

      this.step = Number(localStorage.getItem('step'));
      if (!this.step) {
        this.step = 1;
        localStorage.setItem('step', '1');
      }
      // se o form não tiver validadores (provavelmente foi preenchido pelo localStorage)
      if (!this.form.controls['cep'].validator) {
        this.setaValidadores();
        this.formService.setFormEndereco(this.form);
      }
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
      this.formService.setFormEndereco(this.form);
    }

    // se ouver mudança no form do serviço, atualiza o form - usado para editMode
    this.formService.formEndereco.subscribe((form) => {
      if (form) this.form = form;
      this.setaValidadores();
    });
  }

  ngAfterViewInit(): void {
    if (!this.form.controls['cep'].asyncValidator) this.setaValidadores();
  }

  loadingCep(): boolean {
    return this.form.get('cep').status === 'PENDING';
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
    this.form.controls['cep'].patchValue(this.form.controls['cep'].value);
    this.form.controls['estado']?.disable();
    this.form.controls['cidade']?.disable();
  }
}
