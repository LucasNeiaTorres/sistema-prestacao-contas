import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexoOpcionalComponent } from './anexo-opcional.component';

describe('AnexoOpcionalComponent', () => {
  let component: AnexoOpcionalComponent;
  let fixture: ComponentFixture<AnexoOpcionalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnexoOpcionalComponent]
    });
    fixture = TestBed.createComponent(AnexoOpcionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
