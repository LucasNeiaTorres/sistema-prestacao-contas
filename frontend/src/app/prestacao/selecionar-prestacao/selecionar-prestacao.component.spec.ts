import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecionarPrestacaoComponent } from './selecionar-prestacao.component';

describe('SelecionarPrestacaoComponent', () => {
  let component: SelecionarPrestacaoComponent;
  let fixture: ComponentFixture<SelecionarPrestacaoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelecionarPrestacaoComponent]
    });
    fixture = TestBed.createComponent(SelecionarPrestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
