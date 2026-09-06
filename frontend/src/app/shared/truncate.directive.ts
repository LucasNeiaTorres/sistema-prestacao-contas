import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTruncate]',
})
export class TruncateDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event) {
    const initialValue = this.el.nativeElement.value;
    if (initialValue.length > 255) {
      this.el.nativeElement.value = initialValue.slice(0, 255);
      event.stopPropagation();
    }
  }
}
