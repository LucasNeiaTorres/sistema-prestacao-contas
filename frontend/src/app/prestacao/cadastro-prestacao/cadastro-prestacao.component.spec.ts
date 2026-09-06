import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroPrestacaoComponent } from './cadastro-prestacao.component';

describe('CadastroPrestacaoComponent', () => {
  let component: CadastroPrestacaoComponent;
  let fixture: ComponentFixture<CadastroPrestacaoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroPrestacaoComponent]
    });
    fixture = TestBed.createComponent(CadastroPrestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
