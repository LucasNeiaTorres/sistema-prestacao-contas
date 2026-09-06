import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuradorComponent } from './curador.component';

describe('CuradorComponent', () => {
  let component: CuradorComponent;
  let fixture: ComponentFixture<CuradorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CuradorComponent]
    });
    fixture = TestBed.createComponent(CuradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
