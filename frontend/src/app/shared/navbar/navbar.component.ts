import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarService } from 'src/app/sidebar/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() pageTitle = '';
  @Input() actionButtonText = '';
  @Input() loading = false;
  @Input() showActionButton = true;
  @Input() showSearchButtons = true;
  @Output() actionButtonClicked = new EventEmitter<void>();

  constructor(private sidebarService: SidebarService) {}

  openSidebar() {
    this.sidebarService.openSidebar();
  }

  onActionButtonClicked() {
    this.actionButtonClicked.emit();
  }
}
