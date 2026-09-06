import { Component } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-pagina-em-desenvolvimento',
  templateUrl: './pagina-em-desenvolvimento.component.html',
  styleUrls: ['./pagina-em-desenvolvimento.component.scss'],
})
export class PaginaEmDesenvolvimentoComponent {
  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {}

  openSidebar() {
    this.sidebarService.openSidebar();
  }
}
