import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCepMask]'
})
export class CepMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event) {
    const initialValue = this.el.nativeElement.value;

    this.el.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
    if (this.el.nativeElement.value.length > 5) {
      this.el.nativeElement.value = `${this.el.nativeElement.value.slice(0, 5)}-${this.el.nativeElement.value.slice(5, 8)}`;
    }

    if (initialValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
