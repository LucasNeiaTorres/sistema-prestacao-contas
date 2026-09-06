import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoveModalComponent } from './remove-modal.component';
import { Subject, first, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RemoveModalService {
  isRemove = new Subject<boolean>();

  constructor(private modalService: NgbModal) {}

  open() {
    const modalRef = this.modalService.open(RemoveModalComponent);
    modalRef.componentInstance.loading = false;
    modalRef.dismissed.pipe(first()).subscribe(() => this.dismiss());
    return this.isRemove.pipe(
      tap((res) => {
        if (res)
          modalRef.componentInstance.loading = true;
      })
    );
  }

  fechaModal() {
    this.modalService.dismissAll();
  }

  remove() {
    this.isRemove.next(true);
  }

  dismiss() {
    this.isRemove.next(false);
  }
}
