import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  sidebarSubject = new Subject<boolean>();
  sidebarEnableSubject = new Subject<boolean>();

  constructor() {}

  openSidebar() {
    this.sidebarSubject.next(true);
  }

  closeSidebar() {
    this.sidebarSubject.next(false);
  }

  enableSidebar() {
    this.sidebarEnableSubject.next(true);
  }

  disableSidebar() {
    this.sidebarEnableSubject.next(false);
  }
}
