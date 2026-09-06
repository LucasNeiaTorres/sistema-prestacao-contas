import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurateladoComponent } from './curatelado.component';

describe('CurateladoComponent', () => {
  let component: CurateladoComponent;
  let fixture: ComponentFixture<CurateladoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurateladoComponent]
    });
    fixture = TestBed.createComponent(CurateladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
