import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelecionarPrestacaoComponent } from './prestacao/selecionar-prestacao/selecionar-prestacao.component';
import { CuradorComponent } from './minha-conta/curador/curador.component';
import { CurateladoComponent } from './minha-conta/curatelado/curatelado.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { CadastroCuradorComponent } from './cadastro-curador/cadastro-curador.component';
import { CadastroCurateladoComponent } from './cadastro-curatelado/cadastro-curatelado.component';
import { CadastroPrestacaoComponent } from './prestacao/cadastro-prestacao/cadastro-prestacao.component';
import { CadastroEnderecoComponent } from './prestacao/cadastro-prestacao/cadastro-endereco/cadastro-endereco.component';
import { CadastroResidentesComponent } from './prestacao/cadastro-prestacao/cadastro-residentes/cadastro-residentes.component';
import { TelaInicialComponent } from './tela-inicial/tela-inicial.component';
import { LoginComponent } from './login/login.component';
import { CadastroUsuarioComponent } from './cadastro-usuario/cadastro-usuario.component';
import { ContasBancariasComponent } from './contas-bancarias/contas-bancarias.component';
import { DespesasComponent } from './despesas/despesas.component';
import { TransferenciaEntreContasComponent } from './transferencia-entre-contas/transferencia-entre-contas.component';
import { PendenciasComponent } from './pendencias/pendencias.component';
import { BensEDireitosComponent } from './bens-e-direitos/bens-e-direitos.component';
import { GerarRelatorioComponent } from './gerar-relatorio/gerar-relatorio.component';
import { NovaPrestacaoComponent } from './prestacao/nova-prestacao/nova-prestacao.component';

const routes: Routes = [
  { path: 'inicio', component: TelaInicialComponent },
  { path: 'selecionar-prestacao', component: SelecionarPrestacaoComponent },
  {
    path: 'cadastro-prestacao',
    component: NovaPrestacaoComponent,
    children: [
      { path: 'nova', component: NovaPrestacaoComponent },
      { path: ':id', component: NovaPrestacaoComponent },
      { path: '', redirectTo: '/prestacao/nova', pathMatch: 'full' },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro-usuario', component: CadastroUsuarioComponent },
  {
    path: 'curador',
    component: CuradorComponent,
    children: [
      { path: 'novo', component: CadastroCuradorComponent },
      { path: ':id', component: CadastroCuradorComponent },
      { path: '', redirectTo: '/curador/novo', pathMatch: 'full' },
    ],
  },
  {
    path: 'curatelado',
    component: CurateladoComponent,
    children: [
      { path: 'novo', component: CadastroCurateladoComponent },
      { path: ':id', component: CadastroCurateladoComponent },
      { path: '', redirectTo: '/curatelado/novo', pathMatch: 'full' },
    ],
  },
  { path: 'contas-bancarias', component: ContasBancariasComponent },
  { path: 'receitas', component: ReceitasComponent },
  { path: 'despesas', component: DespesasComponent },
  { path: 'bens-e-direitos', component: BensEDireitosComponent },
  {
    path: 'transferencia-entre-contas',
    component: TransferenciaEntreContasComponent,
  },
  { path: 'pendencias', component: PendenciasComponent },
  { path: 'gerar-relatorio', component: GerarRelatorioComponent },
  {
    path: 'tutorial',
    component: TutorialComponent,
    children: [
      { path: '', component: CadastroCuradorComponent },
      { path: '1', component: CadastroCuradorComponent },
      { path: '2', component: CadastroCurateladoComponent },
      { path: '3', component: CadastroPrestacaoComponent },
      { path: '4', component: CadastroEnderecoComponent },
      { path: '5', component: CadastroResidentesComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
