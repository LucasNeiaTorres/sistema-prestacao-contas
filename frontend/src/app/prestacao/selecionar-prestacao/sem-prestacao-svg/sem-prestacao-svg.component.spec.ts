import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemPrestacaoSvgComponent } from './sem-prestacao-svg.component';

describe('SemPrestacaoSvgComponent', () => {
  let component: SemPrestacaoSvgComponent;
  let fixture: ComponentFixture<SemPrestacaoSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SemPrestacaoSvgComponent]
    });
    fixture = TestBed.createComponent(SemPrestacaoSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
