import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CadastroUsuarioComponent } from './cadastro-usuario/cadastro-usuario.component';
import { CpfCnpjMaskDirective } from './shared/cpf-cnpj-mask.directive';
import { SidebarComponent } from './sidebar/sidebar.component';
import {
  NgbCollapseModule,
  NgbModule,
  NgbScrollSpyModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SelecionarPrestacaoComponent } from './prestacao/selecionar-prestacao/selecionar-prestacao.component';
import { CuradorComponent } from './minha-conta/curador/curador.component';
import { CurateladoComponent } from './minha-conta/curatelado/curatelado.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { CollapseComponent } from './shared/collapse/collapse.component';
import { ListItemComponent } from './shared/list-item/list-item.component';
import { FloatingButtomComponent } from './shared/floating-buttom/floating-buttom.component';
import { OffcanvasComponent } from './shared/offcanvas/offcanvas.component';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { TutorialComponent } from './tutorial/tutorial.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { CadastroCuradorComponent } from './cadastro-curador/cadastro-curador.component';
import { CadastroCurateladoComponent } from './cadastro-curatelado/cadastro-curatelado.component';
import { CadastroPrestacaoComponent } from './prestacao/cadastro-prestacao/cadastro-prestacao.component';
import { FormStorageDirective } from './shared/form-storage.directive';
import { CadastroEnderecoComponent } from './prestacao/cadastro-prestacao/cadastro-endereco/cadastro-endereco.component';
import { CadastroResidentesComponent } from './prestacao/cadastro-prestacao/cadastro-residentes/cadastro-residentes.component';
import ptBr from '@angular/common/locales/pt';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyMaskDirective } from './shared/currency-mask.directive';
import { DespesasComponent } from './despesas/despesas.component';
import { PaginaEmDesenvolvimentoComponent } from './pagina-em-desenvolvimento/pagina-em-desenvolvimento.component';
import { TelaInicialComponent } from './tela-inicial/tela-inicial.component';
import { ContasBancariasComponent } from './contas-bancarias/contas-bancarias.component';
import { BensEDireitosComponent } from './bens-e-direitos/bens-e-direitos.component';
import { TransferenciaEntreContasComponent } from './transferencia-entre-contas/transferencia-entre-contas.component';
import { PendenciasComponent } from './pendencias/pendencias.component';
import { GerarRelatorioComponent } from './gerar-relatorio/gerar-relatorio.component';
import { ToastComponent } from './shared/toast/toast.component';
import { CepMaskDirective } from './shared/cep-mask.directive';
import { RemoveModalComponent } from './shared/remove-modal/remove-modal.component';
import { DropzoneComponent } from './shared/dropzone/dropzone.component';
import { AnexoOpcionalComponent } from './shared/anexo-opcional/anexo-opcional.component';
import { FormsModule } from '@angular/forms';
import { SemReceitasSvgComponent } from './receitas/sem-receitas-svg/sem-receitas-svg.component';
import { TruncateDirective } from './shared/truncate.directive';
import { NovaPrestacaoComponent } from './prestacao/nova-prestacao/nova-prestacao.component';
import { SemPrestacaoSvgComponent } from './prestacao/selecionar-prestacao/sem-prestacao-svg/sem-prestacao-svg.component';

registerLocaleData(ptBr);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CadastroUsuarioComponent,
    CpfCnpjMaskDirective,
    FormStorageDirective,
    SidebarComponent,
    SelecionarPrestacaoComponent,
    CuradorComponent,
    CurateladoComponent,
    ReceitasComponent,
    NavbarComponent,
    CollapseComponent,
    ListItemComponent,
    FloatingButtomComponent,
    OffcanvasComponent,
    TutorialComponent,
    CadastroCuradorComponent,
    CadastroCurateladoComponent,
    CadastroPrestacaoComponent,
    CadastroEnderecoComponent,
    CadastroResidentesComponent,
    CurrencyMaskDirective,
    DespesasComponent,
    PaginaEmDesenvolvimentoComponent,
    TelaInicialComponent,
    ContasBancariasComponent,
    BensEDireitosComponent,
    TransferenciaEntreContasComponent,
    PendenciasComponent,
    GerarRelatorioComponent,
    DropzoneComponent,
    AnexoOpcionalComponent,
    ToastComponent,
    CepMaskDirective,
    RemoveModalComponent,
    SemReceitasSvgComponent,
    TruncateDirective,
    NovaPrestacaoComponent,
    SemPrestacaoSvgComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    NgbCollapseModule,
    ReactiveFormsModule,
    NgbScrollSpyModule,
    NoopAnimationsModule,
    HttpClientModule,
    // material angular modules
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [CurrencyPipe, { provide: LOCALE_ID, useValue: 'pt-BR' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
