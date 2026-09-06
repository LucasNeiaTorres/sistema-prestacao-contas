import { Injectable } from '@angular/core';
import { ToastService } from './toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}

  handle(error: any): void {
    console.error(error);
    if (Array.isArray(error.error.detail)) {
      for (const key in error.error.detail) {
        if (error.error.detail[key].msg.includes('Input should be a valid'))
          this.toastService.addToast(
            'Campo obrigatório não preenchido',
            'danger'
          );
        else this.toastService.addToast(error.error.detail[key].msg, 'danger');
      }
    } else {
      this.toastService.addToast(error.error.detail, 'danger');
    }
  }
}
