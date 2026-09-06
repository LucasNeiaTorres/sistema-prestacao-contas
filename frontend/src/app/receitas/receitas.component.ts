import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService } from '../sidebar/sidebar.service';
import {
  Receita,
  ReceitaCategoria,
  ReceitaPorPrestacao,
} from './receita.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ReceitasService } from './receitas.service';
import {
  combineLatest,
  concat,
  concatMap,
  of,
  switchMap as mergeMap,
  timer,
  tap,
  filter,
  first,
  interval,
  delay,
  iif,
  Subject,
  catchError,
} from 'rxjs';
import { PrestacaoService } from '../prestacao/prestacao.service';
import { AnimacoesService } from '../shared/animacoes/animacoes.service';
import { DropzoneOptionsInterface } from '../shared/dropzone/dropzone-options.interface';
import { AnexoOpcionalComponent } from '../shared/anexo-opcional/anexo-opcional.component';
import { DropzoneComponent } from '../shared/dropzone/dropzone.component';
import { DropzoneControl } from '../shared/dropzone/dropzone-control.class';
import { OffcanvasComponent } from '../shared/offcanvas/offcanvas.component';
import { ToastService } from '../shared/toast/toast.service';
import { validarData } from '../shared/validators.service';

interface ReceitaOffcanvasEstado {
  modo: 'novo' | 'editar';
  form?: FormGroup;
  receita?: Receita;
  dropzoneControl: DropzoneControl;
  justificativa?: string;
  hasAnexo: boolean;
  dirty: boolean;
}

interface LoadingEstado {
  isFetchingInitialReceitas: boolean;
  isSavingReceita: boolean;
  isDeletingReceita: boolean;
}

// TODO:
// Colapsavel dos meses
// Loading de coisas
// Tratamento de erros
@Component({
  selector: 'app-receitas',
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.scss'],
})
export class ReceitasComponent {
  @ViewChild('offcanvas') offcanvas: OffcanvasComponent;
  @ViewChild('deleteModal') deleteModal: any;
  @ViewChild('warningModal') warningModal: any;

  loading: LoadingEstado = {
    isFetchingInitialReceitas: false,
    isSavingReceita: false,
    isDeletingReceita: false,
  };

  estadoReceitaOffcanvas: ReceitaOffcanvasEstado = {
    modo: 'novo',
    dropzoneControl: new DropzoneControl({
      url: '#',
      acceptedFiles: 'image/jpeg, image/png, application/pdf',
      maxFilesize: 20,
      autoProcessQueue: false,
      parallelUploads: 1,
      dictInvalidFileType: 'Tipo de arquivo inválido',
      dictFileTooBig: 'Arquivo muito grande (máx. 20 MB)',
    }),
    dirty: false,
    hasAnexo: true,
  };
  receitas: ReceitaPorPrestacao;
  categorias: ReceitaCategoria[];
  collapsedMeses: { [key: string]: boolean } = {};
  modalCloseProxy = new Subject<'Prosseguir' | 'Cancelar'>();

  anexosDropzoneId = 'anexosReceita';

  constructor(
    private sidebarService: SidebarService,
    private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private modalService: NgbModal,
    private receitasService: ReceitasService,
    private prestacaoService: PrestacaoService,
    private animacoesService: AnimacoesService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loading.isFetchingInitialReceitas = true;
    combineLatest([
      this.receitasService.fetchReceitas(),
      this.receitasService.fetchReceitaCategorias(),
    ])
      .pipe(first())
      .subscribe(([receitas, categorias]) => {
        this.receitas = receitas;
        this.categorias = categorias;
        this.collapsedMeses = receitas.meses.reduce(
          (acc, mes) => ({ ...acc, [mes.mes]: false }),
          {}
        );
        this.loading.isFetchingInitialReceitas = false;
      });

    this.estadoReceitaOffcanvas.form = this.formBuilder.group({
      descricao: [
        '',
        { validators: [Validators.required], updateOn: 'change' },
      ],
      categoria: [
        '',
        { validators: [Validators.required], updateOn: 'change' },
      ],
      valor: ['', { validators: [Validators.required], updateOn: 'change' }],
      data: [
        new Date().toISOString().split('T')[0],
        {
          validators: [Validators.required, validarData],
          updateOn: 'change',
          nonNullable: true,
        },
      ],
    });
  }

  openOffcanvas() {
    this.offcanvas.open({
      beforeDismiss: () => {
        if (
          !this.estadoReceitaOffcanvas.dirty &&
          !this.estadoReceitaOffcanvas.form.dirty
        ) {
          return true;
        }

        const activeModal = this.modalService.open(this.warningModal, {
          ariaLabelledBy: 'modal-title',
          modalDialogClass: 'top-25',
        });

        // todo user can dismiss the modal. If tou want to wait for the modal to close, it is complex
        this.modalCloseProxy
          .pipe(
            mergeMap((result) => {
              if (result === 'Prosseguir') {
                return of(null).pipe(
                  tap(() => activeModal.close('Prosseguir')),
                  tap(() => this.offcanvas.close()),
                  first()
                );
              }
              // If the result is not 'Prosseguir', we return an empty observable
              return of(null).pipe(tap(() => activeModal.close('Cancelar')));
            }),
            first()
          )
          .subscribe();

        return false;
      },
    });
  }

  openSidebar() {
    this.sidebarService.openSidebar();
  }

  onNewReceita() {
    this.estadoReceitaOffcanvas = {
      modo: 'novo',
      form: this.estadoReceitaOffcanvas.form,
      receita: null,
      dropzoneControl: this.estadoReceitaOffcanvas.dropzoneControl,
      dirty: false,
      hasAnexo: true,
    };
    this.estadoReceitaOffcanvas.form.reset();
    this.estadoReceitaOffcanvas.dropzoneControl.reset();
    this.estadoReceitaOffcanvas.dropzoneControl.options.url = '#';

    const dropzoneControl = this.estadoReceitaOffcanvas.dropzoneControl;
    const dropzoneFileToAnexoIdMap: Map<any, number> = new Map();

    const subsSucc = dropzoneControl.success().subscribe(([file, response]) => {
      const anexoId = response.id;
      dropzoneFileToAnexoIdMap.set(file, anexoId);
    });

    const subsAdd = dropzoneControl.addedFile().subscribe((file) => {
      this.estadoReceitaOffcanvas.dirty = true;
    });

    const subsRem = dropzoneControl.removedFile().subscribe((file) => {
      if (file.status === 'success') {
        const anexoId = dropzoneFileToAnexoIdMap.get(file);
        this.receitasService.scheduleDeleteAnexo(
          this.estadoReceitaOffcanvas.receita,
          anexoId
        );
        this.estadoReceitaOffcanvas.dirty = true;
      }
    });

    this.openOffcanvas();

    this.offcanvas.shown.pipe(first()).subscribe(() => {
      this.estadoReceitaOffcanvas.dirty = false;
    });

    this.offcanvas.hidden.pipe(first()).subscribe(() => {
      this.estadoReceitaOffcanvas.dropzoneControl.reset();
      this.receitasService.emptyDeleteAnexoQueue();
      subsSucc.unsubscribe();
      subsRem.unsubscribe();
      subsAdd.unsubscribe();
    });
  }

  onEditReceita(receita: Receita) {
    this.estadoReceitaOffcanvas = {
      ...this.estadoReceitaOffcanvas,
      modo: 'editar',
      receita: receita,
    };
    this.estadoReceitaOffcanvas.form.setValue({
      descricao: receita.descricao,
      categoria: receita.receita_categoria_id,
      valor: this.currencyPipe.transform(receita.valor, 'BRL', 'symbol'),
      data: new Date(receita.data).toISOString().split('T')[0],
    });
    this.estadoReceitaOffcanvas.form.markAsPristine();
    this.estadoReceitaOffcanvas.dropzoneControl.options.url =
      this.receitasService.getAnexoUrl(receita);

    const dropzoneControl = this.estadoReceitaOffcanvas.dropzoneControl;
    const dropzoneFileToAnexoIdMap: Map<any, number> = new Map();

    const subsSucc = dropzoneControl.success().subscribe(([file, response]) => {
      const anexoId = response.id;
      dropzoneFileToAnexoIdMap.set(file, anexoId);
    });

    const subsAdd = dropzoneControl.addedFile().subscribe((file) => {
      this.estadoReceitaOffcanvas.dirty = true;
    });

    const subsRem = dropzoneControl.removedFile().subscribe((file) => {
      if (file.status === 'success') {
        const anexoId = dropzoneFileToAnexoIdMap.get(file);
        this.receitasService.scheduleDeleteAnexo(receita, anexoId);
        this.estadoReceitaOffcanvas.dirty = true;
      }
    });

    for (const anexo of receita.anexos) {
      const fakeFile = dropzoneControl.addFakeFile({
        name: anexo.filename_user,
        size: anexo.size,
        type: anexo.content_type,
      });
      dropzoneControl.simulateSuccess(fakeFile, { id: anexo.receita_anexo_id });
    }

    this.estadoReceitaOffcanvas.hasAnexo = !!receita.anexos.length;
    this.estadoReceitaOffcanvas.justificativa = receita.justificativa;
    this.openOffcanvas();

    this.offcanvas.shown.pipe(first()).subscribe(() => {
      this.estadoReceitaOffcanvas.dirty = false;
    });

    this.offcanvas.hidden.pipe(first()).subscribe(() => {
      this.estadoReceitaOffcanvas.dropzoneControl.reset();
      this.receitasService.emptyDeleteAnexoQueue();
      subsSucc.unsubscribe();
      subsRem.unsubscribe();
      subsAdd.unsubscribe();
    });
  }

  onSaveReceita() {
    const form = this.estadoReceitaOffcanvas.form;

    if (form.invalid) {
      this.toastService.addToast(
        'Por favor, preencha todos os campos corretamente.',
        'danger'
      );
      return;
    }

    if (this.estadoReceitaOffcanvas.hasAnexo) {
      this.saveWithAnexo();
    } else {
      this.saveWithJustificativa();
    }
  }

  saveWithAnexo() {
    const form = this.estadoReceitaOffcanvas.form;
    const modo = this.estadoReceitaOffcanvas.modo;
    const receita = {
      ...this.estadoReceitaOffcanvas.receita,
      descricao: form.value.descricao,
      receita_categoria_id: form.value.categoria,
      valor: form.value.valor
        .replaceAll('R$', '')
        .replaceAll('.', '')
        .replaceAll(',', '.'),
      data: form.value.data,
      // TODO: tirar esse ?? 1
      prestacao_id:
        this.prestacaoService.getPrestacaoAtual()?.prestacao_id ?? 7,
      justificativa: null,
    };

    if (this.estadoReceitaOffcanvas.dropzoneControl.getInvalidFiles().length) {
      this.toastService.addToast(
        'Existem anexos inválidos. Por favor, remova-os e tente novamente.',
        'danger'
      );
      return;
    }

    if (
      this.estadoReceitaOffcanvas.dropzoneControl.getQueuedFiles().length ===
        0 &&
      this.estadoReceitaOffcanvas.dropzoneControl.getSucceededFiles().length ===
        0
    ) {
      this.toastService.addToast(
        'Por favor, adicione pelo menos um anexo.',
        'danger'
      );
      return;
    }

    let updatedReceita: Receita;
    of(null)
      .pipe(
        tap(() => (this.loading.isSavingReceita = true)),
        mergeMap(() =>
          modo === 'novo'
            ? this.receitasService.createReceita(receita)
            : this.receitasService.updateReceita(receita)
        ),
        tap((receita) => (updatedReceita = receita)),
        tap(() => (this.estadoReceitaOffcanvas.receita = updatedReceita)),
        tap(() => (this.estadoReceitaOffcanvas.modo = 'editar')),
        tap(
          () =>
            (this.estadoReceitaOffcanvas.dropzoneControl.options.url =
              this.receitasService.getAnexoUrl(updatedReceita))
        ),
        mergeMap(() =>
          this.receitasService.uploadAnexos(
            this.estadoReceitaOffcanvas.dropzoneControl
          )
        ),
        mergeMap(() => this.receitasService.deleteScheduledAnexos()),
        mergeMap(() => {
          if (
            this.estadoReceitaOffcanvas.dropzoneControl.getInvalidFiles().length
          ) {
            this.toastService.addToast(
              'Existem anexos inválidos. Por favor, remova-os e tente novamente.',
              'danger'
            );
            this.loading.isSavingReceita = false;
            return of(null);
          } else {
            return this.receitasService.fetchReceitas().pipe(
              tap((receitas) => (this.receitas = receitas)),
              tap(() => (this.loading.isSavingReceita = false)),
              tap(() => (this.estadoReceitaOffcanvas.dirty = false)),
              tap(() => this.offcanvas.close()),
              mergeMap(() => this.offcanvas.hidden),
              mergeMap(() => this.animateReceitaUpdate(updatedReceita)),
              first()
            );
          }
        }),
        catchError((err) => {
          this.toastService.addToast(
            'Ocorreu um erro ao se comunicar com o servidor. Por favor, tente novamente mais tarde.',
            'danger'
          );
          this.loading.isSavingReceita = false;
          throw err;
        })
      )
      .subscribe();
  }

  saveWithJustificativa() {
    const form = this.estadoReceitaOffcanvas.form;
    const modo = this.estadoReceitaOffcanvas.modo;
    const receita = {
      ...this.estadoReceitaOffcanvas.receita,
      descricao: form.value.descricao,
      receita_categoria_id: form.value.categoria,
      valor: form.value.valor
        .replaceAll('R$', '')
        .replaceAll('.', '')
        .replaceAll(',', '.'),
      data: form.value.data,
      // TODO: tirar esse ?? 1
      prestacao_id:
        this.prestacaoService.getPrestacaoAtual()?.prestacao_id ?? 1,
      justificativa: this.estadoReceitaOffcanvas.justificativa,
    };
    const justificativa = this.estadoReceitaOffcanvas.justificativa;

    if (!justificativa) {
      this.toastService.addToast(
        'Por favor, preencha a justificativa.',
        'danger'
      );
      return;
    }

    let updatedReceita: Receita;
    of(null)
      .pipe(
        tap(() => (this.loading.isSavingReceita = true)),
        mergeMap(() =>
          modo === 'novo'
            ? this.receitasService.createReceita(receita)
            : this.receitasService.updateReceita(receita)
        ),
        tap((receita) => (updatedReceita = receita)),
        tap(() => (this.estadoReceitaOffcanvas.receita = updatedReceita)),
        tap(() => (this.estadoReceitaOffcanvas.modo = 'editar')),
        tap(
          () =>
            (this.estadoReceitaOffcanvas.dropzoneControl.options.url =
              this.receitasService.getAnexoUrl(updatedReceita))
        ),
        tap(() => this.estadoReceitaOffcanvas.dropzoneControl.reset()),
        mergeMap(() =>
          this.estadoReceitaOffcanvas.dropzoneControl.removedAll()
        ),
        mergeMap(() => this.receitasService.deleteScheduledAnexos()),
        mergeMap(() => this.receitasService.fetchReceitas()),
        tap((receitas) => (this.receitas = receitas)),
        tap(() => (this.loading.isSavingReceita = false)),
        tap(() => (this.estadoReceitaOffcanvas.dirty = false)),
        tap(() => this.offcanvas.close()),
        mergeMap(() => this.offcanvas.hidden),
        mergeMap(() => this.animateReceitaUpdate(updatedReceita)),
        first(),
        catchError((err) => {
          this.toastService.addToast(
            'Ocorreu um erro ao se comunicar com o servidor. Por favor, tente novamente mais tarde.',
            'danger'
          );
          this.loading.isSavingReceita = false;
          throw err;
        })
      )
      .subscribe();
  }

  onDeleteReceita(receita: Receita) {
    const activeModal = this.modalService.open(this.deleteModal, {
      ariaLabelledBy: 'modal-title',
      modalDialogClass: 'top-25',
    });

    // todo user can dismiss the modal. If tou want to wait for the modal to close, it is complex
    this.modalCloseProxy
      .pipe(
        mergeMap((result) => {
          if (result === 'Prosseguir') {
            return of(null).pipe(
              tap(() => (this.loading.isDeletingReceita = true)),
              mergeMap(() => this.receitasService.deleteReceita(receita)),
              tap(() => activeModal.close('Prosseguir')),
              tap(() => this.offcanvas.close()),
              mergeMap(() => this.animateReceitaDeletion(receita)),
              mergeMap(() => this.receitasService.fetchReceitas()),
              tap((receitas) => (this.receitas = receitas)),
              tap(() => (this.loading.isDeletingReceita = false)),
              first()
            );
          }
          // If the result is not 'Prosseguir', we return an empty observable
          return of(null).pipe(tap(() => activeModal.close('Cancelar')));
        }),
        first()
      )
      .subscribe();
  }

  onJustificativaChange(justificativa: string) {
    this.estadoReceitaOffcanvas.justificativa = justificativa;
    this.estadoReceitaOffcanvas.dirty = true;
  }

  onHasAnexoChange(hasAnexo: boolean) {
    this.estadoReceitaOffcanvas.hasAnexo = hasAnexo;
    this.estadoReceitaOffcanvas.dirty = true;
  }

  onCloseModal(reason: 'Prosseguir' | 'Cancelar') {
    this.modalCloseProxy.next(reason);
  }

  animateReceitaDeletion(receita: Receita) {
    const platform = window.innerWidth < 768 ? 'mobile' : 'desktop-tablet';
    const receitaHTMLId = `${platform}-${receita.receita_id}`;

    const month = this.getMonthFromReceita(receita);
    const groupHTMLId = `group-${month.mes}`;

    const isLastItem = month.items.length === 1;

    return of(null).pipe(
      mergeMap(() => this.animacoesService.minimize(receitaHTMLId)),
      mergeMap(() =>
        isLastItem ? this.animacoesService.slideOutRight(groupHTMLId) : of(null)
      )
    );
  }

  animateReceitaUpdate(receita: Receita) {
    const platform = window.innerWidth < 768 ? 'mobile' : 'desktop-tablet';
    const receitaHTMLId = `${platform}-${receita.receita_id}`;

    const month = this.getMonthFromReceita(receita);
    const wasMonthCollapsed = !!this.collapsedMeses[month.mes];

    return of(null).pipe(
      // abre o colapsável do mes
      tap(() => (this.collapsedMeses[month.mes] = false)),
      // enquanto está abrindo o colapsável nao tem como dar o scroll, entao esperamos
      mergeMap(() => (wasMonthCollapsed ? timer(300) : of(null))),
      mergeMap(() => this.animacoesService.scrollIntoView(receitaHTMLId)),
      mergeMap(() => this.animacoesService.flash(receitaHTMLId))
    );
  }

  getCategoriaName(id: number) {
    return this.categorias.find(
      (categoria) => categoria.receita_categoria_id === id
    )?.receita_categoria;
  }

  getMonthFromReceita(receita: Receita) {
    return this.receitas.meses.find((mes) =>
      mes.items.some((item) => item.receita_id === receita.receita_id)
    );
  }
}
