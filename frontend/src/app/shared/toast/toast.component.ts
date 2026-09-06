import { Component } from '@angular/core';
import { ToastService } from './toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toasts = [];
  toastsSubscription: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastsSubscription = this.toastService.toastsSubject.subscribe((toasts) => {
      if (toasts[0]?.msg)
        this.toasts = toasts;
    });
  }

  closeToast(index: number): void {
    this.toastService.deleteToast(index);
  }
  
  ngOnDestroy(): void {
    this.toastsSubscription.unsubscribe();
  }
}
