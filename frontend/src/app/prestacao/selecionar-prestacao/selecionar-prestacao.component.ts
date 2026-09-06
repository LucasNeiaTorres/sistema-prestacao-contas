import { Component, OnInit } from '@angular/core';
import { PrestacaoService } from '../prestacao.service';
import { Prestacao, CurateladoPrestacoes } from '../prestacao.model';
import { RemoveModalService } from 'src/app/shared/remove-modal/remove-modal.service';
import { catchError, first, mergeMap, tap } from 'rxjs';
import { AnimacoesService } from 'src/app/shared/animacoes/animacoes.service';
import { Router } from '@angular/router';
import { FormService } from 'src/app/tutorial/form.service';

@Component({
  selector: 'app-selecionar-prestacao',
  templateUrl: './selecionar-prestacao.component.html',
  styleUrls: ['./selecionar-prestacao.component.scss'],
})
export class SelecionarPrestacaoComponent implements OnInit {
  // inicia com um array de CurateladoPrestacoes para haver cards para exibir no loading
  prestacoes = [
    new CurateladoPrestacoes('Curatelado 1', [
      new Prestacao(1, '01/01/2021', '01/02/2021', 12222, 100000),
      new Prestacao(2, '01/01/2021', '01/02/2021', 12222, 100000),
      new Prestacao(3, '01/01/2021', '01/02/2021', 12222, 100000),
    ]),
    new CurateladoPrestacoes('Curatelado 1', [
      new Prestacao(1, '01/01/2021', '01/02/2021', 12222, 100000),
      new Prestacao(2, '01/01/2021', '01/02/2021', 12222, 100000),
      new Prestacao(3, '01/01/2021', '01/02/2021', 12222, 100000),
    ]),
  ];
  prestacaoSelecionada = null;
  isCollapsed: boolean[] = [];
  isLoading = false;

  constructor(
    private prestacaoService: PrestacaoService,
    private removeModalService: RemoveModalService,
    private animacoesService: AnimacoesService,
    private router: Router,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    // inicia com os cards maximizados
    this.isCollapsed = this.prestacoes.map(() => false);
    this.isLoading = true;
    this.prestacaoService.fetchPrestacoes().subscribe({
      next: (response) => {
        this.prestacoes = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.prestacoes = [];
        this.isLoading = false;
      },
    });
  }

  onNovaPrestacao() {
    this.formService.removePrestacaoStorage();

    this.formService.setFormPrestacao(null);
    this.formService.setFormEndereco(null);
    this.formService.setFormResidentes(null);
    this.router.navigate(['cadastro-prestacao', 'nova']);
  }

  selecionarPrestacao(prestacao) {
    this.prestacaoSelecionada = prestacao;
  }

  onPrestar(
    prestacao_id: number,
    nome_curatelado: string,
    data_inicial: string
  ) {
    this.prestacaoService.setPrestacaoAtual({
      prestacao_id,
      nome_curatelado,
      ano_inicial: data_inicial,
    });
  }

  prestacoesCuratelado(prestacao) {
    return prestacao.prestacoes;
  }

  onEditarPrestacao(prestacao) {
    this.formService.removePrestacaoStorage();
    this.router.navigate(['cadastro-prestacao', prestacao.prestacao_id]);
  }

  onExcluirPrestacao(prestacao) {
    this.removeModalService
      .open()
      .pipe(first())
      .subscribe((isRemove) => {
        if (isRemove) {
          this.prestacaoService
            .deletePrestacao(prestacao.prestacao_id)
            .pipe(
              // animação de minimize
              mergeMap(() =>
                this.animacoesService.minimize(prestacao.prestacao_id)
              ),
              // fecha o modal
              tap(() => this.removeModalService.fechaModal()),
              // atualiza a lista de prestacoes
              mergeMap(() => this.prestacaoService.fetchPrestacoes()),
              tap((prestacoes) => (this.prestacoes = prestacoes)),
              catchError((error) => {
                this.prestacoes = [];
                this.isLoading = false;
                this.prestacaoService.removePrestacaoAtual(
                  prestacao.prestacao_id
                );
                throw error;
              }),
              tap(() => {
                this.prestacaoService.removePrestacaoAtual(
                  prestacao.prestacao_id
                );
                this.isLoading = false;
              })
            )
            .subscribe();
        } else {
          this.removeModalService.fechaModal();
        }
      });
  }
}
