import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCpfCnpjMask]',
})
export class CpfCnpjMaskDirective {
  constructor(public ngControl: NgControl) {}

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event) {
    if (event) {
      this.onInputChange(event, false);
    }
  }

  // da pra tirar esse backspace
  onInputChange(event, backspace) {
    // Remove todos os caracteres não-numéricos
    let newVal = event.replace(/\D/g, '');

    // Verifica se é CPF ou CNPJ
    if (newVal.length <= 11) {
      newVal = newVal.replace(/(\d{3})(\d)/, '$1.$2');
      newVal = newVal.replace(/(\d{3})(\d)/, '$1.$2');
      newVal = newVal.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      newVal = newVal.replace(/^(\d{2})(\d)/, '$1.$2');
      newVal = newVal.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      newVal = newVal.replace(/\.(\d{3})(\d)/, '.$1/$2');
      newVal = newVal.replace(/(\d{4})(\d)/, '$1-$2');
    }
    // Atualiza o valor no formulário
    this.ngControl.valueAccessor.writeValue(newVal);
  }
}
