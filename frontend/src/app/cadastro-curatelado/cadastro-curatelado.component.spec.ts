import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCurateladoComponent } from './cadastro-curatelado.component';

describe('CadastroCurateladoComponent', () => {
  let component: CadastroCurateladoComponent;
  let fixture: ComponentFixture<CadastroCurateladoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroCurateladoComponent]
    });
    fixture = TestBed.createComponent(CadastroCurateladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
