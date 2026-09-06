import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemReceitasSvgComponent } from './sem-receitas-svg.component';

describe('SemReceitasSvgComponent', () => {
  let component: SemReceitasSvgComponent;
  let fixture: ComponentFixture<SemReceitasSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SemReceitasSvgComponent]
    });
    fixture = TestBed.createComponent(SemReceitasSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
