import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  NgbActiveOffcanvas,
  NgbOffcanvas,
  NgbOffcanvasOptions,
  NgbOffcanvasRef,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, map, merge, mergeMap } from 'rxjs';
import { DropzoneComponent } from '../dropzone/dropzone.component';

@Component({
  selector: 'app-offcanvas',
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss'],
})
export class OffcanvasComponent {
  @ViewChild('offcanvas') offcanvas: any;
  @ViewChild(DropzoneComponent) dropzone: DropzoneComponent;

  activeInstance: NgbOffcanvasRef | undefined = undefined;

  constructor(private offcanvasService: NgbOffcanvas) {}

  dismiss(reason?: any): void {
    this.activeInstance?.dismiss(reason);
  }

  close(reason?: any): void {
    this.activeInstance?.close(reason);
  }

  open(options?: NgbOffcanvasOptions): void {
    this.activeInstance = this.offcanvasService.open(this.offcanvas, {
      scroll: true,
      position: 'end',
      panelClass: 'app-shadow border-0 app-force-w-md-100',
      // backdrop: 'static',
      // keyboard: false,
      ...options,
    });
  }

  get closed() {
    return this.activeInstance?.closed;
  }

  get dismissed() {
    return this.activeInstance?.dismissed;
  }

  get shown() {
    return this.activeInstance?.shown;
  }

  get hidden() {
    return this.activeInstance?.hidden;
  }
}
