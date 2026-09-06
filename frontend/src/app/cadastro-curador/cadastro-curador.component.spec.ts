import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCuradorComponent } from './cadastro-curador.component';

describe('CadastroCuradorComponent', () => {
  let component: CadastroCuradorComponent;
  let fixture: ComponentFixture<CadastroCuradorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroCuradorComponent]
    });
    fixture = TestBed.createComponent(CadastroCuradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
