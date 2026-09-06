import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Directive({
  selector: '[formGroup][storage]',
})
export class FormStorageDirective implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() storage: string;
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.updateFormValue();
    this.listenUpdateValue();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFormValue(): void {
    const storageValue = JSON.parse(localStorage.getItem(this.storage));
    if (storageValue) {
      // itera sobre cada control do storage
      Object.keys(storageValue).forEach((key) => {
        if (Array.isArray(storageValue[key])) {
          // seta o valor do formArray de formGroups com o valor do storage
          const formArray = new FormArray(storageValue[key].map(item => new FormGroup(this.toFormControl(item))));
          this.formGroup.setControl(key, formArray);
        } else {
          // seta o valor do formGroup com o valor do storage
          // this.formGroup.setControl(key,new FormGroup(this.toFormControl(storageValue[key])));
          this.formGroup.setControl(key, new FormControl(storageValue[key]));
        }
      });
    }
  }

  // transforma um objeto em um objeto de FormControl
  private toFormControl(object): {[key: string]: FormControl | FormArray | FormGroup } {
    const formControls: { [key: string]: FormControl | FormArray | FormGroup } = {};
    // retorna um array de todas as propriedades enumeráveis encontradas sobre um dado objeto
    for (const key in object) {
      // verifica se a propriedade é uma propriedade enumerável do objeto
      if (object.hasOwnProperty(key)) {
        if (Array.isArray(object[key])) {
          // cria um novo FormArray de FormGroups com os valores do array
          formControls[key] = new FormArray(object[key].map(item => new FormGroup(this.toFormControl(item))));
        } else {
          // cria um novo FormControl com o valor da propriedade
          formControls[key] = new FormControl(object[key]);
        }
      }
    }
    return formControls;
  }

  private listenUpdateValue(): void {
    this.formGroup.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((value) =>
        localStorage.setItem(this.storage, JSON.stringify(this.formGroup.getRawValue()))
      );
  }
}
