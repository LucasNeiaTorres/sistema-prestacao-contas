import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovaPrestacaoComponent } from './nova-prestacao.component';

describe('NovaPrestacaoComponent', () => {
  let component: NovaPrestacaoComponent;
  let fixture: ComponentFixture<NovaPrestacaoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NovaPrestacaoComponent]
    });
    fixture = TestBed.createComponent(NovaPrestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
