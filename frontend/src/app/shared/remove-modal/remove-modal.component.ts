import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoveModalService } from './remove-modal.service';

@Component({
  selector: 'app-remove-modal',
  templateUrl: './remove-modal.component.html',
  styleUrls: ['./remove-modal.component.scss']
})
export class RemoveModalComponent{
  activeModal = inject(NgbActiveModal);
  @Input() loading: string;

  constructor(private removeModalService: RemoveModalService) { }

  onRemove() {
    this.removeModalService.remove();
  }

  onDismiss() {
    this.removeModalService.dismiss();
  }
}
