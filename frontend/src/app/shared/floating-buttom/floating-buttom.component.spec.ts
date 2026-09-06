import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingButtomComponent } from './floating-buttom.component';

describe('FloatingButtomComponent', () => {
  let component: FloatingButtomComponent;
  let fixture: ComponentFixture<FloatingButtomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FloatingButtomComponent]
    });
    fixture = TestBed.createComponent(FloatingButtomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
