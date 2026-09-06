import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = [];
  toastsSubject = new BehaviorSubject([{ msg: null, tipo: null }]);

  constructor() {}

  addToast(toast: string, tipo: "danger" | "success" ): void {
    this.toasts.push({msg: toast, tipo: tipo});
    this.toastsSubject.next(this.toasts);
  }

  deleteToast(index: number): void {
    this.toasts.splice(index, 1);
    this.toastsSubject.next(this.toasts);
  }

  clearToasts(): void {
    this.toasts = [];
    this.toastsSubject.next(this.toasts);
  }
}
