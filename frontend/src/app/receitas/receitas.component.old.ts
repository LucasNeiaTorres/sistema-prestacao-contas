import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService } from '../sidebar/sidebar.service';
import { Receita } from './receita.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OffcanvasComponent } from '../shared/offcanvas/offcanvas.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-receitas',
  templateUrl: './receitas.component.html.old',
  styleUrls: ['./receitas.component.scss'],
})
export class ReceitasComponent {
  @ViewChild('offcanvas') offcanvas: any;
  @ViewChild('deleteModal') deleteModal: any;

  formReceita: FormGroup;

  receitas: Receita[];
  groupedReceitas: {
    month: string;
    subtotal: number;
    collapsed: boolean;
    receitas: Receita[];
  }[];

  receitaToEdit: Receita | null = null;

  constructor(
    private sidebarService: SidebarService,
    private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.receitas = this.fetchReceitas();
    this.groupedReceitas = this.createGroupedReceitas(this.receitas);

    this.formReceita = this.formBuilder.group({
      descricao: '',
      categoria: '',
      valor: '',
      data: '',
    });
  }

  openOffcanvas() {
    this.offcanvas.openOffcanvas();
  }

  openSidebar() {
    this.sidebarService.openSidebar();
  }

  updateReceita(newReceita: Receita, platform: 'desktop-tablet' | 'mobile') {
    if (this.receitaToEdit) {
      this.receitas = this.receitas.map((receita) =>
        receita.id === newReceita.id ? newReceita : receita
      );
    } else {
      this.receitas.push(newReceita);
    }
    const newGroupedReceitas = this.createGroupedReceitas(this.receitas);
    this.groupedReceitas = newGroupedReceitas.map((group) => {
      return {
        ...group,
        collapsed: this.isCollapsed(group.month),
      };
    });

    setTimeout(() => {
      document
        .getElementById(`${platform}-${newReceita.id}`)
        .scrollIntoView({ behavior: 'smooth', block: 'center' });

      document
        .getElementById(`${platform}-${newReceita.id}`)
        .classList.add('app-flash');

      // Esse timeout é necessário para que a classe seja removida após a animação
      setTimeout(() => {
        document
          .getElementById(`${platform}-${newReceita.id}`)
          .classList.remove('app-flash');
      }, 1500);
      // .classList.add('animate__animated', 'animate__jackInTheBox');
    }, 100);
  }

  isCollapsed(month: string) {
    const group = this.groupedReceitas.find((g) => g.month === month);
    return group ? group.collapsed : false;
  }

  onSubmit() {
    const formData = this.formReceita.value;
    const newReceita = {
      id: this.receitaToEdit ? this.receitaToEdit.id : this.receitas.length + 1,
      descricao: formData.descricao,
      categoria: formData.categoria,
      valor: Number(
        formData.valor.replace('R$', '').replace('.', '').replace(',', '.')
      ),
      data: formData.data,
    };

    // https://getbootstrap.com/docs/5.3/layout/breakpoints/#available-breakpoints
    this.updateReceita(
      newReceita,
      window.innerWidth < 768 ? 'mobile' : 'desktop-tablet'
    );
  }

  editReceita(receita: Receita) {
    this.receitaToEdit = receita;
    this.openOffcanvas();

    this.formReceita.setValue({
      descricao: receita.descricao,
      categoria: receita.categoria,
      valor: this.currencyPipe.transform(receita.valor, 'BRL', 'symbol'),
      data: receita.data,
    });
  }

  modalDeleteReceita(receita: Receita) {
    this.modalService
      .open(this.deleteModal, {
        ariaLabelledBy: 'modal-title',
        modalDialogClass: 'top-25',
      })
      .result.then((result) => {
        if (result === 'Remover') {
          this.offcanvas.closeOffcanvas();
          this.deleteReceita(receita);
        }
      });
  }

  deleteReceita(receita: Receita) {
    const platform = window.innerWidth < 768 ? 'mobile' : 'desktop-tablet';

    document
      .getElementById(`${platform}-${receita.id}`)
      .classList.add('app-minimize');

    setTimeout(() => {
      this.receitas = this.receitas.filter((r) => r.id !== receita.id);
      this.groupedReceitas = this.groupedReceitas.map((group) => {
        group.receitas = group.receitas.filter((r) => r.id !== receita.id);
        group.subtotal = group.receitas.reduce((acc, r) => r.valor + acc, 0);
        return group;
      });

      this.groupedReceitas.forEach((group) => {
        if (group.receitas.length === 0) {
          document
            .getElementById(`group-${group.month}`)
            .classList.add('app-slide-out-right');
        }

        setTimeout(() => {
          this.groupedReceitas = this.groupedReceitas.filter(
            (group) => group.receitas.length > 0
          );
        }, 500);
      });
    }, 300);
  }

  newReceita() {
    this.receitaToEdit = null;
    this.openOffcanvas();
    this.formReceita.reset();
  }

  capitalizeFirstLetter(str: string): string {
    // Check if the string is not empty
    if (str.length === 0) return str;

    // Capitalize the first letter and concatenate it with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  groupByMonthAndYear(receitas: Receita[]): { [key: string]: Receita[] } {
    return receitas.reduce((acc, receita) => {
      const date = new Date(receita.data);
      const month = this.capitalizeFirstLetter(
        date.toLocaleDateString('pt-BR', { month: 'long' })
      );
      const year = date.getFullYear();
      const key = `${month}, ${year}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(receita);
      return acc;
    }, {});
  }

  sortReceitasByDate(receitas: Receita[]): Receita[] {
    return receitas.sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }

  createGroupedReceitas(receitas: Receita[]): {
    month: string;
    subtotal: number;
    collapsed: boolean;
    receitas: Receita[];
  }[] {
    const groupedByMonthAndYear = this.groupByMonthAndYear(receitas);
    const groupedReceitas = Object.keys(groupedByMonthAndYear).map((month) => {
      return {
        month,
        subtotal: groupedByMonthAndYear[month].reduce(
          (acc, receita) => receita.valor + acc,
          0
        ),
        collapsed: false,
        receitas: this.sortReceitasByDate(groupedByMonthAndYear[month]),
      };
    });

    return groupedReceitas.sort((a, b) => {
      return (
        new Date(b.receitas[0].data).getTime() -
        new Date(a.receitas[0].data).getTime()
      );
    });
  }

  receitasTotal() {
    return this.receitas.reduce((acc, receita) => receita.valor + acc, 0);
  }

  fetchReceitas(): Receita[] {
    return [
      {
        id: 1,
        data: '2023-01-16',
        descricao: 'Crédito INSS',
        categoria: 'Benefício Previdenciário',
        valor: 1992.5,
      },
      {
        id: 2,
        data: '2023-01-02',
        descricao: 'Crédito PIX Maria Janete',
        categoria: 'Transferência entre Contas',
        valor: 1387.44,
      },
      {
        id: 3,
        data: '2023-10-05',
        descricao: 'Cred Juros',
        categoria: 'Aplicações Financeiras',
        valor: 180.0,
      },
      {
        id: 4,
        data: '2023-02-10',
        descricao: 'Crédito INSS',
        categoria: 'Benefício Previdenciário',
        valor: 1992.5,
      },
      {
        id: 5,
        data: '2023-02-02',
        descricao: 'Crédito PIX Maria Janete',
        categoria: 'Transferência entre Contas',
        valor: 1387.44,
      },
      {
        id: 6,
        data: '2023-02-05',
        descricao: 'Cred Juros',
        categoria: 'Aplicações Financeiras',
        valor: 180.0,
      },
      {
        id: 7,
        data: '2023-03-10',
        descricao: 'Crédito INSS',
        categoria: 'Benefício Previdenciário',
        valor: 1992.5,
      },
      {
        id: 8,
        data: '2023-03-03',
        descricao: 'Crédito PIX Maria Janete',
        categoria: 'Transferência entre Contas',
        valor: 1387.44,
      },
      {
        id: 9,
        data: '2023-04-10',
        descricao: 'Crédito INSS',
        categoria: 'Benefício Previdenciário',
        valor: 1992.5,
      },
      {
        id: 10,
        data: '2023-10-08',
        descricao: 'Crédito INSS',
        categoria: 'Benefício Previdenciário',
        valor: 1992.5,
      },
    ];
  }
}
