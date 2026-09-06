import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

export type FormName = 'curador' | 'curatelado' | 'prestacao' | 'endereco' | 'residentes';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  formCurador = new BehaviorSubject<FormGroup>(new FormGroup({}));
  formCuratelado = new BehaviorSubject<FormGroup>(new FormGroup({}));
  formPrestacao = new BehaviorSubject<FormGroup>(new FormGroup({}));
  formEndereco = new BehaviorSubject<FormGroup>(new FormGroup({}));
  formResidentes = new BehaviorSubject<FormArray>(new FormArray([]));

  constructor() {}
  
  setFormCurador(form: FormGroup) {
    this.formCurador.next(form);
  }

  setFormCuratelado(form: FormGroup) {
    this.formCuratelado.next(form);
  }

  setFormPrestacao(form: FormGroup) {
    this.formPrestacao.next(form);
  }

  setFormEndereco(form: FormGroup) {
    this.formEndereco.next(form);
  }

  setFormResidentes(form: FormArray) {
    this.formResidentes.next(form);
  }

  getFormCurador(): FormGroup {
    return this.formCurador.value;
  }

  getFormCuratelado(): FormGroup {
    return this.formCuratelado.value;
  }

  getFormPrestacao(): FormGroup {
    return this.formPrestacao.value;
  }

  getFormEndereco(): FormGroup {
    return this.formEndereco.value;
  }

  getFormResidentes(): FormArray {
    return this.formResidentes.value;
  }

  removeResidentesStorage() {
    let index = 0;
    while (localStorage.getItem(`form-residente-${index}`)) {
      localStorage.removeItem(`form-residente-${index}`);
      index++;
    }
  }

  removePrestacaoStorage() {
    localStorage.removeItem('form-prestacao');
    localStorage.removeItem('form-endereco');
    this.removeResidentesStorage();
  }
}
