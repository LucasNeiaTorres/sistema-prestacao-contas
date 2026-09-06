import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaEmDesenvolvimentoComponent } from './pagina-em-desenvolvimento.component';

describe('PaginaEmDesenvolvimentoComponent', () => {
  let component: PaginaEmDesenvolvimentoComponent;
  let fixture: ComponentFixture<PaginaEmDesenvolvimentoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginaEmDesenvolvimentoComponent]
    });
    fixture = TestBed.createComponent(PaginaEmDesenvolvimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
