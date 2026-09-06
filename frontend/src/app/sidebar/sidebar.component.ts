import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService } from './sidebar.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DadosCadastraisService } from '../shared/dados-cadastrais.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @ViewChild('sidebarMobile') sidebarMobile!: TemplateRef<any>;

  isMinhaContaCollapsed = true;
  isPrestacaoCollapsed = false;

  isEnabled = true;

  constructor(
    private offcanvasService: NgbOffcanvas,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // No mobile, o sidebar fica escondido.
    // SidebarService é responsável por abrir e fechar o sidebar.
    this.sidebarService.sidebarSubject.subscribe((open) => {
      if (open) {
        this.offcanvasService.open(this.sidebarMobile, {
          panelClass: 'app-shadow border-0 w-75 app-mw-17-5',
        });
      } else {
        this.offcanvasService.dismiss();
      }
    });

    this.sidebarService.sidebarEnableSubject.subscribe((isEnabled) => {
      this.isEnabled = isEnabled;
    });
  }

  temPrestacaoSelecionada() {
    if (localStorage.getItem('prestacao_atual')) return true;
    return false;
  }

  prestacaoSelecionada() {
    const prestacao = JSON.parse(localStorage.getItem('prestacao_atual'));
    const final_nome = prestacao['nome_curatelado'].length > 14 ? '...' : '';
    const nome_curatelado = prestacao['nome_curatelado'].slice(0, 14) + final_nome;
    return nome_curatelado + ' - ' + prestacao['ano_inicial'];
  }

  closeSidebar() {
    this.offcanvasService.dismiss();
  }

  onSair() {
    this.authService.logout();
  }
}
