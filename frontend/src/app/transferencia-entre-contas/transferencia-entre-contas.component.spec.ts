import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferenciaEntreContasComponent } from './transferencia-entre-contas.component';

describe('TransferenciaEntreContasComponent', () => {
  let component: TransferenciaEntreContasComponent;
  let fixture: ComponentFixture<TransferenciaEntreContasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferenciaEntreContasComponent]
    });
    fixture = TestBed.createComponent(TransferenciaEntreContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
