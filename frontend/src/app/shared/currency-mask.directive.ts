import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyMask]',
})
export class CurrencyMaskDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initialValue = this.el.nativeElement.value;

    // Remove non-numeric characters and commas
    const newValue = initialValue.replace(/[^\d]/g, '');

    // Truncate to 14 characters
    const truncatedValue = this.truncate(newValue, 14);

    // Format currency
    const formattedValue = this.formatCurrency(truncatedValue);

    // Set formatted value back to the input element
    this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);

    // Update the form control value
    this.ngControl.control.setValue(formattedValue, {
      emitEvent: false,
    });
  }

  private formatCurrency(value: string): string {
    if (!value) return '';

    const amount = parseFloat(value) / 100; // Convert to real value
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  }
}
