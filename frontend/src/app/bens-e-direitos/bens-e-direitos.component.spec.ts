import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BensEDireitosComponent } from './bens-e-direitos.component';

describe('BensEDireitosComponent', () => {
  let component: BensEDireitosComponent;
  let fixture: ComponentFixture<BensEDireitosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BensEDireitosComponent]
    });
    fixture = TestBed.createComponent(BensEDireitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
