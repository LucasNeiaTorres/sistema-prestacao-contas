import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-floating-buttom',
  templateUrl: './floating-buttom.component.html',
  styleUrls: ['./floating-buttom.component.scss'],
})
export class FloatingButtomComponent {
  @Output() clickEvent = new EventEmitter<void>();

  onClick() {
    this.clickEvent.emit();
  }
}
