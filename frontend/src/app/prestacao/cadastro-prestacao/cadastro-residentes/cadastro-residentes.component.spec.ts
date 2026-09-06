import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroResidentesComponent } from './cadastro-residentes.component';

describe('CadastroResidentesComponent', () => {
  let component: CadastroResidentesComponent;
  let fixture: ComponentFixture<CadastroResidentesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroResidentesComponent]
    });
    fixture = TestBed.createComponent(CadastroResidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
